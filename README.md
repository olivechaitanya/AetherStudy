# AetherStudy — AI Study Assistant

A modern, responsive React web application that takes free-form text inputs, notes, or study topics, routes them through a secure backend, and uses Gemini AI to build interactive learning tools (3D Flashcards and Stateful Multiple-Choice Quizzes) with live refinement capabilities.

---

## Features

- **Double Study Modes**: 
  - **Flashcards Deck**: Supports 3D rotation flip animations, mastery tracking, visual hint blurring, and global keyboard controls (Arrow keys to navigate, Spacebar to flip).
  - **Interactive Quiz**: Visual MCQ setup with instant answer feedback (green/red highlights) and comprehensive explanations. Tracks score percentages with circular progress graphics.
- **Wrong Answer Re-test Loop**: A dedicated study loop that filters the active deck to only questions you missed, letting you re-test until you achieve 100% mastery.
- **Refinement Input**: Submit follow-up prompts to edit or extend your active study materials (e.g. *"translate to French"*, *"make questions harder"*, *"add 3 advanced concepts"*) without losing your session.
- **Session History Sidebar**: Automatic `localStorage` persistence that lets you save, reload, and delete past decks, complete with timestamps and material snippets.
- **Responsive Dark Theme**: A high-fidelity glassmorphic dark design tailored to mobile, tablet, and desktop viewports.

---

## Technical Architecture & Failure Mitigation

This app was built to handle unpredictable LLM failures robustly:
1. **JSON Output Guarantee**: Configures Gemini (`gemini-2.5-flash`) using `responseMimeType: "application/json"`.
2. **Backend Validation & Healing Layer**: If the AI returns malformed shapes (e.g. missing correct options, missing explanation fields, or array format anomalies), `server/index.js` sanitizes and repairs the data structure automatically.
3. **Race Condition Prevention**: Employs an `AbortController` in React. If a user triggers a generation request while a previous one is still loading, the previous request is immediately cancelled, preventing slow stale responses from overwriting newer ones.
4. **Hanging/Latency Protection**: Implements a 20-second request timeout. If the LLM api hangs, the client aborts and presents a clean error card with an automated retry action.
5. **Secure Routing**: Leverages a Node/Express backend to communicate with the Gemini API, ensuring your `GEMINI_API_KEY` is never exposed to the client browser.

---

## Project Structure

```
project flam/
├── package.json          # Root scripts to coordinate client/server workspaces
├── server/               # Express backend server
│   ├── index.js          # Server routing, validation & API logic
│   └── .env.example      # Example environment variables
└── client/               # Vite React + TypeScript frontend
    ├── index.html        # Main HTML and font configs
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx       # Core page layout, state management, and abort controllers
    │   ├── index.css     # CSS variables, animations, and glassmorphism styling
    │   ├── components/   # Subcomponents (Flashcards, Quiz, Input, SessionList, Refinement)
    │   └── utils/        # Fetch wrappers (with timeouts) and interfaces
```

---

## Setup & Running Instructions

Ensure you have **Node.js (v18+)** and **npm** installed.

### 1. Configure the API Key
1. Navigate to the `server` directory.
2. Duplicate `.env.example` and rename it to `.env`:
   ```bash
   cp server/.env.example server/.env
   ```
3. Open `server/.env` and replace `your_gemini_api_key_here` with a valid Gemini API key (you can obtain one for free from [Google AI Studio](https://aistudio.google.com/)).

### 2. Install & Start the App
Run these commands from the **root directory** of the project:

```bash
# Install dependencies for both frontend and backend workspaces
npm install

# Start both backend and frontend servers concurrently
npm start
```

- **Frontend client** will launch on: `http://localhost:5173`
- **Backend API server** will run on: `http://localhost:3001`

---

## AI Usage Note

This project was built in pair-programming collaboration with **Antigravity**, an agentic AI coding assistant by Google DeepMind:
- **Scaffolding & Architecture**: Used to organize the monorepo workspace configurations, root-level package JSONs, and TypeScript files.
- **Styling Design**: Assisted in tailoring index.css classes for the glassmorphic layouts, pulse animations, and 3D rotation properties.
- **Robustness Engineering**: Assisted in detailing the data-healing regex filters on the backend and writing the AbortController hooks on the frontend.

---

## Known Limitations

- **LocalStorage Volume**: Uses `localStorage` for session persistence. If notes pasted are exceptionally large (multiple megabytes), they may exceed browser storage allocations.
- **Rate Limits**: Uses standard Gemini public endpoints which are subject to Developer API free tier rate limits (approx. 15 requests/minute).

---

## Time Spent

- **Planning & Schema Design**: ~45 minutes
- **Backend & AI Integration**: ~1 hour 15 minutes
- **Frontend Components & Stateful Logic**: ~2 hours
- **UI Styling & Responsiveness Polish**: ~45 minutes
- **Verification, Compilation & Documentation**: ~30 minutes
- **Total Spent**: **~5 hours** (well under the 8-hour assignment cap).
