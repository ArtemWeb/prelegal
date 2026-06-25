import json
import os

from litellm import completion

from document_service import get_catalog_summary

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT_TEMPLATE = """You are a legal assistant helping users create legal documents.

Available document types:
{catalog}

Your job:
1. Ask the user what type of legal document they need.
2. If the requested document matches one in the list above, set document_type to the exact name and proceed to collect required fields.
3. If the requested document is NOT in the list, explain politely that it is not supported and suggest the closest available document.
4. Once document_type is confirmed, ask questions to collect all essential information (party names, dates, terms, etc.).
5. Use field names that match the document's terminology (e.g. "Customer", "Provider", "Effective Date", "Governing Law").

IMPORTANT: Always respond with ONLY a valid JSON object in this exact format, no other text:
{{
  "message": "Your conversational message here",
  "document_type": null or exact document name from the list above,
  "fields": {{}},
  "complete": false
}}

Rules:
- Set document_type as soon as the user confirms which document they want.
- Add fields incrementally as information is provided — never lose previously collected fields.
- Set complete to true only when all essential fields are filled.
- Keep messages concise and friendly. Ask one or two things at a time."""


def chat(messages: list[dict]) -> dict:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    catalog = get_catalog_summary()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(catalog=catalog)

    response = completion(
        model=MODEL,
        messages=[{"role": "system", "content": system_prompt}] + messages,
        api_key=api_key,
        api_base="https://openrouter.ai/api/v1",
        extra_body=EXTRA_BODY,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)
