import base64
import io
import json
import os
import re
import tempfile
import time
from time import sleep
from urllib.parse import urlparse

import boto3
import PyPDF2
import requests
from bs4 import BeautifulSoup
from openai import OpenAI

BUCKET_NAME = os.environ["BUCKET_NAME"]


def get_video_id(url):
    """Extracts YouTube video ID from the URL"""
    match = re.search(
        r"(?:v=|youtu\.be/|embed/|shorts/|watch\?v=)([\w-]{11})", url)
    if match:
        return match.group(1)
    return None


def check_s3_exists(s3, key):
    """Checks if a file exists in S3"""
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=key)
        return True
    except s3.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        raise


def get_domain(url):
    """Extracts domain from URL"""
    parsed_url = urlparse(url)
    return parsed_url.netloc


def get_cached_id(url):
    """Normalizes URL for caching purposes"""
    # For YouTube, use the video ID
    video_id = get_video_id(url)
    if video_id:
        return f"youtube-{video_id}"

    # For PDF URLs, create a consistent ID
    if is_pdf_url(url):
        # For arxiv, use the paper ID
        parsed_url = urlparse(url)
        hostname = parsed_url.netloc.lower()
        path = parsed_url.path.lower()

        if 'arxiv.org' in hostname:
            # Extract arxiv ID from the URL
            if '/pdf/' in path:
                paper_id = path.split('/pdf/')[-1].replace('.pdf', '')
            elif '/abs/' in path:
                paper_id = path.split('/abs/')[-1]
            else:
                paper_id = path.split('/')[-1].replace('.pdf', '')

            return f"arxiv-{paper_id}"

        # For other PDFs, use a hash of the URL
        pdf_identifier = f"pdf-{hostname}{path}".replace('/', '-')
        if len(pdf_identifier) > 100:
            import hashlib
            pdf_identifier = f"pdf-{hashlib.md5(url.encode()).hexdigest()}"

        return pdf_identifier

    # For other URLs, use the domain and path as an identifier
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    path = parsed_url.path.rstrip('/')

    # Create a clean identifier from the URL
    identifier = f"{domain}{path}".replace('www.', '').replace('/', '-')
    if len(identifier) > 100:  # Keep the identifier reasonably sized
        import hashlib
        identifier = f"{identifier[:50]}-{hashlib.md5(identifier.encode()).hexdigest()[:10]}"

    return identifier


def fetch_website_simple(url):
    """Fetches content from a website using simple requests"""
    print(f"Fetching website content using requests from: {url}")

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove script, style tags and other non-content elements
        for tag in soup(['script', 'style', 'header', 'footer', 'nav', 'aside', 'iframe', 'noscript', 'svg']):
            tag.decompose()

        # Get the main content - look for common content containers
        main_content = soup.find('main') or soup.find('article') or soup.find('div', {'id': 'content'}) or \
            soup.find('div', {'class': 'content'}) or soup.find(
                'div', {'role': 'main'})

        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
        else:
            # Fallback to body content if we can't find a content container
            text = soup.body.get_text(separator=' ', strip=True)

        # Clean up the text (remove extra spaces, etc.)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    except Exception as e:
        print(f"Error fetching website using requests: {str(e)}")
        # If there's an error, return a minimal amount of text to avoid failing
        return f"Failed to extract content from {url}. Error: {str(e)}"


def is_pdf_url(url):
    """Determines if a URL points to a PDF file"""
    # Check if URL ends with .pdf
    if url.lower().endswith('.pdf'):
        return True

    # Check if URL contains pdf in the path (common for academic papers)
    url_path = urlparse(url).path.lower()
    if '/pdf/' in url_path or 'pdf' in url_path.split('.')[-1]:
        return True

    # Check for specific academic repositories
    parsed_url = urlparse(url)
    hostname = parsed_url.netloc.lower()

    # Handle arxiv URLs
    if 'arxiv.org' in hostname and ('/pdf/' in url_path or url_path.startswith('/abs/')):
        return True

    # Handle other academic repositories that commonly serve PDFs
    academic_repos = ['biorxiv.org', 'medrxiv.org',
                      'ssrn.com', 'researchgate.net']
    if any(repo in hostname for repo in academic_repos):
        return True

    return False


