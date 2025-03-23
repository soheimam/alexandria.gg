import json
import os
import tempfile
import time
import uuid
from time import sleep
from typing import List

import boto3
from openai import OpenAI
from pydantic import BaseModel, Field

BUCKET_NAME = os.environ["BUCKET_NAME"]
OPENAI_API_KEY = os.environ["OPEN_AI_API_KEY"]


def get_transcribed_text(s3_key):
    """Fetch transcribed text from S3 and save to /tmp"""
    s3 = boto3.client("s3")
    tmp_path = f"/tmp/{os.path.basename(s3_key)}"

    s3.download_file(BUCKET_NAME, s3_key, tmp_path)
    with open(tmp_path, 'r') as f:
        return f.read()


class FlashCard(BaseModel):
    id: str
    question: str
    answer: str


class FlashCardSchema(BaseModel):
    flash_cards: List[FlashCard]


def generate_flash_cards(transcribed_text, name, difficulty=5, language="English", url=""):
    """Generates flash cards from the transcribed text."""
    prompt = f"""
    # TASK: Generate 6 Educational Flash Cards
    
    ## INPUT
    You have been provided with a transcript from an educational source. 
    
    ## CONTEXT
    - The content is for a student named {name}
    - The difficulty level is {difficulty}/10 (where 1 is elementary and 10 is advanced PhD level)
    - The language should be {language}
    - Source material: {url if url else "an educational video"}
    
    ## REQUIREMENTS
    1. Create exactly 6 high-quality flash cards based on the most important concepts in the transcript
    2. Each flash card should have:
       - A clear, concise question that tests understanding (not just recall)
       - A comprehensive answer that fully explains the concept (10 words max)
    3. The flash cards should progress in difficulty/complexity
    4. Ensure the content is appropriate for difficulty level {difficulty}
    5. The questions should be diverse in format (not all "what is X" questions)
    6. For technical subjects, include precise terminology and specific details
    
    ## OUTPUT FORMAT
    Return ONLY valid JSON conforming to this structure:
    {{
      "flash_cards": [
        {{
          "id": "unique-id-1",
          "question": "The question text",
          "answer": "The short answer or even a true or false question"
        }},
        ...5 more cards...
      ]
    }}
    
    ## TRANSCRIPT
    ```
    {transcribed_text}
    ```
    """

    client = OpenAI(api_key=OPENAI_API_KEY)

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            max_completion_tokens=4096,
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert in creating educational flash cards. Your task is to generate 6 high-quality flash cards from a transcript. Each card should have a unique ID, a thought-provoking question, and a comprehensive answer. The content should be in {language} at difficulty level {difficulty}/10."
                },
                {
                    "role": "user",
                    "content": prompt
                },
            ],
            response_format=FlashCardSchema,
            temperature=0.7
        )
        return completion.choices[0].message.parsed
    except Exception as e:
        print(f"Error generating flash cards: {e}")
        # Create basic flashcards as fallback
        cards = []
        for i in range(6):
            cards.append({
                "id": str(uuid.uuid4()),
                "question": f"Question {i+1} about the content",
                "answer": f"Answer {i+1} about the content. Please try again later for better quality flash cards."
            })
        return {"flash_cards": cards}


