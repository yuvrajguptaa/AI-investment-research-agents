# 📈 InvestIQ: AI-Powered Investment Research Terminal

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-FF9900?style=flat)

Welcome to **InvestIQ**, an advanced, agentic AI platform designed to simulate a professional hedge fund research committee. 

## 📖 Overview — What it does
Given a target company, the system orchestrates a team of specialized AI agents—ranging from a **Financial Analyst** to a **Devil's Advocate**—working sequentially to gather real-time data, evaluate risks, analyze market conditions, and ultimately compile a comprehensive investment recommendation.

## 🚀 How to Run It

### Prerequisites
- **Node.js** (v18+)
- **Google Gemini API Key** (or OpenAI key if reconfigured)
- **Tavily API Key** (for real-time web search capabilities)
- (Optional) **MongoDB Atlas Connection String**

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yuvrajguptaa/AI-investment-research-agents.git
   cd AI-investment-research-agents
   ```

2. **Configure Environment Variables:**
   Rename `.env.example` to `.env` in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   TAVILY_API_KEY=your_tavily_key_here
   MONGODB_URI=your_mongodb_connection_string # Optional
   ```

3. **Install Dependencies:**
   This project uses `npm workspaces` to seamlessly manage the monorepo.
   ```bash
   npm install
   ```

4. **Build and Run:**
   ```bash
   npm run build
   npm start
   ```
   - 🌐 **Frontend** will be available at `http://localhost:3000`
   - ⚙️ **Backend API** will be available at `http://localhost:5000`

---

## 🧠 How It Works (Approach & Architecture)

The application is built using a modern decoupled architecture:

### 1. AI Orchestration Layer (`/ai`)
Powered by **LangGraph** and **LangChain**. It defines a state machine where multiple AI "nodes" act as specialized agents. The workflow includes:
- 🕵️ **Data Gatherers**: Fetching real-time news and web data via Tavily.
- 📊 **Analysts**: Financial, Market, and Risk Assessment nodes.
- ⚖️ **Critics**: A "Devil's Advocate" node that aggressively challenges the initial findings.
- 🧑‍⚖️ **Committee**: A final node that synthesizes the debate into a final Score (1-10) and Recommendation (BUY/HOLD/PASS).

### 2. Backend API (`/backend`)
An **Express.js (Node.js)** server that securely handles API requests, triggers the LangGraph workflow, and stores historical research in **MongoDB**. It features an automatic fallback to a local JSON file if a MongoDB URI isn't provided, ensuring maximum reliability.

### 3. Frontend UI (`/frontend`)
A **React** application built with **Vite**, **Tailwind CSS**, and **Framer Motion**, providing a premium, dark-mode "Bloomberg Terminal" aesthetic. 

---

## ⚖️ Key Decisions & Trade-Offs

- **LangGraph vs. Standard Prompting**: 
  - *Decision:* We used LangGraph to create cyclical and sequential agent workflows rather than a single massive LLM prompt.
  - *Why:* It allows the AI to self-reflect and critique its own work (via the Devil's Advocate node) before finalizing the report, drastically reducing hallucinations and bias.
- **Google Gemini vs. OpenAI**:
  - *Decision:* Implemented Google Gemini as the core LLM.
  - *Why:* Gemini offers a massive context window and extremely fast inference speeds, which is strictly necessary when passing large volumes of financial data and web search results between 10 different agents simultaneously.
- **Local Fallback Database**:
  - *Decision:* Implemented a dual-database system.
  - *Why:* If the MongoDB connection fails or is missing, the backend silently falls back to a local `history_db.json` file. This guarantees the app always runs out of the box for reviewers without tedious database setup.
- **Trade-off (WebSockets)**: 
  - *Left out:* Real-time WebSocket streaming of agent thoughts to the frontend.
  - *Why:* To ensure deployment reliability on serverless platforms (like Vercel and Render), we opted for a robust REST API with loading states rather than complex WebSocket connections that frequently drop on free tiers.

---

## 🧪 Example Runs

### 1. NVIDIA Corporation (NVDA)
- **Agent Output:** The Market Analyst node highlighted Nvidia's absolute monopoly in AI training GPUs and strong data center revenue growth. However, the Risk Assessor flagged heavy reliance on TSMC (Taiwan Semiconductor) and geopolitical tensions as critical vulnerabilities. 
- **Final Verdict:** Score **9.2/10 (STRONG BUY)**, citing that AI infrastructure spending vastly outweighs short-term supply chain risks.

### 2. Tesla, Inc. (TSLA)
- **Agent Output:** The Financial Analyst praised strong free cash flow and energy storage growth. The Devil's Advocate heavily criticized the aging vehicle lineup and increasing competition from BYD in China.
- **Final Verdict:** Score **6.8/10 (HOLD)**, recommending investors wait for clearer margins and Robotaxi regulatory approvals before increasing positions.

---

## 🔮 What I Would Improve With More Time

1. **Deterministic Financial Data**: Instead of relying solely on LLMs and Tavily web searches for financial data, I would integrate a strictly deterministic API (like Alpha Vantage or Yahoo Finance API) as a tool for the agents to pull exact P/E ratios and balance sheets.
2. **User Authentication**: Implement OAuth (via NextAuth or Clerk) so different users can log in and maintain their own private portfolios and research histories.
3. **Real-Time Streaming**: Implement Server-Sent Events (SSE) so the user can watch the agents "think" and debate in real-time on the frontend UI, rather than waiting for the final compiled JSON response.

---

## 🏆 BONUS: LLM Chat Transcript Included!
As requested for the bonus points, the **entire LLM chat session transcript** documenting the agentic generation, thought process, bug fixing, and architecture decisions made during the creation of this project has been included! 

You can find the full transcript in the root directory of this repository:
📁 **[`ai_development_transcript.jsonl`](./ai_development_transcript.jsonl)**

---
*Developed for the Inside IIM AI Engineer Role Assignment.*
