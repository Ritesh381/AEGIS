# Product Requirements Document (PRD)

## AEGIS – Adaptive Evolving Guardian for Intelligent Synthesis

### 1. Executive Summary

AEGIS is an AI-powered contract intelligence platform that analyzes legal agreements to identify risks, generate actionable negotiation questions, and provide ongoing monitoring. Unlike traditional document review tools, AEGIS uses a multi-agent debate system, scenario simulation, and a privacy-preserving feedback loop to continuously improve its risk detection accuracy. The system empowers individuals and organizations to understand complex legal documents, ask the right questions before signing, and stay informed about critical contractual deadlines.

### 2. Problem Statement

Individuals and organizations routinely accept legally binding agreements without fully understanding their implications. Standard contract review tools offer basic summarization or keyword-based risk flags, but lack:

- Deep reasoning about ambiguous, exploitative, or contradictory clauses.
- Concrete, real-world scenarios illustrating potential consequences.
- Actionable guidance in the form of questions to ask counterparties.
- Proactive monitoring of ongoing contractual obligations (renewals, terminations, price changes).
- Continuous improvement based on user feedback and real-world outcomes.

AEGIS addresses these gaps by delivering an intelligent, self-improving system that mimics a team of legal experts debating the contract, then translates insights into plain-language questions and ongoing alerts.

### 3. Target Users

| User Persona              | Description                                                                     | Primary Needs                                                                         |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Freelancers / Gig Workers | Review client agreements, intellectual property clauses, payment terms          | Identify unfair IP transfer, late payment penalties, exclusivity clauses              |
| Employees                 | Employment contracts, non-compete agreements, severance terms                   | Detect restrictive non-competes, ambiguous termination conditions, hidden liabilities |
| Consumers                 | Terms of service, subscription agreements, rental contracts, insurance policies | Find automatic renewals, data collection practices, one-sided arbitration             |
| Small Business Owners     | Vendor agreements, partnership contracts, NDAs                                  | Spot unfavorable liability limits, hidden fees, compliance risks                      |

### 4. Core Features & Functional Requirements

#### 4.1 Document Ingestion & Pre-processing

- **Supported formats:** PDF (including scanned), DOCX, TXT, and image files (PNG, JPEG).
- **OCR pipeline:** Google Document AI for text extraction from scanned documents and images, preserving layout (headings, lists, tables).
- **File size limit:** 50 MB per document.
- **Storage:** Original files stored in Google Cloud Storage with server-side encryption.

#### 4.2 Multi-Agent Debate System

The system employs a team of AI agents, each with a distinct role, coordinated by an Orchestrator Agent. The agents perform a multi-turn structured debate to analyze the contract.

**Agent Roles:**

| Agent                | Role Description                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Orchestrator**     | Central controller; ingests the document, delegates tasks, synthesizes outputs, and generates final reports. Powered by Gemini 2.5 Pro.                                                    |
| **User Advocate**    | Identifies clauses that are unfair, risky, or overly restrictive from the end-user’s perspective.                                                                                          |
| **Strict Judge**     | Detects ambiguous language, logical contradictions, vague definitions, and illogical legal constructs.                                                                                     |
| **Opposing Counsel** | Simulates the counterparty’s viewpoint to highlight how clauses could be exploited against the user.                                                                                       |
| **Scenario Agent**   | Runs quantitative “what-if” simulations on flagged clauses (e.g., financial impact of liability caps, enforcement of non-competes under different conditions). Uses Gemini Code Execution. |

**Debate Protocol:**

1. **Initial independent analysis:** Each specialist agent (Advocate, Judge, Counsel) analyzes the full contract and flags clauses with associated reasoning.
2. **Debate rounds (configurable, default 3):** The Orchestrator shares each agent’s findings with the others. Agents critique each other’s conclusions. The Judge challenges the Advocate; the Counsel adds counterarguments. The Scenario Agent injects simulation results for high-risk clauses.
3. **Consensus & ranking:** After the final round, the Orchestrator assigns a **Risk Severity Score** (0–100) and a **Confidence Score** to each flagged clause based on the debate outcome.