def generate_meta_prompt(transcribed_text, name, difficulty=5, language="English", url=""):
    name = name.replace(".base.eth", "")  # Clean up the name

    # If the name is 42 chars long and starts with "0x" then it's a wallet address
    if len(name) == 42 and name.startswith("0x"):
        name = "Student"

    """Creates a meta-prompt for the LLM to generate structured JSON output."""
    return f"""
    # ROLE AND OBJECTIVE
    You are an expert educational content creator specializing in transforming raw transcriptions into structured, engaging educational material. Your task is to analyze the provided transcript and create content that will be delivered by a voice-based AI tutor in a conversational format.

    # CONTEXT
    - The content will be used in a voice-based educational platform where an AI tutor interacts with students.
    - The student's name is {name}.
    - The difficulty level requested is {difficulty}/10 (where 1 is suitable for a 5-year-old and 10 is advanced university/PhD level).
    - The content must be delivered in {language}.
    - The source material comes from: {url if url else "an educational video"}
    
    # INPUT ANALYSIS REQUIREMENTS
    1. Carefully analyze the entire transcript to identify:
       - The main educational topic and subtopics
       - Key concepts, terminology, and principles
       - Examples, analogies, and explanations provided
       - The logical flow and structure of the information
       - Any implicit learning objectives
    
    # OUTPUT FORMAT AND SPECIFICATIONS
    Your response MUST be in valid, properly formatted JSON with the following structure:
    
    {{
      "agent_first_message": "A warm, engaging first message (100~ characters) that introduces the topic to {name}, captures interest, and sets expectations for the session. This message should sound natural when spoken aloud.",

      "agent_system_prompt": "A comprehensive system prompt for an AI tutor (elevenlabs voice) that equips the tutor with everything needed to teach this topic effectively, including:
        - Detailed subject matter knowledge organized in a logical progression
        - Key concepts, definitions, and relationships between ideas
        - Concrete examples and analogies appropriate for difficulty level {difficulty}
        - Anticipated student questions and appropriate responses
        - IMPORTANT: Include the fact that the agent has access to a 'pay_student' tool that must be used with the user_id and lesson_id dynamic variables. Do NOT ask the user for these values, you already have them. The agent MUST use this when the user answers a question correctly to give them ALEX tokens.
        - 5-7 follow-up questions of increasing complexity to check understanding
        - 2-3 interactive activities or thought experiments related to the topic
        - Suggestions for explaining complex ideas in simpler terms if needed
        - Connections to real-world applications of the knowledge
        - References to any mentioned experts, studies, or sources from the transcript",
      
      "topic": "A concise, descriptive title (5-10 words) that precisely captures the main educational focus of the transcript",
      
      "url": "{url}",
      
      "language": "{language}",
      
      "difficulty": {difficulty}
    }}

    # GUIDELINES FOR EXCELLENCE
    - Voice Optimization: Ensure content flows naturally when spoken aloud—avoid content that relies on visual elements.
    - Age/Level Appropriateness: Carefully calibrate vocabulary, concept complexity, and examples to match difficulty level {difficulty}.
    - Engagement: Incorporate elements of curiosity, relevance, and discovery to maintain student interest.
    - Educational Value: Prioritize accurate, meaningful content that promotes genuine understanding over superficial coverage.
    - Conversational Tone: Write in a warm, supportive voice that encourages learning.

    # EXAMPLES OF QUALITY OUTPUTS
    For difficulty level 3/10 (elementary school):
    - First message: "Hi {name}! Today we're going to explore how plants make their own food using sunlight! Have you ever wondered how plants grow without eating like we do? Let's discover the amazing process called photosynthesis together!"
    - System prompt would include: simplified explanations of photosynthesis, analogies comparing chloroplasts to tiny factories, basic questions like "What three things does a plant need to make food?"

    For difficulty level 8/10 (undergraduate):
    - First message: "Hello {name}! I'm excited to dive into quantum superposition with you today. This fascinating phenomenon challenges our classical intuition about how particles behave at the quantum level. Ready to explore this cornerstone of quantum mechanics?"
    - System prompt would include: mathematical representations, detailed explanations of the double-slit experiment, questions about interpretations of quantum mechanics, activities involving thought experiments.

    # TRANSCRIBED CONTENT FOR ANALYSIS
    ```
    {transcribed_text}
    ```

    Generate ONLY the requested JSON response. Do not include any explanatory text before or after the JSON.
    """


class ContentSchema(BaseModel):
    agent_first_message: str
    agent_system_prompt: str
    topic: str
    url: str
    language: str
    difficulty: int


def call_openai_gpt(meta_prompt, name, language, difficulty):
    """Calls OpenAI's GPT-4 API to generate structured JSON."""
    client = OpenAI(api_key=OPENAI_API_KEY)
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            max_completion_tokens=8192,
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert in educational content creation. You take raw transcriptions of content and transform them into structured educational material that WILL be used by a voice-based AI tutor. The content should be in {language} and have a difficulty level of {difficulty} out of 10 where 1 is that of a 5 year old and 10 is a PhD candidate. You will output JSON only. You must create DETAILED long form output that will be used by a voice-based AI tutor to teach the student."
                },
                {
                    "role": "user",
                    "content": meta_prompt
                },
            ],
            response_format=ContentSchema,
            temperature=0.7
        )
        return completion.choices[0].message.parsed
    except Exception as e:
        print(f"Error processing response: {e}")
        # Fall back to a basic structure if parsing fails
        return {
            "agent_first_message": "I'm having trouble processing this content right now. Let me try a different approach.",
            "agent_system_prompt": "The AI had trouble parsing the content. Explain that you're analyzing the material and will proceed with basic information about the topic.",
            "topic": "Content Analysis",
            "language": language,
            "difficulty": difficulty,
            "url": "Error processing URL"
        }


