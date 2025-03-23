# Runs immediately as the state machine is started in parallel to process_content

import os
from urllib.parse import urlparse

import boto3

dynamodb = boto3.resource('dynamodb').Table(os.environ['CORE_TABLE_NAME'])


def handler(event, context):
    url = event.get("video_url") or event.get("url", "")
    language = event["language"]
    name = event["name"]
    user_id = event["user_id"]

    # Generate the message
    message = generate_message(url, language, name)

    # Find the target connection id from dynamodb with error handling
    try:
        response = dynamodb.get_item(
            Key={'PK': 'USER', 'SK': f'CONNECTION#{user_id}'})
        if 'Item' in response:
            target = response["Item"]["connectionId"]
        else:
            print(f"No connection found for user_id: {user_id}")
            target = None  # No connection ID found
    except Exception as e:
        print(f"Error getting connection for user_id {user_id}: {str(e)}")
        target = None  # Error occurred

    # If we couldn't find a connection, still return the message but with no target
    return {
        "payload": message,
        "target": target,
    }


def get_domain(url):
    """Extracts domain from URL"""
    try:
        parsed_url = urlparse(url)
        return parsed_url.netloc
    except:
        return url


def is_pdf_url(url):
    """Determines if a URL points to a PDF file or academic paper"""
    try:
        parsed_url = urlparse(url)
        path = parsed_url.path.lower()
        hostname = parsed_url.netloc.lower()

        # Check if URL ends with .pdf
        if path.endswith('.pdf'):
            return True

        # Check if URL contains pdf in the path (common for academic papers)
        if '/pdf/' in path:
            return True

        # Check for academic repositories
        academic_sites = ['arxiv.org', 'biorxiv.org',
                          'medrxiv.org', 'ssrn.com', 'researchgate.net']
        if any(site in hostname for site in academic_sites):
            return True

        return False
    except:
        return False


def generate_message(url, language, name):
    """Generates a first message for the user based on the URL type"""
    domain = get_domain(url)

    # Check if it's a YouTube URL
    if "youtube" in domain or "youtu.be" in domain:
        return {
            "message": f"Hello {name}, I'm processing your YouTube video in {language}. I'll extract the audio, transcribe it, and create an educational experience from it. This will take a minute or two.",
            "type": "status_update"
        }
    # Check if it's a PDF or academic paper
    elif is_pdf_url(url):
        if "arxiv" in domain:
            return {
                "message": f"Hello {name}, I'm processing the academic paper from arXiv that you shared. I'll analyze it and create an educational experience in {language}. Academic papers may take a bit longer to process.",
                "type": "status_update"
            }
        else:
            return {
                "message": f"Hello {name}, I'm processing the PDF document you shared. I'll analyze it and create an educational experience in {language}. PDF documents may take a bit longer to process.",
                "type": "status_update"
            }
    # Check if it's Wikipedia
    elif "wikipedia" in domain:
        return {
            "message": f"Hello {name}, I'm processing the Wikipedia article you shared. I'll analyze it and create an educational experience in {language}. This will take a moment.",
            "type": "status_update"
        }
    # Generic website
    else:
        return {
            "message": f"Hello {name}, I'm processing the content from {domain} in {language}. I'll create an educational experience based on the content. This will take a moment.",
            "type": "status_update"
        }
