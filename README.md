# KanbanAI — AI-Powered Task Manager

> A portfolio-quality, production-structured Kanban board with a genuine RAG pipeline and local LLM integration. No external AI API required.

---

## Features

- **AI Plan Generation** — Describe your project goal in plain English. AI generates tasks, subtasks, priorities, estimated hours, suggested deadlines, and dependencies.
- **Genuine RAG Pipeline** — Vector search over a domain knowledge base informs every AI response.
- **Local LLM (Ollama)** — Runs entirely offline. No OpenAI, no API keys.
- **Kanban Board** — Drag-and-drop between BACKLOG / TODO / IN PROGRESS / IN REVIEW / DONE.
- **JSON Viewer** — See the raw structured JSON the AI produces, with syntax highlighting and copy/download.
- **RAG Inspector** — Visualize retrieved documents, similarity scores, execution time, retry count.
- **AI Execution History** — Every LLM call is stored with model, prompt version, response, validation status.
- **Mock AI Mode** — Use without Ollama for UI development and demos.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, dnd-kit, TanStack Query, Lucide Icons |
| Backend | Node.js, Express 4, TypeScript, Clean Architecture (Routes → Controller → Service → Repository) |
| Database | SQLite via Prisma ORM |
| AI Runtime | Ollama (local LLM) or Mock mode |
| Embeddings | nomic-embed-text via Ollama or deterministic mock embeddings |
| Vector DB | Qdrant (via Docker) |
| Validation | Zod on both frontend and backend |
| Testing | Jest + ts-jest (backend), Vitest + @testing-library/react (frontend) |

---

## Architecture

```
User Goal (plain English)
       │
       ▼
  Generate Embedding
  (Ollama nomic-embed-text)
       │
       ▼
  Vector Search (Qdrant)
  ┌──────────────────────────┐
  │  React Frontend      ...  │ ←── Similarity scores shown in RAG Inspector
  │  Node.js API         Authentication, CRUD
  │  Prisma ORM          SQLite
  │  AI Service          RAG + LLM orchestration
  │  Qdrant              384-dim cosine similarity
  └──────────────────────────┘
       │
       ▼
  Build Prompt Context
  (retrieved knowledge chunks)
       │
       ▼
  Ollama LLM (llama3.2 or any model)
       │
       ▼
  Parse → Validate → Repair → Validate again
  (Zod schema, JSON repair, retry loop)
       │
       ▼
  Apply Business Rules
  (deadline validation, circular dependency detection)
       │
       ▼
  Persist Tasks → Kanban Board
```

---

## Project Structure

```
AI Powered Kanban Board/
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/           Layout, Navigation
│       │   ├── kanban/       KanbanBoard, KanbanColumn, TaskCard, TaskModal
│       │   └── ai/           JSONViewer, RAGInspector
│       ├── pages/            DashboardPage, ProjectsPage, CreateProjectPage, ProjectDetailPage
│       ├── hooks/            useProjects, useTasks, useAI
│       ├── services/         api.ts, projects.service.ts, tasks.service.ts, ai.service.ts
│       ├── types/            TypeScript interfaces
│       └── utils/            cn.ts, format.ts
│
├── backend/
│   ├── src/
│   │   ├── config/           config.ts (all env vars)
│   │   ├── middleware/        errorHandler.ts, validate.ts
│   │   ├── modules/
│   │   │   ├── projects/     controller + service + repository + routes
│   │   │   ├── tasks/        controller + service + repository + routes
│   │   │   ├── ai/           ai.service.ts, ai.schemas.ts, ai.validator.ts
│   │   │   │   └── providers/ base.provider.ts, ollama.provider.ts, mock.provider.ts
│   │   │   ├── rag/          rag.service.ts, vector-db.ts
│   │   │   └── knowledge/    chunker.ts, ingest.ts
│   │   ├── database/         client.ts (Prisma)
│   │   └── routes/           index.ts
│   ├── knowledge-base/        .md documents (7 domain files)
│   ├── tests/unit/           20 unit tests
│   └── prisma/schema.prisma  Project, Task, Subtask, AIExecution models
│
├── docker-compose.yml        Qdrant vector DB
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js 18+** (project uses v24)
- **Docker** (for Qdrant vector database)
- **Ollama** (for local LLM — optional, mock mode available)

---

### 1. Vector Database (Qdrant)

```bash
# Start Qdrant with Docker Compose
docker compose up -d

