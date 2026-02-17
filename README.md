<div align="center">

<img src="docs/assets/banner.png" alt="ClawtBot Banner" width="100%">

<br>

<img src="docs/assets/logo.png" alt="ClawtBot Logo" width="120">

<br><br>

[![Version](https://img.shields.io/badge/version-1.0.0-00d4ff?style=for-the-badge&labelColor=0d1117)](https://github.com/avii-7/clawtbot)
[![Python](https://img.shields.io/badge/python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white&labelColor=0d1117)](https://python.org)
[![Next.js](https://img.shields.io/badge/next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0d1117)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0d1117)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-MIT-7c3aed?style=for-the-badge&labelColor=0d1117)](LICENSE)

**AI-Powered Social Media Automation with Multi-Agent Orchestration**

[Quick Start](#-quick-start) •
[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Documentation](#-documentation) •
[CLI Reference](#-cli-reference)

</div>

---

## 🧠 What is ClawtBot?

**ClawtBot** is an intelligent AI automation platform that manages your entire social media presence through conversational commands. It uses a **multi-agent architecture** — with specialized AI agents for content creation, hashtag generation, quality review, engagement, and analytics — all orchestrated by a central **Master Agent** you can talk to in natural language.

> *Built by **Abhishek Singh (Avii)** — AI enthusiast & automation architect.*

### Talk to it like a human:

```
You:  "Create a post about AI trends for Instagram"
Bot:  🚀 Running content pipeline → Content Creator → Hashtag Generator → Review Agent
      ✅ Post ready! Score: 8.5/10 — approved and scheduled.

You:  "Switch all agents to GPT-4o"
Bot:  ✅ All 5 agents switched to openai/gpt-4o

You:  "तुम कौन हो?"
Bot:  मैं ClawtBot हूँ, Abhishek Singh (Avii) द्वारा बनाया गया AI ऑटोमेशन सिस्टम! 🤖
```

---

## 📋 Version History

| Version | Date | Highlights |
|:-------:|:----:|:-----------|
| **v1.1.0** | Feb 2026 | 🔐 **Auth Module** — Registration (email/phone + OTP, social OAuth), login (password + OTP + 2FA), password recovery (link + OTP), TOTP 2FA (Google/Microsoft Authenticator), bcrypt hashing, rate limiting, account lockout, default admin user |
| **v1.0.0** | Feb 2026 | 🎉 Initial release — Master Agent with 18 intents, multi-provider LLM support (Ollama, OpenAI, Gemini, Anthropic, Groq), content pipeline, engagement bot, analytics, full Next.js dashboard, Docker support, `clawtbot` CLI, one-line installer |
| v0.9.0 | Feb 2026 | Master Agent identity, fallback protection, user memory & pattern tracking |
| v0.8.0 | Feb 2026 | Brain Layer — LLM Router with provider abstraction, hot-swap models per agent |
| v0.7.0 | Feb 2026 | Chat UI with voice input (Web Speech API), conversation persistence |
| v0.6.0 | Feb 2026 | Configurable ports system — single `.env` source of truth |
| v0.5.0 | Feb 2026 | Content pipeline — Creator → Hashtag → Review → Publish workflow |
| v0.4.0 | Feb 2026 | Celery task queue for async content scheduling |
| v0.3.0 | Feb 2026 | Frontend dashboard with dark glassmorphism design |
| v0.2.0 | Feb 2026 | Database schema — PostgreSQL + SQLAlchemy models |
| v0.1.0 | Jan 2026 | Project scaffold, initial architecture design |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 Master Agent
- **Conversational AI controller** — manage everything via chat
- **18 intents** — from content creation to system configuration
- **Multi-language** — responds in the same language you write in
- **Identity-aware** — knows it's ClawtBot, built by Avii
- **Voice input** — speak commands via Web Speech API

</td>
<td width="50%">

### 🛡️ Fault Tolerance
- **Multi-layer fallback** — Primary LLM → fallback chain → offline default
- **Never exposes errors** — always responds gracefully
- **User memory** — tracks patterns for personalized responses
- **Auto-derived config** — change a port, everything adapts

</td>
</tr>
<tr>
<td width="50%">

### 🧩 Multi-Agent System
- **Content Creator** — generates platform-specific content
- **Hashtag Generator** — researches trending hashtags
- **Review Agent** — scores and improves content quality
- **Engagement Bot** — auto-responds to comments
- **Analytics Agent** — tracks performance metrics

</td>
<td width="50%">

### 🔌 Multi-Provider LLM
- **Ollama** — free, local, private (default)
- **OpenAI** — GPT-4o, GPT-4-turbo, GPT-3.5
- **Google Gemini** — Gemini Pro, Flash
- **Anthropic** — Claude 3, Haiku, Sonnet
- **Groq** — Ultra-fast inference
- **Hot-swap** — change any agent's model live

</td>
</tr>
<tr>
<td width="50%">

### 📊 Dashboard
- **Dark glassmorphism UI** — premium, responsive design
- **Real-time status** — agent health, content stats
- **Content management** — create, review, approve, schedule
- **LLM settings** — configure providers & assign models
- **Chat interface** — full-screen Master Agent chat

</td>
<td width="50%">

### 🚀 DevOps Ready
- **One-line install** — `curl ... | bash`
- **Docker Compose** — full stack in one command
- **`clawtbot` CLI** — manage from terminal
- **Configurable ports** — no hardcoded values
- **Build pipeline** — tests → validate → build

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- **Multi-method signup** — email, phone, Google, Facebook, GitHub, Twitter
- **OTP verification** — email/phone verification before registration
- **TOTP 2FA** — Google Authenticator / Microsoft Authenticator
- **Password recovery** — reset via link or OTP code
- **Bcrypt hashing** — irreversible password encryption
- **Rate limiting** — sliding-window anti-brute-force
- **Account lockout** — auto-lock after 5 failed attempts (15 min)
- **Default admin** — `clawtbot@gmail.com` / `avii1994`

</td>
<td width="50%">

### 🔑 Auth Endpoints (20)
- `POST /auth/register` — signup with validation
- `POST /auth/login` — email/phone/username + password
- `POST /auth/login/otp` — passwordless OTP login
- `POST /auth/otp/send` — send OTP (login/signup/reset)
- `POST /auth/otp/verify` — verify OTP code
- `POST /auth/forgot-password` — send reset link + OTP
- `POST /auth/reset-password` — reset via token
- `POST /auth/reset-password/otp` — reset via OTP
- `POST /auth/change-password` — authenticated change
- `POST /auth/2fa/setup` — generate TOTP secret + QR
- `POST /auth/2fa/enable` — activate after verification
- `POST /auth/2fa/verify` — verify during login
- `GET /auth/oauth/{provider}/url` — OAuth redirect URL
- `POST /auth/oauth/callback` — OAuth code exchange

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  Frontend (Next.js 15)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Dashboard │ │  Chat UI │ │ Content  │ │LLM Settings│  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
└───────┼─────────────┼───────────┼──────────────┼─────────┘
        │             │           │              │
        ▼             ▼           ▼              ▼
┌──────────────────────────────────────────────────────────┐
│                Backend (FastAPI + Python)                 │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              🤖 Master Agent                        │ │
│  │  Identity │ Fallback Chain │ User Memory │ 18 Intents│ │
│  └──────────────────┬──────────────────────────────────┘ │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────────┐ │
│  │           🧠 Brain Layer (LLM Router)               │ │
│  │  Ollama │ OpenAI │ Gemini │ Anthropic │ Groq        │ │
│  └──────────────────┬──────────────────────────────────┘ │
│                     │                                    │
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐│
│  │Create│ │Hashtag │ │Review  │ │Engagement│ │Analytics││
│  │Agent │ │Agent   │ │Agent   │ │Bot       │ │Agent   ││
│  └──────┘ └────────┘ └────────┘ └──────────┘ └────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │        Celery Workers + Beat (Task Queue)           │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────┬──────────────┬──────────────┬─────────────────┘
           │              │              │
     ┌─────▼─────┐  ┌────▼────┐  ┌──────▼──────┐
     │PostgreSQL │  │  Redis  │  │   Ollama    │
     │   (DB)    │  │ (Cache) │  │  (Local AI) │
     └───────────┘  └─────────┘  └─────────────┘
```

---

## ⚡ Quick Start

### One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/avii-7/clawtbot/main/install.sh | bash
```

This auto-detects your system, installs deps, and sets up everything.

### Or choose your mode:

```bash
# 🐳 Docker (recommended — requires Docker)
curl -fsSL .../install.sh | bash -s -- --docker

# 💻 Local (requires Python 3.9+ & Node 18+)
curl -fsSL .../install.sh | bash -s -- --local

# 📁 Custom directory
curl -fsSL .../install.sh | bash -s -- --dir /opt/clawtbot
```

### Manual Setup

```bash
# 1. Clone
git clone https://github.com/avii-7/clawtbot.git
cd clawtbot

# 2. Configure
cp .env.example .env
# Edit .env with your API keys and port preferences

# 3a. Start with Docker
clawtbot docker up

# 3b. Or start locally
pip3 install -r requirements.txt
cd frontend && npm ci && cd ..
clawtbot start
```

---

## 🖥️ How to Access

Once running, open these in your browser:

| Service | URL | Description |
|:--------|:----|:------------|
| 🌐 **Dashboard** | `http://localhost:3000` | Main web interface |
| 🤖 **Master Agent Chat** | `http://localhost:3000/chat` | Chat with the AI |
| 🔧 **API** | `http://localhost:8000` | Backend REST API |
| 📚 **API Documentation** | `http://localhost:8000/docs` | Interactive Swagger UI |
| 📖 **ReDoc** | `http://localhost:8000/redoc` | Alternative API docs |

> **Note:** Ports are configurable in `.env` — if you changed them, use your custom ports.

---

## 🎮 CLI Reference

The `clawtbot` command manages everything from your terminal:

```bash
# ── Services ─────────────────────────────────────
clawtbot start              # Start all services locally
clawtbot stop               # Stop all services
clawtbot restart            # Stop + Start
clawtbot status             # Health check all services
clawtbot config             # Show current port configuration
clawtbot logs               # Tail service logs

# ── Docker ───────────────────────────────────────
clawtbot docker up          # Start via Docker Compose
clawtbot docker down        # Stop Docker containers
clawtbot docker logs        # Container logs
clawtbot docker build       # Build Docker images
clawtbot docker restart     # Rebuild + restart
clawtbot docker ps          # Container status

# ── Build & Test ─────────────────────────────────
clawtbot build              # Run tests → validate → build
clawtbot test               # Run test suite only

# ── Utilities ────────────────────────────────────
clawtbot chat "message"     # Chat with Master Agent from terminal
clawtbot flush-redis        # Clear Redis cache
clawtbot update             # Pull latest code + update deps
clawtbot uninstall          # Remove ClawtBot completely
clawtbot version            # Show version
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="96">
<b>Frontend</b>
</td>
<td>

**Next.js 15** — React framework with App Router, TypeScript, Tailwind CSS, glassmorphism UI

</td>
</tr>
<tr>
<td align="center" width="96">
<b>Backend</b>
</td>
<td>

**FastAPI** — High-performance Python API, async/await, Pydantic validation, auto-generated docs

</td>
</tr>
<tr>
<td align="center" width="96">
<b>Database</b>
</td>
<td>

**PostgreSQL 16** — Primary data store with SQLAlchemy ORM (async), Alembic migrations

</td>
</tr>
<tr>
<td align="center" width="96">
<b>Cache</b>
</td>
<td>

**Redis 7** — Caching, Celery message broker, session storage

</td>
</tr>
<tr>
<td align="center" width="96">
<b>Task Queue</b>
</td>
<td>

**Celery** — Async task execution, scheduled jobs (Beat), content pipeline orchestration

</td>
</tr>
<tr>
<td align="center" width="96">
<b>AI / LLM</b>
</td>
<td>

**Ollama** (local), **OpenAI**, **Google Gemini**, **Anthropic**, **Groq** — hot-swappable per agent

</td>
</tr>
<tr>
<td align="center" width="96">
<b>Deploy</b>
</td>
<td>

**Docker Compose** — Full stack containerized, configurable ports, health checks

</td>
</tr>
<tr>
<td align="center" width="96">
<b>Security</b>
</td>
<td>

**Fernet encryption** (API keys), **JWT auth** (access + refresh tokens), **Bcrypt** (password hashing), **TOTP 2FA**, **Rate limiting**, **Account lockout**, **OAuth 2.0** (4 providers), **CORS**, non-root containers

</td>
</tr>
</table>

---

## ⚙️ Configuration

All config lives in `.env` — ports are the **single source of truth**:

```env
# Service Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000
REDIS_PORT=6379
POSTGRES_PORT=5432
OLLAMA_PORT=11434

# URLs auto-derived from ports (or override manually)
NEXT_PUBLIC_API_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379/0
OLLAMA_HOST=http://localhost:11434

# LLM
OLLAMA_MODEL=llama3

# Auth
JWT_SECRET_KEY=your-secret-here

# OAuth / Social Login (leave empty to disable a provider)
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_FACEBOOK_APP_ID=
OAUTH_FACEBOOK_APP_SECRET=
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=
OAUTH_TWITTER_CLIENT_ID=
OAUTH_TWITTER_CLIENT_SECRET=

# Social APIs (see docs/HOW_TO_GET_API_KEYS.md)
INSTAGRAM_ACCESS_TOKEN=
FACEBOOK_ACCESS_TOKEN=
TWITTER_API_KEY=
YOUTUBE_API_KEY=
```

Change a port → run `clawtbot restart` → everything adapts automatically.

---

## 📁 Project Structure

```
clawtbot/
├── 🤖 clawtbot               # CLI entry point (run from anywhere)
├── 📦 install.sh              # One-line installer
├── 🚀 main.py                 # FastAPI application
├── ⚙️  config.py               # Pydantic settings (port auto-derivation)
│
├── auth/                      # 🔐 Authentication Module
│   ├── models.py              # User, OAuthAccount, OTPCode, LoginAttempt
│   ├── schemas.py             # Request/response validation (Pydantic)
│   ├── router.py              # 20 auth endpoints with rate limiting
│   ├── utils.py               # Bcrypt, JWT, OTP, TOTP, rate limiter
│   ├── oauth.py               # Google, Facebook, GitHub, Twitter OAuth
│   ├── dependencies.py        # JWT auth middleware
│   └── seed.py                # Default admin user seeder
│
├── agents/                    # AI Agents
│   ├── master_agent.py        # Master Agent (identity, fallback, memory)
│   ├── content_creator.py     # Content generation agent
│   ├── hashtag_generator.py   # Hashtag research agent
│   ├── review_agent.py        # Quality scoring agent
│   ├── engagement_bot.py      # Comment response agent
│   └── analytics_agent.py     # Performance tracking agent
│
├── brain/                     # LLM Abstraction Layer
│   └── llm_router.py          # Multi-provider router (5 providers)
│
├── api/                       # REST API Routes
│   ├── chat.py                # Master Agent chat endpoint
│   ├── content.py             # Content CRUD
│   └── llm_settings.py        # Provider & agent config
│
├── db/                        # Database
│   ├── database.py            # Async PostgreSQL connection
│   ├── models.py              # Content, User models
│   └── settings_models.py     # LLM config, Chat, Settings models
│
├── workflow/                  # Content Pipeline
│   └── pipeline.py            # Create → Hashtag → Review → Publish
│
├── frontend/                  # Next.js 15 Dashboard
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Dashboard
│       │   ├── chat/page.tsx       # Master Agent chat UI
│       │   ├── content/page.tsx    # Content management
│       │   ├── llm-settings/      # LLM configuration
│       │   └── (auth)/            # 🔐 Auth pages (no sidebar)
│       │       ├── login/         # Password + OTP login
│       │       ├── signup/        # Email/Phone/Social signup
│       │       ├── forgot-password/ # Password recovery
│       │       ├── reset-password/  # Reset via token or OTP
│       │       └── verify/        # OAuth callback handler
│       └── lib/
│           ├── api.ts             # Main API client
│           └── auth.ts            # Auth API client
│
├── scripts/
│   ├── start.sh               # Start services (reads .env)
│   ├── stop.sh                # Stop services
│   └── build.sh               # Test + build pipeline
│
├── docs/
│   ├── MASTER_AGENT.md        # Master Agent architecture
│   ├── HOW_TO_GET_API_KEYS.md # API key setup guide
│   └── assets/                # Logo, banner images
│
├── Dockerfile                 # Backend container
├── docker-compose.yml         # Full stack (7 services)
├── .env.example               # Config template
└── requirements.txt           # Python dependencies
```

---

## 📚 Documentation

| Document | Description |
|:---------|:------------|
| [Master Agent Architecture](docs/MASTER_AGENT.md) | Identity, fallback chain, user memory, 18 intents |
| [Authentication Module](docs/AUTH.md) | Auth architecture, endpoints, security features, OAuth setup |
| [How to Get API Keys](docs/HOW_TO_GET_API_KEYS.md) | Step-by-step guide for Instagram, Facebook, Twitter, YouTube, LLM providers |
| [Environment Config](.env.example) | All available settings with documentation |

---

## 👤 Built By

<table>
<tr>
<td>

**Abhishek Singh (Avii)**
AI Enthusiast & Automation Architect

*Building intelligent systems that automate the boring stuff.*

[![GitHub](https://img.shields.io/badge/GitHub-avii--7-181717?style=flat-square&logo=github)](https://github.com/avii-7)

</td>
</tr>
</table>

---

<div align="center">

<img src="docs/assets/logo.png" alt="ClawtBot" width="50">

**ClawtBot v1.0.0** — *Automate Everything.*

Made with ❤️ and ☕ by [Abhishek Singh (Avii)](https://github.com/avii-7)

</div>