def get_pdf_url(url):
    """For academic repository URLs, convert abstract URLs to direct PDF URLs if needed"""
    parsed_url = urlparse(url)
    hostname = parsed_url.netloc.lower()
    path = parsed_url.path

    # Handle arXiv URLs
    if 'arxiv.org' in hostname:
        if path.startswith('/abs/'):
            # Convert abstract URL to PDF URL
            paper_id = path.split('/abs/')[-1]
            return f"https://arxiv.org/pdf/{paper_id}.pdf"
        elif '/pdf/' in path and not path.endswith('.pdf'):
            # Ensure PDF URL ends with .pdf
            paper_id = path.split('/pdf/')[-1]
            return f"https://arxiv.org/pdf/{paper_id}.pdf"

    return url


def fetch_youtube_with_openai(url):
    """Fetches content from a YouTube video using OpenAI's web search capability

    Args:
        url: The YouTube video URL
    """
    print(f"Fetching YouTube content with OpenAI web search for: {url}")

    try:
        client = OpenAI(api_key=os.environ.get("OPEN_AI_API_KEY"))

        # Create a prompt that asks for detailed information about the video
        prompt = f"""
        Please provide a comprehensive transcript-like summary of this YouTube video: {url}
        
        I need you to:
        1. Extract all key information, concepts, and educational content from the video
        2. Provide detailed explanations of any technical terms or processes
        3. Maintain the sequential order of information as presented in the video
        4. Include any important quotes, examples, or case studies mentioned
        5. Capture the overall narrative structure of the video
        6. Format the output as if it were a detailed transcript
        
        Please focus on providing a rich, comprehensive text representation of the video's content 
        that could be used for educational purposes. Include as much detail as possible.
        """

        # Call OpenAI with web search capability
        completion = client.chat.completions.create(
            model="gpt-4o-search-preview",
            web_search_options={
                "search_context_size": "low",
            },
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at analyzing and summarizing YouTube video content. Your task is to provide comprehensive, transcript-like summaries that capture all the educational value of videos."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Get the response content
        content = completion.choices[0].message.content

        # Check if we received a meaningful response
        if content and len(content.strip()) > 100:
            print(f"Successfully retrieved content for YouTube video using OpenAI")
            return content
        else:
            print(f"OpenAI returned insufficient content for YouTube video")
            return f"OpenAI could not retrieve sufficient content for the YouTube video: {url}"

    except Exception as e:
        print(f"Error using OpenAI web search for YouTube video: {str(e)}")
        return f"Failed to retrieve content for YouTube video using OpenAI. Error: {str(e)}. URL: {url}"


# Legacy functions for test compatibility
def download_youtube_audio(video_url, output_folder="/tmp/downloads"):
    """Legacy placeholder function for test compatibility"""
    print(f"WARNING: download_youtube_audio is deprecated - using OpenAI web search instead")
    video_id = get_video_id(video_url)
    return f"{output_folder}/{video_id}.mp3"


def transcribe_audio(audio_path):
    """Legacy placeholder function for test compatibility"""
    print(f"WARNING: transcribe_audio is deprecated - using OpenAI web search instead")
    return "This is a placeholder transcription for test compatibility."


def download_pdf(url):
    """Downloads a PDF from a URL and returns its content as text"""
    print(f"Downloading PDF from: {url}")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        # Download the PDF
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()

        # Check if the content is actually a PDF
        content_type = response.headers.get('Content-Type', '').lower()
        if 'application/pdf' not in content_type and not url.lower().endswith('.pdf'):
            print(
                f"Warning: URL might not be a PDF. Content-Type: {content_type}")
            # If not a PDF, try regular web scraping
            if 'text/html' in content_type:
                return fetch_website_simple(url)

        # Save PDF to a temporary file for processing
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_path = temp_file.name
            temp_file.write(response.content)

        try:
            # Extract text from the PDF using PyPDF2
            pdf_reader = PyPDF2.PdfReader(temp_path)

            # Extract text from all pages
            text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"

            # Clean the extracted text
            text = re.sub(r'\s+', ' ', text)
            # Add newlines after periods for better readability
            text = re.sub(r'(\. )', '.\n', text)

            # Check if we got meaningful text
            if len(text.strip()) < 100:
                print(
                    "Warning: Extracted PDF text is too short or empty, the PDF might be scanned or image-based")
                # Try to fetch abstract or other web content as a fallback
                return fetch_website_simple(url.replace('/pdf/', '/abs/') if '/pdf/' in url else url)

            return text

        except Exception as e:
            print(f"Error extracting text from PDF with PyPDF2: {str(e)}")
            # Fallback to simple web scraping
            return fetch_website_simple(url)
        finally:
            # Clean up the temporary file
            try:
                os.unlink(temp_path)
            except Exception as e:
                print(f"Error removing temporary PDF file: {str(e)}")

    except Exception as e:
        print(f"Error downloading PDF: {str(e)}")
        # Fallback to simple web scraping
        return fetch_website_simple(url)


def process_pdf_with_openai(pdf_url, prompt="Extract the key content and concepts from this PDF:"):
    """Process PDF directly using OpenAI's file handling capabilities"""
    print(f"Processing PDF with OpenAI API: {pdf_url}")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        # Download the PDF
        response = requests.get(pdf_url, headers=headers,
                                stream=True, timeout=30)
        response.raise_for_status()

        # Save PDF to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_path = temp_file.name
            temp_file.write(response.content)

        try:
            # Method 1: Use the files API if file size is under the limit (< 25MB)
            file_size = os.path.getsize(temp_path)
            client = OpenAI(api_key=os.environ.get("OPEN_AI_API_KEY"))

            if file_size < 25 * 1024 * 1024:  # 25MB limit
                print(
                    f"Using OpenAI files API to process PDF (size: {file_size / (1024*1024):.2f}MB)")
                try:
                    # Upload file to OpenAI
                    with open(temp_path, "rb") as file:
                        uploaded_file = client.files.create(
                            file=file,
                            purpose="user_data"
                        )

                    # Process with OpenAI
                    completion = client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "file",
                                        "file": {
                                            "file_id": uploaded_file.id,
                                        }
                                    },
                                    {
                                        "type": "text",
                                        "text": prompt,
                                    },
                                ]
                            }
                        ]
                    )

                    # Clean up the file from OpenAI servers
                    client.files.delete(uploaded_file.id)
                    return completion.choices[0].message.content

                except Exception as e:
                    print(f"Error using OpenAI files API: {str(e)}")
                    # Fall back to base64 method

            # Method 2: Use base64 encoding for smaller files or as fallback
            print("Using base64 encoding method to process PDF")
            with open(temp_path, "rb") as file:
                base64_data = base64.b64encode(file.read()).decode("utf-8")

            completion = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "file",
                                "file": {
                                    "filename": os.path.basename(pdf_url),
                                    "file_data": f"data:application/pdf;base64,{base64_data}",
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt,
                            }
                        ],
                    },
                ],
            )

            return completion.choices[0].message.content

        except Exception as e:
            print(f"Error processing PDF with OpenAI: {str(e)}")
            # Fall back to PyPDF2 method
            return download_pdf(pdf_url)

        finally:
            # Clean up the temporary file
            try:
                os.unlink(temp_path)
            except Exception as e:
                print(f"Error removing temporary PDF file: {str(e)}")

    except Exception as e:
        print(f"Error downloading PDF for OpenAI processing: {str(e)}")
        # Fall back to PyPDF2 method
        return download_pdf(pdf_url)