# Verify it's running
curl http://localhost:6333/collections
```

---

### 2. Local LLM (Ollama) — Optional

```bash
# Install Ollama from https://ollama.ai

# Pull models
ollama pull llama3.2
ollama pull nomic-embed-text

# Verify Ollama is running
ollama list
```

If Ollama is not installed, set `AI_PROVIDER=mock` in `backend/.env` to use the built-in mock mode.

---

### 3. Backend Setup

```bash
cd backend

# Copy environment config
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database and apply schema
npm run db:push

# Ingest knowledge base into Qdrant (requires Qdrant running)
npm run ingest

# Start development server
npm run dev
```

The backend runs on **http://localhost:3001**

---

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on **http://localhost:5173**

### Production deployment

Netlify deploys the React frontend only; the Express API, SQLite database, and AI/RAG services must run on a separate backend host. In Netlify, set the `VITE_API_URL` environment variable to that backend's public URL (with or without a trailing `/api`) before building. Without it, requests to `/api` are handled by the static-site fallback and project pages cannot load or generate plans.

#### Render backend

This repository includes `render.yaml` for deploying the API on Render. In Render, create a Blueprint from the repository and set `FRONTEND_URL` to the deployed Netlify URL. The default deployment uses the mock AI provider and SQLite; Render's local filesystem is ephemeral, so use a persistent database before treating the deployment as production data storage.

#### Netlify frontend

Create a site from the same repository. The existing `netlify.toml` sets the frontend base directory to `frontend`, uses `npm run build`, and publishes `frontend/dist`. Add `VITE_API_URL` in Netlify's environment variables using the Render service URL, then trigger a new deploy.

---

## Environment Variables

Edit `backend/.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Provider: "ollama" | "mock"
AI_PROVIDER=ollama

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
EMBEDDING_MODEL=nomic-embed-text

# Vector Database (Qdrant)
VECTOR_DB_URL=http://localhost:6333
VECTOR_COLLECTION=kanban_knowledge

# RAG Configuration
RAG_TOP_K=5
RAG_SIMILARITY_THRESHOLD=0.6
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

---

## Knowledge Base

The `backend/knowledge-base/` directory contains 7 domain knowledge documents:

| File | Category | Topics |
|---|---|---|
| `react-frontend.md` | Frontend | Component architecture, hooks, performance, testing |
| `nodejs-backend.md` | Backend | Express, API design, security, performance |
| `authentication.md` | Authentication | JWT, OAuth, RBAC, session management |
| `database-design.md` | Database | Schema design, Prisma, SQLite, indexing |
| `ecommerce.md` | E-commerce | Cart, checkout, Stripe, product catalog |
| `testing.md` | Testing | TDD, Jest, React Testing Library, E2E |
| `devops-deployment.md` | DevOps | Docker, CI/CD, monitoring, cloud deployment |
| `api-development.md` | API | REST design, versioning, rate limiting |
| `saas-architecture.md` | SaaS | Multi-tenancy, subscriptions, billing |

The ingestion pipeline:
1. Reads each `.md` file
2. Chunks text at paragraph boundaries with overlap
3. Generates embeddings via Ollama (`nomic-embed-text`)
4. Stores embeddings in Qdrant with metadata

---

## API Reference

