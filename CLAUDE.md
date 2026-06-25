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
