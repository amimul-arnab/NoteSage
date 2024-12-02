import openai
import logging
import base64
from config import Config

class GPTManager:
    def __init__(self):
        # Set the OpenAI API key using the Config class
        openai.api_key = Config.OPENAI_API_KEY
        #print(f"Using OpenAI API Key: {Config.OPENAI_API_KEY}")  # Debug statement

    def extract_text_from_image(self, image_data, content_type):
        try:
            # Convert image data to base64 (ensure it is in bytes)
            if isinstance(image_data, str):
                image_data = image_data.encode('utf-8')  # Convert to bytes if it's a string

            image_base64 = base64.b64encode(image_data).decode('utf-8')

            # Determine the correct MIME type
            mime_type = None
            if content_type in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
                mime_type = content_type
            else:
                raise ValueError("Unsupported image type. Only PNG, JPEG, GIF, and WebP are supported.")

            # Send request to GPT API for OCR extraction using a valid MIME type
            response = openai.Image.create(
                model="gpt-4o",
                prompt="Extract text from this image.",
                image=f"data:{mime_type};base64,{image_base64}"
            )
            return {
                'text': response['choices'][0]['text']
            }
        except openai.error.InvalidRequestError as e:
            logging.error(f"Invalid request error from OpenAI API: {e}", exc_info=True)
            raise
        except openai.error.AuthenticationError as e:
            logging.error(f"Authentication error with OpenAI API: {e}", exc_info=True)
            raise
        except openai.error.APIConnectionError as e:
            logging.error(f"Connection error with OpenAI API: {e}", exc_info=True)
            raise
        except openai.error.RateLimitError as e:
            logging.error(f"Rate limit error with OpenAI API: {e}", exc_info=True)
            raise
        except Exception as e:
            logging.error(f"Unexpected error during OCR extraction: {e}", exc_info=True)
            raise

    def generate_notes(self, extracted_text: str):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional note summarizer. Create clear, concise summaries while maintaining key information."
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
        except openai.error.InvalidRequestError as e:
            logging.error(f"Invalid request error from OpenAI API: {e}", exc_info=True)
            raise
        except openai.error.AuthenticationError as e:
            logging.error(f"Authentication error with OpenAI API: {e}", exc_info=True)
            raise
        except openai.error.APIConnectionError as e:
            logging.error(f"Connection error with OpenAI API: {e}", exc_info=True)
            raise
        except openai.error.RateLimitError as e:
            logging.error(f"Rate limit error with OpenAI API: {e}", exc_info=True)
            raise
        except Exception as e:
            logging.error(f"Unexpected error during note generation: {e}", exc_info=True)
            raise

# Create a default instance
gpt_manager = GPTManager()
