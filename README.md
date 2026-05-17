# 🛡️ AEGIS — Adaptive Evolving Guardian for Intelligent Synthesis

> AI-Powered Contract Intelligence Platform — Analyze legal documents, uncover hidden risks, and get actionable negotiation guidance.

---

## 🎯 Project Overview & Strategy

### 1. Chosen Vertical: LegalTech & Contract Intelligence
We selected the **Legal & Contract Intelligence** vertical. Standard legal support is prohibitively expensive, slow, and opaque for freelancers, small business owners, tenants, and employees. Most automated legal review systems simply scan for standard keywords. AEGIS elevates this by performing deep, context-aware risk analysis using structured agent workflows, demystifying the "legalese" into understandable, everyday scenarios.

### 2. Approach & Adversarial Debate Logic
Single-agent LLM reasoning often suffers from confirmation bias and fails to look at contracts critically. Real-world contract review is collaborative and adversarial. 

AEGIS simulates a **live legal team debate** utilizing three specific agent personas:
*   **User Advocate (The Defender)**: Analyzes the document strictly to look out for your interests. Flags unfair liabilities, non-competes, and broad IP transfers.
*   **Strict Judge (The Skeptic)**: Analyzes structure, undefined terms, missing termination timelines, logical loopholes, and ambiguities.
*   **Opposing Counsel (The Adversary)**: Simulates the other party's perspective. It specifically looks for ways a clause could be legally weaponized or exploited against you in court.

#### The Three-Round Debate Engine:
1.  **Phase 1: Deep Review & Flagging**: Each agent autonomously extracts and flags critical clauses based on their persona constraints.
2.  **Phase 2: Adversarial Cross-Examination**: The agents challenge each other's interpretations in a simulated debate panel.
3.  **Phase 3: Synthesis & Verdict**: The consensus is structured into a unified JSON format mapping risk categories, confidence metrics, and everyday scenarios.

### 3. How the Solution Works
1.  **Multimodal Upload**: Users upload any PDF, Word document, TXT, CSV, or raw image (OCR processed).
2.  **SSE Streaming Pipeline**: The server initiates the multi-agent debate and streams status updates (`Upload` ➔ `OCR` ➔ `Debate Engine` ➔ `Executive Report`) in real-time to the browser via Server-Sent Events (SSE).
3.  **Synthesized Dashboard**: The user is presented with:
    *   An overall calculated **Risk Score** (0-100) and **Risk Profile** (Low to Critical).
    *   Flagged clauses with plain-English consequences ("What Could Happen").
    *   **Actionable Questions**: Custom questions to ask oneself and specific clauses to raise with the counterparty during negotiation.
    *   **Actionable Data Exports**: Easy one-click download as JSON or formatted text reports.
4.  **Anonymized Reinforcement**: Users can submit feedback for each assessed risk, which stores anonymous embeddings for offline evaluation.

### 4. Assumptions & Design Decisions
*   **Optional Authentication / Zero Friction**: To ensure frictionless testing and allow automated reviewer bots to examine the site instantly, Firebase Authentication is completely optional. If a user signs in, their contract history is persisted. If not, they are granted guest access immediately with full feature accessibility.
*   **Privacy-First Document Lifecycles**: Raw contract documents are kept in memory and never persisted. Only the synthesized risk metadata report is saved to Firestore.
*   **Multimodal Capability**: Assumes all image uploads (PNG/JPG) are converted using Gemini's native OCR abilities.
*   **Non-Advisory Informational Scope**: AEGIS is strictly an informational tool to prepare signers for negotiation. It does not replace formal legal counsel (backed by explicit UI disclaimers).
*   **Multi-Model Orchestration**: Assumes backend processes run on rapid-throughput models (`gemini-2.5-flash` or `gemini-3-flash`) for low latency during streaming debates.

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
