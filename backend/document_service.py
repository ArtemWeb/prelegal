import json
import re
from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
CATALOG_FILE = Path(__file__).parent.parent / "catalog.json"


def load_catalog() -> list[dict]:
    with open(CATALOG_FILE, encoding="utf-8") as f:
        return json.load(f)


def load_template(filename: str) -> str:
    path = TEMPLATES_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""


def render_document(template_content: str, fields: dict) -> str:
    """Replace span placeholders with collected field values, then clean up HTML."""
    content = template_content

    # Replace known field spans with values
    for field_name, value in fields.items():
        if value:
            for css_class in ("coverpage_link", "orderform_link", "keyterms_link"):
                pattern = re.compile(
                    rf'<span class="{css_class}">{re.escape(field_name)}(\'s|s)?</span>',
                    re.IGNORECASE,
                )
                content = pattern.sub(f'<mark class="field-filled">{value}</mark>', content)

    # Convert structural header spans to markdown headings
    content = re.sub(r'<span class="header_2"[^>]*>([^<]+)</span>', r'## \1', content)
    content = re.sub(r'<span class="header_3"[^>]*>([^<]+)</span>', r'**\1**', content)

    # Strip all remaining span tags (preserve inner text)
    content = re.sub(r'<span[^>]*>([^<]*)</span>', r'\1', content)

    # Strip label tags
    content = re.sub(r'<label[^>]*>([^<]*)</label>', r'*\1*', content)

    return content


def get_catalog_summary() -> str:
    catalog = load_catalog()
    lines = []
    for doc in catalog:
        lines.append(f"- {doc['name']}: {doc['description']}")
    return "\n".join(lines)


def find_document(name: str) -> dict | None:
    catalog = load_catalog()
    name_lower = name.lower()
    for doc in catalog:
        if doc["name"].lower() == name_lower:
            return doc
    return None
