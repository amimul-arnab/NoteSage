import openai
import logging
import boto3
from config import Config
import json

class GPTManager:
    def __init__(self):
        openai.api_key = Config.OPENAI_API_KEY
        self.textract = boto3.client(
            'textract',
            aws_access_key_id=Config.AWS_ACCESS_KEY,
            aws_secret_access_key=Config.AWS_SECRET_KEY,
            region_name=Config.AWS_REGION
        )

    def extract_text_from_image(self, s3_bucket: str, s3_key: str):
        try:
            # Call Amazon Textract to extract text
            response = self.textract.detect_document_text(
                Document={
                    'S3Object': {
                        'Bucket': s3_bucket,
                        'Name': s3_key
                    }
                }
            )

            lines = []
            for block in response.get('Blocks', []):
                if block.get('BlockType') == 'LINE' and 'Text' in block:
                    lines.append(block['Text'])

            extracted_text = "\n".join(lines)
            return {'text': extracted_text}

        except self.textract.exceptions.InvalidS3ObjectException as e:
            logging.error(f"Textract invalid S3 object: {e}", exc_info=True)
            raise
        except self.textract.exceptions.UnsupportedDocumentException as e:
            logging.error(f"Textract unsupported document: {e}", exc_info=True)
            raise
        except Exception as e:
            logging.error(f"Unexpected error during Textract OCR: {e}", exc_info=True)
            raise

    def generate_notes(self, extracted_text: str):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a professional note summarizer. "
                            "Create organized, detailed notes in HTML format. "
                            "Use headings (<h1>, <h2>, etc.), paragraphs (<p>), lists (<ul>, <li>) where appropriate. "
                            "For mathematical expressions, use LaTeX notation with $...$ for inline math and $$...$$ for display math. "
                            "Return only the HTML content."
                        )
                    },
                    {
                        "role": "user",
                        "content": f"Please summarize and enhance these notes:\n\n{extracted_text}"
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            return {
                'summary': response['choices'][0]['message']['content'],
                'tokens_used': response['usage']['total_tokens']
            }
        except openai.error.OpenAIError as e:
            logging.error(f"OpenAI error during note generation: {e}", exc_info=True)
            raise
        except Exception as e:
            logging.error(f"Unexpected error during note generation: {e}", exc_info=True)
            raise

    def generate_flashcards(self, text: str):
        """
        Generate flashcards from the provided text.

        We prompt the model to create a list of flashcards, each with a "term" and "definition".
        The model should return valid JSON so we can parse it.
        """
        try:
            prompt = (
                "You are a professional educator. Given the following text, extract the key concepts and create a set of flashcards. "
                "Each flashcard should have a 'term' and a 'definition' explaining the concept simply and clearly. "
                "Return the flashcards in strict JSON format as a list of objects, for example:\n"
                "[{\"term\": \"Term1\", \"definition\": \"Definition for Term1\"}, {\"term\": \"Term2\", \"definition\": \"Definition for Term2\"}, ...]"
            )

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Text:\n\n{text}\n\nPlease produce flashcards now."}
                ],
                temperature=0.7,
                max_tokens=1500
            )

            content = response['choices'][0]['message']['content'].strip()
            # Attempt to parse JSON
            flashcards = json.loads(content)
            # Validate the structure
            if not isinstance(flashcards, list):
                raise ValueError("Flashcards JSON is not a list.")

            # Ensure each flashcard has 'term' and 'definition'
            for fc in flashcards:
                if 'term' not in fc or 'definition' not in fc:
                    raise ValueError("A flashcard is missing 'term' or 'definition'.")

            return flashcards

        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Error parsing flashcards JSON: {e}", exc_info=True)
            raise ValueError("Failed to parse flashcards from model response.")
        except openai.error.OpenAIError as e:
            logging.error(f"OpenAI error during flashcard generation: {e}", exc_info=True)
            raise
        except Exception as e:
            logging.error(f"Unexpected error during flashcard generation: {e}", exc_info=True)
            raise

# Create a default instance
gpt_manager = GPTManager()