#### 4.3 Scenario Generation Loop

For each clause that receives a risk score above a configurable threshold (default >50), the Scenario Agent performs:

- **Counterfactual simulation:** “What if the user violates this non-compete?” “What if the counterparty invokes the indemnification clause?”
- **Quantitative modeling:** Uses Gemini Code Execution to compute financial exposure (e.g., maximum liability, lost income due to non-compete duration).
- **Narrative output:** A short, plain-language description of one or more possible real-world consequences, e.g., _“If you accept this clause and later leave your job to start a similar business, the non-compete could bar you from working in your industry for 18 months within a 50-mile radius.”_

#### 4.4 Trigger-Based Question Generation

Instead of a generic risk report, AEGIS produces a prioritized list of **questions** the user should ask themselves and the counterparty before signing. Questions are derived from the debate and scenario outcomes.

- **Self-directed questions** – for user reflection: _“Do you have plans to change jobs in the next 12 months? This non-compete would restrict that.”_
- **Counterparty questions** – for negotiation: _“Can you remove the automatic renewal clause or change it to opt-in only?”_ _“Please clarify what ‘reasonable commercial efforts’ means in Section 4(b).”_

**Generation method:** The Orchestrator takes each high-risk clause + its debate record + scenario output and prompts Gemini 2.5 Pro to formulate 1–3 specific, actionable questions. Questions are categorized by severity (Critical, Important, Nice-to-know).

#### 4.5 Risk Scoring & Reporting

The final output for each analyzed contract includes:

- **Overall Risk Score** (0–100) – aggregate of all clause-level scores weighted by severity.
- **Risk Profile** (Low / Moderate / High / Critical) – based on highest individual clause score.
- **Interactive Dashboard** – clause-level view with:
  - Original clause text (highlighted)
  - Agent debate summary (shortened)
  - Scenario consequence
  - Generated questions
  - Risk score breakdown
- **Exportable report** – PDF or JSON containing full analysis.

#### 4.6 Living Contract Monitor (Optional Feature)

Users may opt to monitor any analyzed contract for time-based events. The system will proactively send alerts via email, SMS, or in-app notification.

**Supported event types:**

- Renewal deadlines (automatic renewal, opt-out windows)
- Termination notice periods
- Price increase effective dates
- Expiration dates of non-compete or confidentiality obligations
- Compliance reporting deadlines

**Implementation:**

- After analysis, user selects “Enable monitoring” for a contract.
- User sets reminder preferences (e.g., 30 days before, 7 days before, day of).
- A Cloud Scheduler job is created with a Pub/Sub topic and triggered at appropriate times.
- A Cloud Function sends the notification using Firebase Cloud Messaging (for in-app) and SendGrid (for email).

Users can view and manage all active monitors from the dashboard.

#### 4.7 Privacy-Preserving Feedback & Learning Loop

The system improves over time without exposing user documents or personal data.

**Feedback collection:**

- After viewing the analysis, user can mark each flagged risk as **“Accurate,” “Overstated,”** or **“Missed”** (with optional free-text comment).
- All feedback is anonymized – no user ID or document text is retained with the feedback entry.

**Learning mechanism:**

- For each feedback entry, the system generates an embedding of the corresponding clause snippet (using Gemini Embeddings).
- The embedding vector is stored in **Vertex AI Vector Search** along with:
  - A label (accurate / overstated / missed)
  - The risk type category (non-compete, IP transfer, etc.)
- During future analyses, the Orchestrator queries the vector store for similar clauses (cosine similarity >0.85) and retrieves the aggregated feedback patterns.
- If similar clauses have a high “overstated” or “missed” history, the system adjusts its confidence score and may lower the risk severity for that clause pattern.

**Result:** The system becomes increasingly accurate and nuanced across all users without storing any identifiable user data or raw contract text.

### 5. Non-Functional Requirements

