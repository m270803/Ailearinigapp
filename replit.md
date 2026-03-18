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
│   ├── models/       # Mongoose models (User, Document, Flashcard, Quiz)
│   ├── routes/       # API routes
│   ├── utils/        # geminiService.js, pdfParser.js
│   └── server.js     # Entry point (port 8000)
└── frontend/
    └── ai-learning-assitant/   # React + Vite app
        └── src/
            ├── components/
            │   ├── common/     # Spinner, Button, Tabs, PageHeader, MarkdownRenderer
            │   ├── chat/       # ChatInterface
            │   ├── documents/  # AIActionsTab, DocumentFlashcardsTab, DocumentQuizzesTab
            │   └── layout/     # AppLayout, Sidebar
            ├── context/        # AuthContext
            ├── pages/
            │   ├── Auth/       # LoginPage, RegisterPage
            │   ├── Dashboard/  # DashboardPage
            │   ├── Documents/  # DocumentListPage, DocumentDetailPage (5 tabs)
            │   ├── Flashcards/ # FlashcardListPage, FlashcardPage (flip cards)
            │   ├── Quizzes/    # QuizTakePage, QuizResultPage
            │   └── Profile/    # ProfilePage
            ├── services/       # authService, documentService, flashcardService,
            │                   # quizService, aiService, progressService
            └── utils/          # apiPaths.js, axiosInstance.js
```

## Key Features
- PDF upload and text extraction
- AI-generated flashcards (interactive flip cards with star/difficulty)
- AI-generated quizzes (multiple-choice with results breakdown)
- AI document summary generation
- RAG-based chat with documents
- User profile management (edit name/email, change password)
- Progress tracking dashboard

## API Routes
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `GET/PUT /api/auth/profile` — Get/Update profile
- `PUT /api/auth/change-password` — Change password
- `GET/POST /api/documents` — List/upload documents
- `GET/DELETE /api/documents/:id` — Get/delete document
- `GET /api/flashcards` — All flashcard sets for user
- `GET /api/flashcards/:documentId` — Flashcard sets for a document
- `POST /api/flashcards/:cardId/review` — Mark card reviewed
- `PUT /api/flashcards/:cardId/star` — Toggle star
- `DELETE /api/flashcards/:setId` — Delete set
- `GET /api/quizzes/:documentId` — Quizzes for a document
- `GET /api/quizzes/quiz/:id` — Get quiz by ID
- `POST /api/quizzes/:id/submit` — Submit quiz
- `GET /api/quizzes/:id/results` — Quiz results
- `POST /api/ai/generate-flashcards` — AI flashcard generation
- `POST /api/ai/generate-quiz` — AI quiz generation
- `POST /api/ai/generate-summary` — AI summary
- `POST /api/ai/chat` — Document chat
- `GET /api/progress/dashboard` — Dashboard stats

## Configuration
- Backend env vars in `backend/.env` (MONGO_URI, JWT_SECRET, GOOGLE_GENAI_API_KEY)
- Frontend API calls proxied through Vite to backend at `localhost:8000`
- `BASE_URL` is empty string — Vite proxy handles `/api` routing
- Gemini model: `gemini-1.5-flash` (higher free-tier quota than 2.0-flash)

## Workflows
- **Start application**: `cd frontend/ai-learning-assitant && npm run dev` (port 5000, webview)
- **Backend API**: `cd backend && node server.js` (port 8000, console)

## Known Issues / Notes
- Gemini API free tier: 15 RPM, 1500 RPD. If 429 quota errors appear, the user needs to wait or enable billing on their Google Cloud project.
- The quiz controller uses `sucess` (typo for `success`) — frontend handles both by using `res.data` directly.
- Quiz results page `explation` field is a backend typo for `explanation` — frontend reads it as `result.explation`.
