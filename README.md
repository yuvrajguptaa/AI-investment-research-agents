# InvestIQ // AI Hedge Fund Research Terminal

InvestIQ is a production-quality, multi-agent investment research terminal. It takes a company name as input, triggers a sequential 10-node agentic workflow orchestrating data retrieval, financial audits, peer benchmarking, news sentiment extraction, bias check reflections, and committee votes. The system then issues a definitive investment recommendation (`INVEST` or `PASS`) with confidence levels.

## 🚀 Key Features
- **LangGraph.js Orchestration**: A state-managed sequential pipeline of 10 autonomous nodes.
- **Provider-Agnostic LLM**: Built with a provider abstraction layer supporting Google Gemini 2.5 Pro (default) and OpenAI GPT-4o.
- **Robust Multi-Source Tools**: Live integration with Yahoo Finance (`yahoo-finance2`), Tavily Search, and fallback news engines.
- **Hybrid Mongoose Storage**: Transparent repository layer connecting to MongoDB, with automatic JSON file storage fallback (`history_db.json`) if MongoDB is unavailable.
- **Premium Glassmorphic UI**: High-fidelity dark theme with Framer Motion, HTML5 SpeechRecognition (Voice Input), Portfolio Allocator, Ticker comparison panel, and Recharts metrics.

---

## 📂 Project Structure

```
insideIIM/
├── ai/                      # LangGraph.js & LLM Provider Node Workspace
│   ├── src/
│   │   ├── agents/          # Code for all 10 agents
│   │   ├── graph/           # State definitions and LangGraph workflow
│   │   ├── llm/             # Gemini & OpenAI abstraction provider
│   │   └── tools/           # Tavily and Yahoo Finance search integrations
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                 # Express.js REST API
│   ├── src/
│   │   ├── config/          # Mongoose database setup
│   │   ├── models/          # ResearchHistory schemas & local DB fallbacks
│   │   ├── app.ts           # Express routing & rate limits
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React.js (Vite) Single Page App
│   ├── src/
│   │   ├── components/      # Sidebar, Themes, and Layouts
│   │   ├── pages/           # Terminal, Results, History, & About Pages
│   │   ├── App.tsx          # React Router definition
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── README.md                # System documentation
└── package.json             # Root npm workspace
```

---

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite), TailwindCSS, React Router, Framer Motion, Recharts
- **Backend**: Node.js, Express.js
- **AI**: LangChain.js, LangGraph.js
- **Database**: MongoDB + Mongoose (with local JSON fallback)
- **LLM**: Google Gemini 2.5 Pro (via `@langchain/google-genai`)

---

## 🤖 The 10-Agent Workflow

1. **Company Research Agent**: Discovers ticker symbols and maps corporate segment summaries.
2. **Financial Analyst Agent**: Audits fundamental multiples (P/E, margins, cash flow, debt).
3. **Market Analyst Agent**: Analyzes industry growth CAGR, TAM limits, and headwinds.
4. **Risk Assessment Agent**: Models categorical threat metrics (regulatory, operational).
5. **Competitor Analysis Agent**: Profiles peer metrics and evaluates competitive moats.
6. **News Analysis Agent**: Mines news feeds, ranking media sentiment scales.
7. **Reflection Agent**: Critically audits previous nodes to flag biases or data gaps.
8. **Critic Agent**: Serves as devil's advocate, arguing why the committee should PASS.
9. **Investment Committee Agent**: Simulates Growth, Value, and Risk Partner vote debates.
10. **Final Decision Agent**: Harmonizes votes and details into a structured JSON recommendation.

---

## ⚙️ Quick Start Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Optional - the app will fall back to `history_db.json` automatically if offline)

### 2. Configure Environment Variables
Create a `.env` file at the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/investment-research

# LLM Core Config
LLM_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-pro

# Search API (Optional)
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
```

### 3. Bootstrap Dependencies
From the root directory, install all monorepo dependencies:
```bash
npm install
```

### 4. Build and Compile TypeScript Workspace
Run the build script to compile TypeScript files in the `ai` and `backend` layers:
```bash
npm run build
```

### 5. Launch the Application
Start the backend and frontend dev servers concurrently:
```bash
npm start
```
- **Hedge Fund Terminal (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **REST API (Backend)**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 REST API Documentation

- **GET `/api/health`**: Inspect server uptime and database mode (MongoDB vs local JSON file).
- **POST `/api/research`**: Validate request body `{ "company": "Tesla" }` and spawn the LangGraph pipeline.
- **GET `/api/history`**: Retrieve all past corporate reports.
- **GET `/api/research/:id`**: Query full interactive metrics for a specific report ID.
- **DELETE `/api/history/:id`**: Purge a research card from database history.
- **POST `/api/history/:id/favorite`**: Toggle the star favorite indicator status.