| Category                | Requirement                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance**         | Document analysis completed within 45 seconds for documents up to 50 pages (Gemini 2.5 Pro latency).                                                                |
| **Scalability**         | Horizontally scalable on Google Cloud Run; supports hundreds of concurrent users.                                                                                   |
| **Availability**        | 99.9% uptime for core analysis endpoints; monitoring alerts have 99.95% delivery success.                                                                           |
| **Security**            | Data encrypted at rest (AES-256) and in transit (TLS 1.3). No persistent storage of user contracts beyond analysis retention period (configurable, default 7 days). |
| **Privacy**             | Anonymized feedback pipeline; no PII stored in vector database.                                                                                                     |
| **Real-time operation** | Dashboard updates via WebSocket for live debate visualization (optional).                                                                                           |
| **Compliance**          | System does not provide legal advice; includes disclaimer on every report.                                                                                          |

### 6. System Architecture

#### 6.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                               │
│  React SPA (hosted on Cloud Run) – User dashboard, upload, reports, alerts  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                               │
│  Cloud Endpoints / API Gateway – Authentication, rate limiting, routing     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATION & AGENT LAYER                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │          Agent Development Kit (ADK) + Gemini 2.5 Pro                  │ │
│  │  Orchestrator Agent │ User Advocate │ Strict Judge │ Opposing Counsel │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        Scenario Agent (Gemini Code Exec)               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA & STORAGE LAYER                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────────┐   │
│  │  Firestore    │  │ Cloud Storage │  │ Vertex AI Vector Search        │   │
│  │ (User profiles│  │ (Raw docs,    │  │ (Feedback embeddings,          │   │
│  │  analyses)    │  │  reports)     │  │  clause similarity)            │   │
│  └───────────────┘  └───────────────┘  └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LIVING MONITOR & ALERTS LAYER                         │
│  Cloud Scheduler → Pub/Sub → Cloud Function → FCM / SendGrid                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│  - Google Document AI (OCR)                                                 │
│  - Gemini API (2.5 Pro, 1.5 Flash, Embeddings, Code Execution)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.2 Component Descriptions

| Component           | Technology                     | Purpose                                                                                  |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| Web Dashboard       | React, Tailwind CSS            | User interface for upload, results, monitoring.                                          |
| API Gateway         | Cloud Endpoints                | Authenticate requests (API key or Firebase Auth), rate limit, route to backend services. |
| Agent Orchestration | Google ADK + Gemini 2.5 Pro    | Run multi-agent debate, manage state, call tools (scenario simulation, vector search).   |
| Document Processing | Document AI + Gemini 1.5 Flash | OCR for scanned docs; pre-processing (chunking, clause boundary detection).              |
| Vector Store        | Vertex AI Vector Search        | Store and retrieve clause embeddings for similarity matching (feedback loop).            |
| Database            | Firestore                      | Store user metadata, analysis summaries, monitor schedules.                              |
| Object Storage      | Cloud Storage                  | Store uploaded documents and generated reports (with auto-expiry).                       |
| Monitoring Events   | Cloud Scheduler + Pub/Sub      | Schedule and trigger deadline alerts.                                                    |
| Notifications       | Cloud Functions + FCM/SendGrid | Deliver alerts to users.                                                                 |

### 7. Data Models

#### 7.1 Firestore Collections

**`users`** (document ID = user ID from Firebase Auth)

```json
{
  "email": "user@example.com",
  "createdAt": "2025-03-15T10:00:00Z",
  "preferences": {
    "notificationsEmail": true,
    "notificationSms": false
  }
}
```

**`analyses`** (document ID = auto-generated)

```json
{
  "userId": "user123",
  "originalFileName": "employment_contract.pdf",
  "uploadedAt": "2025-03-15T10:05:00Z",
  "status": "completed",
  "overallRiskScore": 72,
  "riskProfile": "High",
  "clauses": [
    {
      "clauseId": "cl_001",
      "originalText": "Employee agrees not to compete...",
      "riskScore": 88,
      "confidence": 0.92,
      "riskCategory": "non_compete",
      "debateSummary": "Advocate: Overly broad... Judge: Ambiguous geographic scope...",
      "scenario": "If you leave and join a competitor within 50 miles, you could be sued for damages.",
      "generatedQuestions": [
        "Self: Do you plan to stay in this industry for the next 2 years?",
        "Counterparty: Can we limit the non-compete to 6 months and 10 miles?"
      ]
    }
  ],
  "reportUrl": "https://storage.googleapis.com/..."
}
```

