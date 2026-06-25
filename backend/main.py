import json
import os
from contextlib import asynccontextmanager

import aiosqlite
import jwt as pyjwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from auth import create_token, decode_token, hash_password, verify_password
from chat import chat
from database import DB_PATH, init_db
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

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        return decode_token(credentials.credentials)
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/register")
async def register(body: RegisterRequest):
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    hashed = hash_password(body.password)
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (body.email.lower(), hashed),
            )
            await db.commit()
            user_id = cursor.lastrowid
    except Exception:
        raise HTTPException(status_code=409, detail="Email already registered")
    token = create_token(user_id, body.email.lower())
    return {"token": token, "user": {"id": user_id, "email": body.email.lower()}}


@app.post("/api/auth/login")
async def login(body: LoginRequest):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            (body.email.lower(),),
        )
        row = await cursor.fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(row["id"], row["email"])
    return {"token": token, "user": {"id": row["id"], "email": row["email"]}}


# ── Chat ──────────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@app.post("/api/chat")
async def chat_endpoint(body: ChatRequest):
    try:
        result = chat([m.model_dump() for m in body.messages])

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


# ── Documents ─────────────────────────────────────────────────────────────────

class SaveDocumentRequest(BaseModel):
    document_type: str
    fields: dict
    rendered_content: str


@app.post("/api/documents")
async def save_document(
    body: SaveDocumentRequest,
    user: dict = Depends(get_current_user),
):
    user_id = int(user["sub"])
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO documents (user_id, document_type, fields, rendered_content) VALUES (?, ?, ?, ?)",
            (user_id, body.document_type, json.dumps(body.fields), body.rendered_content),
        )
        await db.commit()
        doc_id = cursor.lastrowid
    return {"id": doc_id}


@app.get("/api/documents")
async def list_documents(user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, document_type, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        )
        rows = await cursor.fetchall()
    return [{"id": r["id"], "document_type": r["document_type"], "created_at": r["created_at"]} for r in rows]


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, document_type, fields, rendered_content, created_at FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user_id),
        )
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": row["id"],
        "document_type": row["document_type"],
        "fields": json.loads(row["fields"]),
        "rendered_content": row["rendered_content"],
        "created_at": row["created_at"],
    }


@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: int, user: dict = Depends(get_current_user)):
    user_id = int(user["sub"])
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "DELETE FROM documents WHERE id = ? AND user_id = ?",
            (doc_id, user_id),
        )
        await db.commit()
    return {"success": True}


# ── Static ────────────────────────────────────────────────────────────────────

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