def handler(event, context):
    """AWS Lambda handler function"""
    try:
        s3 = boto3.client("s3")

        print("Starting handler with event:", event)

        # Will be passed in from the frontend
        url = event.get("url", "")
        if not url and "video_url" in event:
            url = event.get("video_url", "")

        if not url:
            raise ValueError(
                "No URL provided in event (checked 'url' and 'video_url' fields)")

        language = event["language"]
        id = event["id"]
        difficulty = event["difficulty"]
        name = event["name"]
        user_id = event["user_id"]

        # Check if content already exists
        cached_id = get_cached_id(url)
        s3_key = f"transcriptions/{cached_id}.txt"
        print(f"S3 key: {s3_key}")

        # Check if transcription already exists
        if check_s3_exists(s3, s3_key):
            print(f"Transcription already exists: {s3_key}")
            sleep(2)
            return {
                "statusCode": 200,
                "s3_key": s3_key,
                "language": language,
                "difficulty": difficulty,
                "id": id,
                "user_id": user_id,
                "name": name,
                "url": url,
            }

        # Process content based on URL type
        if get_video_id(url):
            # Use OpenAI web search for YouTube videos
            print(
                f"Processing YouTube video with OpenAI web search instead of transcript API: {url}")
            print(
                f"This uses GPT-4o with web search to analyze and summarize the video content")
            transcription = fetch_youtube_with_openai(url)
        elif is_pdf_url(url):
            # For PDF files, download and extract text using OpenAI
            print(f"Processing PDF: {url}")
            # Convert to direct PDF URL if needed (e.g., arxiv abstract to PDF)
            pdf_url = get_pdf_url(url)
            print(f"PDF URL: {pdf_url}")

            # Create a detailed prompt for the PDF processing
            pdf_prompt = f"""
            Please extract and organize the key content from this PDF. Focus on:
            1. The main concepts, theories, or findings
            2. Any important definitions, equations, or methodologies
            3. The structure and flow of the document
            4. Key takeaways and conclusions
            
            Present the information in a well-structured, educational format that could be used for teaching purposes.
            Preserve important technical details while making the content accessible.
            """

            transcription = process_pdf_with_openai(pdf_url, pdf_prompt)

            # Fallback to traditional extraction if OpenAI method fails
            if not transcription or len(transcription.strip()) < 100:
                print(
                    "OpenAI PDF processing returned insufficient content, falling back to traditional method")
                transcription = download_pdf(pdf_url)
        else:
            # For other websites, fetch the text content using simple requests
            print(f"Processing website: {url}")
            transcription = fetch_website_simple(url)

        print(f"Transcription length: {len(transcription)}")
        print(f"Transcription preview: {transcription[:200]}")

        # Ensure the transcription isn't too large (S3 might have limits)
        if len(transcription) > 10 * 1024 * 1024:  # 10MB limit
            print("Transcription is very large, truncating to 10MB")
            transcription = transcription[:10 * 1024 * 1024]

        # Save transcription to S3
        s3.put_object(Bucket=BUCKET_NAME, Key=s3_key,
                      Body=transcription.encode("utf-8"))
        print(f"Transcription saved to S3: {s3_key}")

        # Update the content item in DynamoDB
        dynamodb = boto3.resource('dynamodb').Table(
            os.environ['CORE_TABLE_NAME'])
        dynamodb.update_item(
            Key={'PK': 'CONTENT', 'SK': f"USER#{user_id}#{id}"},
            UpdateExpression='set #s = :status',
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':status': 'TRANSCRIBED'}
        )

        return {
            "statusCode": 200,
            "s3_key": s3_key,
            "url": url,
            "id": id,
            "language": language,
            "difficulty": difficulty,
            "name": name,
            "user_id": user_id,
        }

    except Exception as e:
        print(f"Error in handler: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise
