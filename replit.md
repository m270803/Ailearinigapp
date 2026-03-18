# AI Learning Assistant

An AI-powered educational platform for document-to-knowledge transformation.

## Tech Stack
- **Frontend**: React 19 + Vite, Tailwind CSS 4 (port 5000)
- **Backend**: Node.js + Express 5, MongoDB (Mongoose) (port 8000)
- **AI**: Google Gemini 1.5-Flash API
- **Auth**: JWT + Bcrypt

## Project Structure
```
/
├── backend/          # Node.js/Express API server
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, error handling
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── utils/        # Helpers
│   └── server.js     # Entry point (port 8000)
└── frontend/
    └── ai-learning-assitant/   # React + Vite app
        └── src/
            ├── components/
            ├── context/
            ├── pages/
            ├── services/
            └── utils/
```

## Key Features
- PDF upload and text extraction
- AI-generated flashcards and quizzes
- Retrieval-Augmented Generation (RAG) chat with documents
- User authentication and progress tracking

## Configuration
- Backend env vars in `backend/.env` (MONGO_URI, JWT_SECRET, GOOGLE_GENAI_API_KEY)
- Frontend API calls proxied through Vite to backend at `localhost:8000`
- `BASE_URL` is empty string — Vite proxy handles `/api` routing

## Workflows
- **Start application**: `cd frontend/ai-learning-assitant && npm run dev` (port 5000, webview)
- **Backend API**: `cd backend && node server.js` (port 8000, console)