### Projects
```
GET    /api/projects/stats     Dashboard statistics
GET    /api/projects           List all projects
POST   /api/projects           Create project
GET    /api/projects/:id       Get project with tasks
PUT    /api/projects/:id       Update project
DELETE /api/projects/:id       Delete project
```

### Tasks
```
GET    /api/projects/:id/tasks       List project tasks
POST   /api/projects/:id/tasks       Create task
GET    /api/tasks/:id                Get task
PUT    /api/tasks/:id                Update task
PATCH  /api/tasks/:id/status         Update status (Kanban DnD)
DELETE /api/tasks/:id                Delete task
POST   /api/tasks/:taskId/subtasks   Add subtask
PATCH  /api/tasks/subtasks/:id       Toggle subtask
DELETE /api/tasks/subtasks/:id       Delete subtask
```

### AI & RAG
```
GET    /api/ai/status                    Provider status (ollama/mock)
POST   /api/ai/generate-plan             Generate complete project plan
POST   /api/ai/chat                      AI chat with RAG context
POST   /api/ai/rag/search               Semantic vector search
GET    /api/ai/executions/:projectId     AI execution history
GET    /api/ai/execution/:id             Single execution details
```

---

## Testing

### Backend
```bash
cd backend
npm test              # Run all tests
npm run typecheck     # TypeScript check
npm run build         # Compile TypeScript
```

**20 unit tests** covering:
- `ai.validator.test.ts` — JSON validation, repair, extraction from markdown
- `chunker.test.ts` — Text chunking, empty input, indices
- `mock.provider.test.ts` — Mock LLM, embeddings, normalization

### Frontend
```bash
cd frontend
npm test              # Run Vitest
npm run typecheck     # TypeScript check
npm run build         # Vite production build
```

---

## Interview Q&A

### Why RAG?
Raw LLMs generate plausible but generic task breakdowns. RAG retrieves actual best-practice knowledge for the specific domain (React, e-commerce, auth) and injects it as context, producing task lists grounded in real engineering patterns.

### Why local LLM?
No API costs, no rate limits, no data leaving the machine. Privacy by default. The AI provider abstraction (`AIProvider` interface) means swapping to a cloud LLM is one line of config.

### How does task generation work?
1. User describes goal in plain English
2. Embedding generated for the goal text
3. Top-K most similar knowledge chunks retrieved from Qdrant
4. Structured prompt built: goal + retrieved context + JSON schema
5. LLM generates structured JSON
6. Zod validates; invalid JSON is repaired and retried (up to 3 times)
7. Business rules applied (deadline clamping, circular dependency detection)
8. Tasks persisted to SQLite and rendered on Kanban board

### How does vector search work?
Text chunks from the knowledge base are embedded into 384-dimensional vectors (cosine similarity space). When a query arrives, its embedding is compared against all stored vectors via cosine similarity. Top-K most similar chunks are returned. This is semantic search — "React hooks" matches "component state management" even without keyword overlap.

### How is AI output validated?
Every response goes through:
1. JSON extraction (strips markdown code blocks)
2. Zod schema validation against `AIPlanSchema`
3. If invalid: auto-repair (normalize priority/status values, add missing arrays)
4. Re-validate repaired JSON
5. If still invalid after 3 retries: throw `AppError(422)` — no bad data enters the database

### How are hallucinations reduced?
Retrieved knowledge anchors the LLM to real engineering patterns. The LLM can't invent tasks not grounded in the context. Zod validation rejects structurally invalid output. Business rules reject logically invalid output (past deadlines, impossible schedules, circular dependencies).

### Why an abstraction around the AI provider?
`AIProvider` interface with `OllamaProvider` and `MockProvider` implementations means:
- Swap to any local model by changing `OLLAMA_MODEL` env var
- Frontend dev works without Ollama via `AI_PROVIDER=mock`
- Unit tests use `MockProvider` without starting any LLM
- Future: add `ClaudeProvider`, `OpenAIProvider`, or `OllamaProvider` interchangeably
