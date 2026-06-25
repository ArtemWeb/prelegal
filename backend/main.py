import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from chat import chat
from database import init_db
from document_service import find_document, load_template, render_document


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/login")
async def login(body: LoginRequest):
    return {"success": True, "user": {"email": body.email}}


@app.post("/api/chat")
async def chat_endpoint(body: ChatRequest):
    try:
        result = chat([m.model_dump() for m in body.messages])

        # Render the document template with collected fields
        document_type = result.get("document_type")
        fields = result.get("fields", {})
        rendered_content = None

        if document_type and fields:
            doc = find_document(document_type)
            if doc:
                template = load_template(doc["filename"])
                if template:
                    rendered_content = render_document(template, fields)

        result["rendered_content"] = rendered_content
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
