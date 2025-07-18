import boto3
import json
import logging
from typing import Optional, List, Dict, Any
from botocore.exceptions import ClientError
import os

logger = logging.getLogger(__name__)

class BedrockService:
    """AWS Bedrock service for AI interactions"""
    
    def __init__(self):
        self.bedrock_client = boto3.client(
            'bedrock-runtime',
            region_name=os.getenv('BEDROCK_REGION', os.getenv('AWS_REGION', 'us-east-1')),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        # Model configurations
        self.chat_model = os.getenv('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
        self.naming_model = os.getenv('BEDROCK_NAMING_MODEL', 'anthropic.claude-3-haiku-20240307-v1:0')
        
        logger.info(f"🤖 Bedrock service initialized with model: {self.chat_model} in region: {os.getenv('BEDROCK_REGION', os.getenv('AWS_REGION', 'us-east-1'))}")
    
    async def generate_chat_response(
        self, 
        user_message: str, 
        context_messages: List[Dict[str, str]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI response for chat messages"""
        try:
            logger.info(f"🎯 Generating AI response for user: {user_id}")
            logger.info(f"📝 User message: {user_message[:100]}...")
            
            # Build the conversation context
            system_prompt = """You are an intelligent legal assistant for Indifly Ventures. 
            You provide professional legal guidance, contract review, compliance advice, and general legal information.
            Always be helpful, accurate, and professional. If you're unsure about something, say so.
            Never provide advice that could be construed as creating an attorney-client relationship unless explicitly authorized."""
            
            # Build conversation history
            conversation = []
            if context_messages:
                for msg in context_messages[-10:]:  # Last 10 messages for context
                    conversation.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Use the user message directly
            conversation.append({
                "role": "user",
                "content": user_message
            })
            
            # Prepare the request body for Claude
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "system": system_prompt,
                "messages": conversation,
                "temperature": 0.7,
                "top_p": 0.9
            }
            
            # Make the request to Bedrock
            logger.info(f"🔄 Making request to Bedrock with model: {self.chat_model}")
            response = self.bedrock_client.invoke_model(
                modelId=self.chat_model,
                contentType='application/json',
                accept='application/json',
                body=json.dumps(body)
            )
            
            # Parse the response
            response_body = json.loads(response['body'].read())
            logger.info(f"✅ Received response from Bedrock: {len(str(response_body))} characters")
            
            if response_body.get('content') and len(response_body['content']) > 0:
                ai_response = response_body['content'][0]['text']
                
                # Calculate token usage
                usage = response_body.get('usage', {})
                
                return {
                    "content": ai_response,
                    "model": self.chat_model,
                    "tokens_used": usage.get('input_tokens', 0) + usage.get('output_tokens', 0),
                    "processing_time": 0.0,
                    "usage": {
                        "prompt_tokens": usage.get('input_tokens', 0),
                        "completion_tokens": usage.get('output_tokens', 0),
                        "total_tokens": usage.get('input_tokens', 0) + usage.get('output_tokens', 0)
                    }
                }
            else:
                raise Exception("No content in response")
                
        except ClientError as e:
            logger.error(f"❌ Bedrock API error: {e}")
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_msg = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"❌ Error details - Code: {error_code}, Message: {error_msg}")
            raise Exception(f"AI service error: {error_msg}")
        except Exception as e:
            logger.error(f"❌ Error generating chat response: {e}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            raise Exception(f"Failed to generate response: {e}")
    
    async def generate_chat_name(
        self, 
        message: str, 
        file_content: Optional[str] = None,
        file_names: Optional[List[str]] = None
    ) -> Dict[str, str]:
        """Generate an appropriate name for a chat session"""
        try:
            # Build context for naming
            context_parts = []
            
            if file_content:
                context_parts.append(f"Document content summary: {file_content[:1000]}...")
            
            if file_names:
                context_parts.append(f"Files uploaded: {', '.join(file_names)}")
            
            context_parts.append(f"User's initial message: {message}")
            
            context = "\n\n".join(context_parts)
            
            system_prompt = """You are a helpful assistant that creates concise, descriptive titles for legal consultation chats.
            
            Based on the user's message and any document content provided, create a short, descriptive title (3-8 words) that captures the essence of the legal topic or question.
            
            Guidelines:
            - Keep it professional and clear
            - Focus on the legal topic/issue
            - Avoid generic terms like "Legal Question" 
            - Include document type if relevant (e.g., "Contract Review", "Employment Agreement Analysis")
            - Maximum 50 characters
            
            Examples:
            - "Employment Contract Non-Compete Review"
            - "GDPR Compliance Consultation" 
            - "Startup Formation Legal Advice"
            - "Privacy Policy Draft Review"
            
            Respond with just the title, nothing else."""
            
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 100,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": context
                    }
                ],
                "temperature": 0.3,
                "top_p": 0.8
            }
            
            # Make the request to Bedrock
            response = self.bedrock_client.invoke_model(
                modelId=self.naming_model,
                contentType='application/json',
                accept='application/json',
                body=json.dumps(body)
            )
            
            # Parse the response
            response_body = json.loads(response['body'].read())
            
            if response_body.get('content') and len(response_body['content']) > 0:
                suggested_name = response_body['content'][0]['text'].strip()
                
                # Clean up the name
                suggested_name = suggested_name.replace('"', '').replace("'", "")
                if len(suggested_name) > 50:
                    suggested_name = suggested_name[:47] + "..."
                
                return {
                    "suggested_name": suggested_name,
                    "reasoning": f"Generated based on: {message[:100]}..."
                }
            else:
                # Fallback naming
                return self._generate_fallback_name(message, file_names)
                
        except Exception as e:
            logger.error(f"Error generating chat name: {e}")
            # Return fallback name
            return self._generate_fallback_name(message, file_names)
    
    def _generate_fallback_name(self, message: str, file_names: Optional[List[str]] = None) -> Dict[str, str]:
        """Generate a fallback name when AI naming fails"""
        # Simple rule-based naming
        message_lower = message.lower()
        
        if file_names and any(name.lower().endswith(('.pdf', '.doc', '.docx')) for name in file_names):
            if 'contract' in message_lower or 'agreement' in message_lower:
                name = "Contract Review Discussion"
            elif 'employment' in message_lower:
                name = "Employment Document Review"
            elif 'privacy' in message_lower:
                name = "Privacy Policy Review"
            else:
                name = "Document Review Session"
        else:
            if 'gdpr' in message_lower or 'compliance' in message_lower:
                name = "Compliance Consultation"
            elif 'startup' in message_lower or 'formation' in message_lower:
                name = "Business Formation Advice"
            elif 'contract' in message_lower:
                name = "Contract Law Discussion"
            else:
                # Use first few words of message
                words = message.split()[:4]
                name = ' '.join(words).title()
                if len(name) > 30:
                    name = name[:27] + "..."
        
        return {
            "suggested_name": name,
            "reasoning": "Generated from message content"
        }

# Create a singleton instance
bedrock_service = BedrockService()