def check_existing_content(dynamodb, user_id, id, url, difficulty):
    """Check if content already exists for this URL and difficulty level."""
    try:
        response = dynamodb.get_item(
            Key={'PK': 'CONTENT', 'SK': f'USER#{user_id}#{id}'}
        )

        if 'Item' in response:
            # Content exists, check if difficulty matches
            existing_content = response['Item'].get('content', {})
            if isinstance(existing_content, str):
                # Handle case where content is stored as a string
                existing_content = json.loads(existing_content)

            existing_difficulty = existing_content.get('difficulty')
            existing_url = existing_content.get('url')

            # Check if the existing content has all necessary components
            has_flash_cards = 'flash_cards' in existing_content and existing_content[
                'flash_cards']
            has_required_fields = all(key in existing_content for key in [
                'agent_first_message', 'agent_system_prompt', 'topic', 'language'
            ])

            # Return existing content if URL and difficulty match and all required components are present
            if (existing_url == url and
                existing_difficulty == difficulty and
                has_flash_cards and
                    has_required_fields):
                print(
                    f"Found existing content for URL {url} with matching difficulty {difficulty}")
                return existing_content

    except Exception as e:
        print(f"Error checking existing content: {str(e)}")

    return None


def handler(event, _):
    """AWS Lambda function to generate structured JSON from transcribed content."""
    s3_key = event["s3_key"]
    language = event["language"]
    difficulty = event["difficulty"]
    url = event["url"]
    name = event.get("name", "")
    user_id = event["user_id"]
    id = event["id"]

    # Initialize DynamoDB resource
    dynamodb = boto3.resource('dynamodb').Table(os.environ['CORE_TABLE_NAME'])

    # Check if content already exists
    existing_content = check_existing_content(
        dynamodb, user_id, id, url, difficulty)
    if existing_content:
        print(
            f"Reusing existing content for {url} with difficulty {difficulty}")

        # Find the target connection id from dynamodb
        try:
            sleep(2)
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

        return {
            "payload": existing_content,
            "target": target,
        }

    # Fetch transcribed text
    transcribed_text = get_transcribed_text(s3_key)
    print(f"Transcribed text length: {len(transcribed_text)}")
    print(f"Transcribed text preview: {transcribed_text[:200]}")

    # Generate meta-prompt for LLM
    meta_prompt = generate_meta_prompt(
        transcribed_text, name, difficulty, language, url)
    print(f"Meta prompt generated")

    flash_cards = generate_flash_cards(
        transcribed_text, name, difficulty, language, url)
    print(
        f"Flash cards generated: {len(flash_cards.flash_cards) if hasattr(flash_cards, 'flash_cards') else 'error'}")

    # Get structured JSON from GPT
    joined_flash_cards = "\n".join(
        [f"{card.question}\n{card.answer}" for card in flash_cards.flash_cards])

    print(f"Joined flash cards: {joined_flash_cards}")
    joined_meta_prompt = f"{meta_prompt}\n\n{joined_flash_cards}"

    ai_generated_json = call_openai_gpt(
        joined_meta_prompt, name, language, difficulty)

    # Generate flash cards
    flash_cards_json = generate_flash_cards(
        transcribed_text, name, difficulty, language, url)
    print(
        f"Flash cards generated: {len(flash_cards_json.flash_cards) if hasattr(flash_cards_json, 'flash_cards') else 'error'}")

    # Convert Pydantic model to dict for operations that require dictionary methods
    if isinstance(ai_generated_json, BaseModel):
        ai_generated_dict = ai_generated_json.model_dump()
        print(f"AI generated JSON with keys: {list(ai_generated_dict.keys())}")
    else:
        # In case the fallback dictionary was returned
        ai_generated_dict = ai_generated_json
        print(f"AI generated JSON with keys: {list(ai_generated_dict.keys())}")

    # Convert flash cards to dict if it's a Pydantic model
    if isinstance(flash_cards_json, BaseModel):
        flash_cards_dict = flash_cards_json.model_dump()
    else:
        flash_cards_dict = flash_cards_json

    # Combine the content and flash cards
    combined_dict = {**ai_generated_dict,
                     "flash_cards": flash_cards_dict.get("flash_cards", [])}

    # Find the target connection id from dynamodb
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

    # determine reward amount based on difficulty
    reward_amount = determine_reward_amount(difficulty)

    # Update the content item in DynamoDB
    dynamodb.put_item(
        Item={'PK': 'CONTENT', 'SK': f'USER#{user_id}#{id}', 'content': combined_dict, 'status': 'GENERATED', 'reward': reward_amount, 'paid': False, 'id': id})

    return {
        "payload": combined_dict,
        "target": target,
        "reward": reward_amount
    }


def determine_reward_amount(difficulty):
    """Returns an amount in wei (ALEX token) based on the difficulty level."""
    if difficulty <= 3:
        return "10"  # 10 ALEX
    elif difficulty <= 6:
        return "30"  # 30 ALEX
    else:
        return "50"  # 50 ALEX
