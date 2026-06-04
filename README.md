# VowsAI — Premium Matchmaker Dashboard & Algo MVP

**VowsAI** is an elegant, full-stack internal dashboard and matchmaking engine designed for modern matrimonial matchmakers managing high-touch client files. 

Built with **Vite + React (Frontend)** and **Node.js + Express (Backend)**, VowsAI implements a detailed gender-specific compatibility algorithm, custom astrological and cultural logic for the Indian matrimonial space, and a resilient three-tier AI pipeline.

---

## 🌟 Core Features

### 1. Matchmaker Workspace
*   **Searchable Directory**: Manage assigned customers with full-text search and filters for matchmaking stages (*Onboarding*, *Searching*, *Matching*, *Engaged*, *Married*).
*   **Structured Biodata Viewer**: Organized tabs separating personal details, career and education achievements, family and lifestyle choices, and partner preferences.
*   **Meeting Notes Timeline**: Add and log client calls or meetings in real-time, immediately persisting them in our local database.
*   **Recommendations Log (Outbox)**: Dedicated dashboard history showing all suggested matches, send dates, and the custom introductory email bodies.

### 2. Compatibility Engine (`backend/matchingAlgo.js`)
*   **For Male Clients matching with Women**: Prioritizes candidates who are younger, earn less, are shorter, and share matching views on kids.
*   **For Female Clients matching with Men**: Compatibility assessed on professional synergy (tech/corporate career tracks), family values alignment, relocation flexibility, taller height, and equal-or-higher income.
*   **Indian Matrimonial Extensions**:
    *   **Gotra Collision Filter**: Hindu matches of the same Gotra apply a strict **-15% compatibility penalty** and trigger a visual warning badge.
    *   **Diet Matching**: Evaluates dietary habits (Veg, Jain, Non-Veg), applying boosts (+8%) or flagging dietary friction.
    *   **Location Boost**: Proximity boosts (+10%) for same-city candidates.
    *   **Manglik Compatibility**: Astrological matching bonuses and mismatch flags.
    *   **Community Boost**: Shared religion (+7%) and caste (+5%) compatibility scoring.

### 3. Three-Tier AI Resilience Pipeline
To ensure the application runs reliably without forcing reviewers to configure active API keys:
1.  **Tier 1 (OpenAI)**: Uses `gpt-3.5-turbo` to write match fit reasonings and personalized matchmaker intro emails if `OPENAI_API_KEY` is present.
2.  **Tier 2 (Groq)**: Falls back to Groq's high-speed `llama-3.1-8b-instant` if OpenAI is unconfigured or rate-limited.
3.  **Tier 3 (Local NLP Simulator)**: Falls back to a deterministic local template engine that compiles highly detailed, profile-specific evaluation text using candidates' real data, ensuring a fully functional mock system offline.

---

## 📁 Repository Structure

```
VowsAI/
├── backend/
│   ├── .env                 # API Key Configuration (ignored in Git)
│   ├── db.json              # Local JSON Database file
│   ├── server.js            # Express API Server and REST endpoints
│   ├── seed.js              # Database seed script (generates 120+ profiles)
│   ├── matchingAlgo.js      # Match compatibilty scoring functions
│   └── aiService.js         # OpenAI/Groq/Local AI generation handlers
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx    # Premium Login Card
│   │   │   └── Dashboard.js # Main Dashboard Workspace
│   │   ├── App.jsx          # Session state routing
│   │   ├── index.css        # Global CSS, variables, and animations
│   │   └── main.jsx         # App bootstrapping
│   ├── tailwind.config.js   # Custom styling color variables (Champagne Gold / Rose)
│   └── index.html           # Font preconnect configuration
├── package.json             # Root concurrently coordinator
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
*   **Node.js** (v18.0+)
*   **npm** (v9.0+)

### 1. Installation
Run the root script to install all packages in the workspace, frontend, and backend folders:
```bash
npm run install-all
```

### 2. Configure API Keys (Optional)
Create or edit the `.env` file in the `backend/` directory:
```env
PORT=5000
OPENAI_API_KEY=your-openai-key-here
GROQ_API_KEY=your-groq-key-here
```
*(If left blank, the application will automatically fall back to the dynamic Local Simulator, preventing any server crashes).*

### 3. Launch Development Server
Start both the Express backend server (port 5000) and the Vite frontend server (port 5173) concurrently:
```bash
npm run dev
```

### 4. Log In
Open your browser to `http://localhost:5173` and log in using:
*   **Username**: `admin`
*   **Password**: `password123`