**`monitors`**

```json
{
  "monitorId": "mon_001",
  "userId": "user123",
  "analysisId": "analysis_abc",
  "contractName": "Employment Contract",
  "events": [
    {
      "type": "renewal_deadline",
      "date": "2026-01-01",
      "reminderDays": [30, 7, 1],
      "messageTemplate": "Your contract auto-renews in {days} days. Review terms."
    }
  ],
  "active": true
}
```

#### 7.2 Vector Database Index Schema (Vertex AI Vector Search)

| Field                   | Type              | Description                                                     |
| ----------------------- | ----------------- | --------------------------------------------------------------- |
| `embedding`             | float[] (768-dim) | Gemini embedding of clause snippet.                             |
| `clause_category`       | string            | non_compete, ip_transfer, liability, privacy, arbitration, etc. |
| `feedback_label`        | string            | accurate / overstated / missed                                  |
| `risk_score_adjustment` | float             | -10 to +10 (based on feedback).                                 |

### 8. API Specifications (Key Endpoints)

All endpoints require `Authorization: Bearer <token>` (Firebase Auth).

#### 8.1 Document Analysis

**`POST /v1/analyze`**

Request (multipart/form-data):

- `file`: PDF/DOCX/image (max 50MB)
- `analysis_config` (optional JSON): `{"debate_rounds": 3, "include_scenarios": true}`

Response (202 Accepted):

```json
{
  "analysis_id": "an_xyz123",
  "status_url": "/v1/analysis/an_xyz123/status"
}
```

**`GET /v1/analysis/{analysis_id}`**

Response (200 OK when complete):

```json
{
  "status": "completed",
  "overall_risk_score": 72,
  "risk_profile": "High",
  "clauses": [ ... ],
  "generated_questions": [ ... ],
  "report_url": "https://..."
}
```

#### 8.2 Living Monitor

**`POST /v1/monitors`**

Request body:

```json
{
  "analysis_id": "an_xyz123",
  "contract_name": "Employment Contract",
  "events": [
    {
      "type": "renewal_deadline",
      "date": "2026-01-01",
      "reminder_days": [30, 7, 1]
    }
  ]
}
```

Response:

```json
{
  "monitor_id": "mon_abc",
  "status": "active"
}
```

#### 8.3 Feedback

**`POST /v1/feedback`**

Request body:

```json
{
  "analysis_id": "an_xyz123",
  "clause_id": "cl_001",
  "feedback_type": "accurate", // or "overstated", "missed"
  "comment": "The non-compete was indeed too broad."
}
```

Response: 204 No Content (feedback processed asynchronously).

### 9. User Interface & Experience (Key Screens)

#### 9.1 Upload & Analysis Setup

- Drag-and-drop file upload area.
- Optional settings: number of debate rounds (default 3), enable/disable scenario simulation.
- Progress indicator showing: OCR → Clause extraction → Agent debate (round 1/3, 2/3, etc.) → Scenario generation → Question formulation.

#### 9.2 Risk Report Dashboard

- Top section: Overall risk score (gauge chart) + risk profile + summary.
- Main area: Collapsible list of clauses sorted by risk score.
  - Each clause card shows: original text excerpt, risk score badge, short debate outcome, scenario consequence (if enabled).
  - Clicking expands to show full debate details and generated questions.
- “Export as PDF” button.
- “Enable Living Monitor” button (for opted-in users).

#### 9.3 Living Monitor Management

- List of monitored contracts with upcoming deadlines.
- Ability to add, edit, or delete monitors.
- Notification log (what was sent, when).

#### 9.4 Feedback Panel

- After analysis, a side panel asks: “Were these risks accurate?”
- Simple thumbs up/down per clause, with optional text box.
- Brief explanation of how feedback improves the system (privacy anonymized).

### 10. Technical Implementation Notes

#### 10.1 Multi-Agent Debate Prompt Engineering

