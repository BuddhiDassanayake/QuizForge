# 🧠 QuizForge — AI-Powered Quiz Generator

Generate smart quizzes from any PDF using Google Gemini AI.

---

## 📁 Project Structure

```
quiz-app/
├── backend/          # Node.js + Express API
│   ├── server.js     # Main server (PDF parsing + Gemini AI)
│   ├── package.json
│   └── .env          
│
└── frontend/         # React app
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── UploadView.js   # Step 1: Upload PDF
    │   │   ├── ConfigView.js   # Step 2: Configure quiz
    │   │   ├── QuizView.js     # Step 3: Take quiz
    │   │   └── ResultsView.js  # Step 4: View results
    │   └── index.js
    └── package.json
```

---


## ✨ Features

| Feature | Details |
|---|---|
| 📤 PDF Upload | Drag & drop or click to browse, up to 20MB |
| 🧠 AI-Powered | Google Gemini 1.5 Flash generates questions |
| 📝 3 Quiz Types | Multiple Choice · True/False · Short Answer |
| 🎯 3 Difficulty Levels | Easy · Medium · Hard |
| 🔢 Custom Question Count | 3 to 15 questions |
| ✅ Auto-Scoring | Instant score with percentage & grade |
| 💡 Explanations | Every answer includes an AI explanation |
| 🔍 Review Mode | Expandable answer review for each question |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Axios |
| Backend | Node.js, Express |
| PDF Parsing | pdf-parse |
| AI Model | Google Gemini 1.5 Flash |
| Styling | Pure CSS with CSS Variables |

---

## 🐛 Troubleshooting

**"Failed to upload. Make sure the backend server is running."**
→ Start the backend with `npm start` in the `backend/` folder.

**"Check that your Gemini API key is set."**
→ Make sure `.env` exists in `backend/` with a valid `GEMINI_API_KEY`.

**"PDF has insufficient text content"**
→ The PDF might be scanned/image-based. Try a text-based PDF.

**CORS errors in browser**
→ Make sure you're running frontend on port 3000 and backend on 5000.

---

## 📦 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload & parse PDF → returns text |
| POST | `/api/generate-quiz` | Generate quiz from text via Gemini |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key |
| `PORT` | No (default: 5000) | Backend server port |
