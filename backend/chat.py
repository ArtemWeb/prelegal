import json
import os

from litellm import completion

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a legal assistant helping users create a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a friendly conversation to collect all required information.

Fields to collect:
- Party 1: company name, contact name, title, notice address (email)
- Party 2: company name, contact name, title, notice address (email)
- Purpose: reason for sharing confidential information
- Effective date: when the agreement starts (YYYY-MM-DD format)
- MNDA term: "years" (with a number) or "terminated" (until terminated)
- Confidentiality term: "years" (with a number) or "perpetuity"
- Governing law state (e.g. "Delaware")
- Jurisdiction (e.g. "New Castle, DE")
- Modifications: any special modifications (can be empty string)

Ask naturally, one or two topics at a time. Start by asking who the two parties are.

IMPORTANT: Always respond with ONLY a JSON object in this exact format, no other text:
{
  "message": "Your conversational message here",
  "fields": {
    "party1Company": null,
    "party1Name": null,
    "party1Title": null,
    "party1Address": null,
    "party2Company": null,
    "party2Name": null,
    "party2Title": null,
    "party2Address": null,
    "purpose": null,
    "effectiveDate": null,
    "mndaTermType": null,
    "mndaTermYears": "2",
    "confidentialityType": null,
    "confidentialityYears": "3",
    "governingLaw": null,
    "jurisdiction": null,
    "modifications": ""
  },
  "complete": false
}

Include ALL fields in every response. Use null for unknown values. Set complete to true only when all required fields except modifications are filled."""


def chat(messages: list[dict]) -> dict:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")

    response = completion(
        model=MODEL,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        api_key=api_key,
        api_base="https://openrouter.ai/api/v1",
        extra_body=EXTRA_BODY,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)