Each agent receives a system prompt defining its persona and responsibilities. Example snippet for **User Advocate**:

```
You are a User Advocate specializing in contract review. Your job is to read the provided contract and identify clauses that could harm the individual signing it. Focus on:
- Hidden financial liabilities
- Unfair non-compete or non-solicit restrictions
- Broad intellectual property assignments
- One-sided termination or renewal clauses
- Excessive data collection or privacy risks

For each clause you flag, explain in one sentence why it is harmful. Be concrete.
```

The **Strict Judge** prompt includes instructions to detect ambiguous language, undefined terms, contradictory statements, and logical fallacies.

The **Orchestrator** prompt defines the debate protocol and output format.

#### 10.2 Feedback Embedding & Similarity Search

After receiving feedback, the system:

1. Extracts the clause snippet (50–200 characters) from the original analysis.
2. Calls `gemini-embedding-exp-03-07` to generate a 768-dim vector.
3. Stores in Vertex AI Vector Search with the feedback label and category.
4. During future analyses, the Orchestrator retrieves up to 10 nearest neighbors for each new clause snippet. If the neighbors contain “overstated” labels with high similarity (>0.85), it reduces the risk score by a configurable amount (e.g., -15%).

#### 10.3 Scenario Simulation Using Gemini Code Execution

For a flagged clause, the Orchestrator constructs a prompt that includes:

- The clause text.
- A request: “Write Python code to model the worst-case financial impact if this clause is enforced.”
- Example: For a liability cap of $5,000, the code computes potential loss if damages exceed that amount.

Gemini 2.5 Pro (with code execution enabled) returns both the code and the execution result (e.g., “Maximum out-of-pocket = $5,000; damages above that are uncollectible.”).

### 11. Security & Privacy

- **Authentication:** Firebase Authentication (email/password or Google SSO).
- **Data retention:** User-uploaded contracts deleted after 7 days by default (configurable). Analysis reports stored for 90 days.
- **Anonymization of feedback:** No user identifier stored with vector embeddings. No document text stored in feedback pipeline.
- **Audit logging:** All API requests logged to Cloud Logging with user ID (for abuse prevention); logs retained 30 days.
- **Disclaimer:** Every report and email includes: _“AEGIS provides informational insights only and does not constitute legal advice. Consult a qualified attorney for legal decisions.”_

### 12. Deployment & Scalability

- **Compute:** Cloud Run for API and dashboard (min 2 instances, max 20; CPU always allocated for low latency).
- **Database:** Firestore in Native mode with regional replication.
- **Storage:** Cloud Storage bucket with lifecycle policy (delete objects older than 7 days).
- **Vector search:** Vertex AI Vector Search index with 1 replica; autoscaling enabled.
- **Monitoring:** Cloud Monitoring dashboards for latency, error rates, and agent debate success rates.

### 13. Success Metrics (KPIs)

| Metric                                   | Target                                        |
| ---------------------------------------- | --------------------------------------------- |
| Analysis completion time (50-page doc)   | < 45 seconds (p95)                            |
| User satisfaction (post-analysis survey) | > 4.5/5                                       |
| Feedback submission rate                 | > 30% of analyses                             |
| Risk detection accuracy (precision)      | > 85% (measured via user “accurate” feedback) |
| Living monitor alert delivery            | 99.9% within 5 minutes of scheduled time      |

### 14. Future Enhancements (Post-MVP)

- **Multi-language support:** Expand Gemini prompts and OCR to French, Spanish, German, Japanese.
- **Team/organization accounts:** Shared review queues, permission controls.
- **Integration with DocuSign/HelloSign:** Automatically trigger analysis before e-signature.
- **Custom clause libraries:** Enterprises can upload “approved” vs. “unacceptable” clause templates.
- **Voice interface:** Ask AEGIS via Google Assistant / Alexa: “What does my non-compete say?”

---

This PRD describes a complete, production-ready system that fulfills all the stated requirements: multi-agent debate, scenario simulation, trigger-based questions, living contract monitor, and a privacy-safe learning loop. The architecture leverages Google Cloud and Gemini API for optimal performance and scalability.
