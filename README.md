# 🛡️ AEGIS — Adaptive Evolving Guardian for Intelligent Synthesis

> AI-Powered Contract Intelligence Platform — Analyze legal documents, uncover hidden risks, and get actionable negotiation guidance.

---

## What is AEGIS?

AEGIS is an AI-powered legal intelligence system that goes beyond simple contract summarization. It uses a **multi-agent adversarial debate** to analyze legal documents from multiple expert perspectives, identify risky clauses, simulate real-world consequences, and generate actionable questions you should ask before signing.

It's designed for anyone who signs contracts — freelancers, employees, tenants, founders — and wants to understand what they're agreeing to without hiring a lawyer.

### Key Insight

Most contract review tools just highlight keywords. AEGIS simulates a **legal team debating your contract** — a User Advocate, a Strict Judge, and an Opposing Counsel — then synthesizes their arguments into a clear risk report with specific questions you should raise during negotiation.

---

## How It Works

### 1. Upload Any Document
Upload a contract in any format — **PDF, DOCX, TXT, CSV, images** — up to 50MB. AEGIS uses Gemini's native multimodal capabilities to extract text, so even scanned documents and photos work.

### 2. Multi-Agent Debate Analysis
Behind the scenes, three AI agents with distinct legal personas analyze your contract:

| Agent | Role | What It Does |
|-------|------|-------------|
| **User Advocate** | Your defender | Finds clauses that are harmful, unfair, or overly restrictive to the signer |
| **Strict Judge** | The skeptic | Detects ambiguity, contradictions, undefined terms, and logical flaws |
| **Opposing Counsel** | The adversary | Simulates the counterparty's perspective — how clauses could be exploited against you |

The agents debate in **three rounds**:
1. **Independent Analysis** — Each agent reviews the contract and flags risky clauses
2. **Cross-Examination** — Agents challenge each other's findings
3. **Consensus & Scoring** — Final risk scores, scenarios, and questions are synthesized

### 3. Risk Dashboard
After the debate, you get a visual risk report:
- **Overall Risk Score** (0–100) with animated gauge
- **Risk Profile** — Low, Moderate, High, or Critical
- **Flagged Clauses** sorted by severity, each with:
  - The exact problematic text
  - Each agent's argument about why it's risky
  - A plain-language "what could happen" scenario
  - Actionable questions to ask yourself and the other party

### 4. Actionable Questions
AEGIS doesn't just tell you what's wrong — it tells you **what to do about it**:
- **Self-directed questions**: Things to ask yourself before signing
- **Counterparty questions**: Specific demands and clarifications to raise with the other party

### 5. Anonymized Feedback Loop
Users can rate each flagged clause as "Accurate", "Overstated", or "Missed". This feedback is anonymized and stored as embeddings to improve future analysis — making AEGIS smarter with every review.

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)             │
│  Login ─► Upload ─► Live Streaming ─► Risk Dashboard │
│          Drag & Drop    SSE Events    Clause Cards    │
└────────────────────────┬─────────────────────────────┘
                         │ REST + SSE
┌────────────────────────▼─────────────────────────────┐
│                   BACKEND (Express.js)                │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────┐ │
│  │ Auth Guard  │  │ Rate Limiter│  │ File Handler  │ │
│  └────────────┘  └─────────────┘  └───────────────┘ │
│                         │                             │
│  ┌──────────────────────▼──────────────────────────┐ │
│  │          Gemini Multi-Agent Debate Engine        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │ │
│  │  │ Advocate  │ │  Judge   │ │    Counsel     │  │ │
│  │  └──────────┘ └──────────┘ └────────────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
│                         │                             │
│  ┌──────────────────────▼──────────────────────────┐ │
│  │              Cloud Firestore                     │ │
│  │  Analyses • Feedback Embeddings • User Data     │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19, Vite 8, React Router | Fast, modern SPA with hot reload |
| **UI Design** | Vanilla CSS, Glassmorphism, Lucide Icons | Futuristic dark-mode UI with custom design system |
| **Backend** | Express.js (Node.js, ES Modules) | Lightweight API server with streaming support |
| **AI Engine** | Google Gemini 2.5 Flash / 3 Flash | Multimodal document understanding + structured JSON output |
| **Auth** | Firebase Authentication | Email/password + Google SSO (free tier) |
| **Database** | Cloud Firestore | Real-time NoSQL for analyses, feedback, user data |
| **Streaming** | Server-Sent Events (SSE) | Real-time AI debate tokens streamed to the browser |
| **Deployment** | Google Cloud Run + Nginx | Serverless containers, auto-scaling, free tier eligible |

