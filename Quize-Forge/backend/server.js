require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for in-memory PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Quiz Generator API is running" });
});

// Upload PDF and extract text
app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    if (!text || text.trim().length < 100) {
      return res
        .status(400)
        .json({ error: "PDF has insufficient text content for quiz generation" });
    }

    res.json({
      success: true,
      text: text.trim(),
      pages: pdfData.numpages,
      wordCount: text.trim().split(/\s+/).length,
      filename: req.file.originalname,
    });
  } catch (err) {
    console.error("PDF parsing error:", err);
    res.status(500).json({ error: "Failed to parse PDF: " + err.message });
  }
});

// Generate quiz from extracted text
app.post("/api/generate-quiz", async (req, res) => {
  const {
    text,
    numQuestions = 5,
    difficulty = "medium",
    quizType = "multiple-choice",
  } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: "Text content is too short" });
  }

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const difficultyDesc = {
      easy: "simple, factual questions suitable for beginners",
      medium: "moderately challenging conceptual questions",
      hard: "deep, analytical and critical thinking questions",
    }[difficulty];

    let promptTemplate = "";

    if (quizType === "multiple-choice") {
      promptTemplate = `
You are a professional educator. Based on the following text, generate exactly ${numQuestions} multiple-choice quiz questions.
Difficulty level: ${difficultyDesc}.

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no explanation, no code blocks.

Format each question exactly like this:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "explanation": "Brief explanation of why this is correct"
  }
]

TEXT:
${text.substring(0, 8000)}
`;
    } else if (quizType === "true-false") {
      promptTemplate = `
You are a professional educator. Based on the following text, generate exactly ${numQuestions} true/false quiz questions.
Difficulty level: ${difficultyDesc}.

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no explanation, no code blocks.

Format each question exactly like this:
[
  {
    "id": 1,
    "question": "Statement here.",
    "options": ["True", "False"],
    "correctAnswer": "True",
    "explanation": "Brief explanation of why this is correct"
  }
]

TEXT:
${text.substring(0, 8000)}
`;
    } else if (quizType === "short-answer") {
      promptTemplate = `
You are a professional educator. Based on the following text, generate exactly ${numQuestions} short-answer quiz questions.
Difficulty level: ${difficultyDesc}.

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no explanation, no code blocks.

Format each question exactly like this:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": [],
    "correctAnswer": "The expected answer in 1-2 sentences",
    "explanation": "Additional context or explanation"
  }
]

TEXT:
${text.substring(0, 8000)}
`;
    }

    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    let rawText = response.text();

    // Clean up response - remove markdown code blocks if present
    rawText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Extract JSON array
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not extract valid JSON from AI response");
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI returned empty or invalid questions array");
    }

    res.json({
      success: true,
      questions,
      meta: {
        total: questions.length,
        difficulty,
        quizType,
      },
    });
  } catch (err) {
    console.error("Quiz generation error:", err);
    res.status(500).json({ error: "Failed to generate quiz: " + err.message });
  }
});

// Error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Max size is 20MB." });
    }
  }
  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Quiz Generator API running on http://localhost:${PORT}`);
  console.log(`   Gemini API Key: ${process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Not Set"}`);
});
