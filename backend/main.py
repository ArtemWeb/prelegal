import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)


class LoginRequest(BaseModel):
    email: str
    password: str


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/login")
async def login(body: LoginRequest):
    return {"success": True, "user": {"email": body.email}}


static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