---

## Project Structure

```
promptwars/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK init
│   ├── middleware/
│   │   ├── auth.js              # Firebase Auth middleware (dev mode bypass)
│   │   └── rateLimiter.js       # Request rate limiting
│   ├── prompts/
│   │   └── agents.js            # Agent system prompts + output schema
│   ├── routes/
│   │   ├── analyze.js           # POST /v1/analyze, GET /v1/analysis/:id
│   │   ├── feedback.js          # POST /v1/feedback
│   │   └── monitors.js          # Living contract monitors (future)
│   ├── services/
│   │   ├── debateEngine.js      # Orchestrates the full analysis pipeline
│   │   └── gemini.js            # Gemini API client with retry logic
│   ├── server.js                # Express app entry point
│   └── .env                     # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/            # Login page (dev mode + Firebase Auth)
│   │   │   ├── ClauseCard/      # Expandable clause analysis card
│   │   │   ├── Dashboard/       # Risk gauge, stats, questions panel
│   │   │   ├── Feedback/        # Clause accuracy feedback
│   │   │   ├── Layout/          # Header nav, footer, responsive shell
│   │   │   ├── RiskGauge/       # Animated SVG risk gauge
│   │   │   └── Upload/          # Drag-and-drop file upload
│   │   ├── hooks/
│   │   │   └── useAuth.jsx      # Auth context + dev mode
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Upload → streaming → dashboard flow
│   │   │   └── History.jsx      # Past analyses list
│   │   ├── services/
│   │   │   ├── api.js           # Backend API client with SSE support
│   │   │   └── firebase.js      # Firebase client SDK (auto dev mode)
│   │   ├── App.jsx              # Router + auth guards
│   │   └── index.css            # Global design system
│   └── index.html
│
├── env.md                       # Environment variables setup guide
├── deploy.sh                    # Google Cloud Run deployment script
└── README.md                    # This file
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free)

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### 2. Run locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# ✅ AEGIS Backend running on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# ✅ Ready at http://localhost:5173
```

### 3. Use it

1. Open `http://localhost:5173`
2. Click **"Quick Demo Login"** (dev mode — no Firebase needed)
3. Upload a contract or click **"Try Sample Contract"**
4. Watch the AI analyze your document in real-time
5. Review your risk report, debate details, and actionable questions

> See [env.md](./env.md) for the full environment variables guide including Firebase Auth setup.

---

## Supported Document Types

| Format | Extension | How It's Processed |
|--------|-----------|-------------------|
| PDF | `.pdf` | Gemini native multimodal |
| Word | `.docx`, `.doc` | Gemini native multimodal |
| Plain Text | `.txt` | Direct text extraction |
| CSV | `.csv` | Direct text extraction |
| Markdown | `.md` | Direct text extraction |
| Images | `.png`, `.jpg`, `.jpeg`, `.webp` | Gemini OCR |

---

## Deployment

AEGIS is designed to run entirely within Google Cloud's **free tier**:

| Service | Free Tier Limit |
|---------|----------------|
| Gemini API (AI Studio) | 15 RPM |
| Firebase Auth | 50,000 MAU |
| Cloud Firestore | 1 GiB storage, 50K reads/day |
| Cloud Run | 2M requests/month |

Deploy with the included script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This deploys the backend and frontend as separate Cloud Run services.

---

## Design Philosophy

- **Dark-mode futuristic UI** with glassmorphism and micro-animations
- **Zero friction** — dev mode lets you test instantly without any account setup
- **Streaming-first** — watch the AI think in real-time via SSE
- **Privacy by design** — feedback is anonymized, no raw documents stored permanently
- **Free tier optimized** — everything runs on Google Cloud's free tier

---

## Disclaimer

⚖️ AEGIS provides **informational insights only** and does not constitute legal advice. Always consult a qualified attorney for legal decisions.

---

## License

Built for PromptWars Hackathon 2026.
