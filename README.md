# AetherStudy

AetherStudy is an AI-powered study material generator that transforms free-form notes and topics into interactive flashcards and multiple-choice quizzes.

---

## Features

- Free-form user input for notes, topics, or study prompts
- AI-generated structured JSON response for flashcards and quizzes
- Interactive UI with deck selection, refinement, and study controls (not a chatbot)
- Loading, error, and empty states for better UX
- Retry mechanism via refinement input and regenerate flows
- Mobile-responsive design with tablet and desktop layout support
- Prevention of stale API responses using `AbortController`
- JSON validation, parsing, and data healing on the backend
- Session history with localStorage persistence for saved decks
- 3D flashcard flipping with mastery tracking
- Stateful quiz flow with score feedback and answer explanations
- Live refinement panel to update existing decks without losing the session
- Keyboard shortcuts and command palette for faster navigation

---

## Tech Stack

- React (Hooks + Functional Components)
- Vite for frontend bundling
- Node.js / Express backend server
- Groq AI SDK for model integration
- Custom CSS styling with glassmorphic design
- Additional libraries: `framer-motion`, `lucide-react`, `canvas-confetti`, `dotenv`, `cors`, `concurrently`, `nodemon`, `oxlint`

---

## Project Structure

```
project flam/
├── package.json          # Root workspace scripts and dev dependency management
├── server/               # Express backend server
│   ├── index.js          # API routing, Groq integration, JSON parsing, and repair logic
│   ├── package.json      # Server dependencies and scripts
│   └── .env.example      # Environment variable template for Groq API key
└── client/               # Vite React + TypeScript frontend
    ├── package.json      # Frontend dependencies and scripts
    ├── tsconfig.json     # TypeScript configuration for the client
    ├── index.html        # Main HTML entrypoint
    ├── src/
    │   ├── main.tsx      # React app bootstrap
    │   ├── App.tsx       # Core app state, generation flow, and UI layout
    │   ├── index.css     # Global styles, responsive layout, and glassmorphism
    │   ├── components/   # Modular UI components for flashcards, quizzes, sessions, and refinement
    │   └── utils/        # API client, timeout wrapper, and type definitions
```

---

## Installation

```bash
git clone https://github.com/olivechaitanya/AetherStudy.git
cd AetherStudy
npm install
```

After installing dependencies, run the app with:

```bash
npm start
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`.

---

## Notes

- Create a `server/.env` file from `server/.env.example` and add your valid `GROQ_API_KEY`.
- The backend proxies AI requests so the API key is never exposed in the browser.
- The client uses `localStorage` to persist recent study sessions.
