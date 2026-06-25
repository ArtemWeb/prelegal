# pre-legal

SaaS-продукт для составления юридических документов на основе шаблонов из директории `templates/`.
Пользователь ведёт чат, чтобы определить нужный документ и заполнить поля.

Доступные документы описаны в `catalog.json`:

@catalog.json

---

## Процесс разработки

1. Читай задачу из Jira через Atlassian MCP
2. Разрабатывай фичу согласно требованиям, не пропуская шаги
3. Покрывай фичу unit и integration тестами
4. Исправляй все найденные проблемы
5. Создавай PR через GitHub MCP

---

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an `OPENROUTER_API_KEY` in the `.env` file in the project root.

---

## Technical design

The entire project should be packaged into a Docker container.
The backend should be in `backend/` and be a uv project, using FastAPI.
The frontend should be in `frontend/`.
The database should use SQLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.
Consider statically building the frontend and serving it via FastAPI, if that will work.
There should be scripts in `scripts/` for:
```bash
# Mac
scripts/start-mac.sh   # Start
scripts/stop-mac.sh    # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

---

## Current implementation state

### Architecture (as of SCRUM-8 + SCRUM-9)

**Backend** (`backend/`):
- `main.py` — FastAPI app, lifespan init of SQLite, CORS middleware, endpoints:
  - `GET /api/health`
  - `POST /api/auth/login` — fake login (accepts any credentials)
  - `POST /api/chat` — AI chat endpoint
- `chat.py` — LiteLLM call to `openrouter/openai/gpt-oss-120b` via Cerebras, returns `{ message, fields, complete }` as JSON
- `database.py` — SQLite init with `users` table (created fresh on each container start)
- `pyproject.toml` — uv project, dependencies: fastapi, uvicorn, aiosqlite, litellm, pydantic
- `static/` — served by FastAPI at `/`, contains the built Next.js frontend (copied in Dockerfile)

**Frontend** (`frontend/`):
- Next.js 14, static export (`output: "export"`), built to `out/`
- `src/app/login/page.tsx` — fake login screen, stores `{ email }` in localStorage on submit
- `src/app/page.tsx` — main app, auth guard (redirects to `/login` if no localStorage user), shows ChatInterface + NDA preview
- `src/components/ChatInterface.tsx` — freeform AI chat, calls `POST /api/chat`, updates NDA fields in real-time
- `src/components/NDAPreview.tsx` — renders NDA markdown preview
- `src/lib/generateNDA.ts` — generates NDA markdown from field data
- `src/types/nda.ts` — NDAData type and defaultNDAData

**Docker**:
- `Dockerfile` — 2-stage build: `node:20-alpine` builds frontend, `python:3.12-slim` + uv runs backend
- `docker-compose.yml` — single `app` service, port 8000, persistent SQLite volume, reads `.env`
- `.dockerignore` — excludes `node_modules`, `.next`, `__pycache__`, `.venv`

**Scripts** (`scripts/`): start/stop for Mac, Linux, Windows — all run `docker compose up/down`

### Chat flow
1. Page load → `ChatInterface` calls `POST /api/chat` with empty messages array
2. Backend sends system prompt + conversation to LiteLLM → Cerebras
3. AI responds with JSON: `{ message: string, fields: NDAData (nulls for unknown), complete: bool }`
4. Frontend shows `message` in chat bubble, merges non-null `fields` into NDA preview
5. User replies → repeat until `complete: true`

---

## Color Scheme

- Accent Yellow: #ecad0a
- Blue Primary: #209dd7
- Purple Secondary: #753991 (submit buttons)
- Dark Navy: #032147 (headings)
- Gray Text: #888888

---

## Инкрементальная работа

- Работай маленькими простыми шагами
- Проверяй каждый инкремент перед следующим
- Не переусложняй — простое решение лучше умного

---

## Дебаггинг

- Сначала стабильно воспроизведи проблему
- Определи корневую причину до исправления
- Одна гипотеза — один тест, методично
- Не применяй workarounds — исправляй причину, не симптом
- Не угадывай — доказывай
