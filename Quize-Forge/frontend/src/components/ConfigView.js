import React, { useState } from "react";
import axios from "axios";
import "./ConfigView.css";

const QUIZ_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice", icon: "◉", desc: "4 options per question" },
  { value: "true-false", label: "True / False", icon: "⊙", desc: "Binary answers" },
  { value: "short-answer", label: "Short Answer", icon: "✎", desc: "Open-ended responses" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "var(--success)", desc: "Factual recall" },
  { value: "medium", label: "Medium", color: "var(--warning)", desc: "Conceptual" },
  { value: "hard", label: "Hard", color: "var(--error)", desc: "Critical thinking" },
];

export default function ConfigView({ pdfData, onGenerated, onBack }) {
  const [quizType, setQuizType] = useState("multiple-choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [loadMsg, setLoadMsg] = useState("");

  const loadMessages = [
    "Reading your document...",
    "Understanding key concepts...",
    "Crafting clever questions...",
    "Adding tricky distractors...",
    "Polishing the quiz...",
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    let msgIdx = 0;
    setLoadMsg(loadMessages[0]);

    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadMessages.length;
      setLoadMsg(loadMessages[msgIdx]);
    }, 2200);

    try {
      const res = await axios.post("/api/generate-quiz", {
        text: pdfData.text,
        numQuestions,
        difficulty,
        quizType,
      });
      clearInterval(interval);
      onGenerated(res.data.questions, { quizType, difficulty, numQuestions, filename: pdfData.filename });
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || "Failed to generate quiz. Check that your Gemini API key is set.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="config-view animate-fadeUp">
      <div className="config-header">
        <button className="back-btn" onClick={onBack} disabled={isGenerating}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="pdf-badge">
          <span className="pdf-badge-icon">📄</span>
          <div className="pdf-badge-info">
            <span className="pdf-badge-name">{pdfData.filename}</span>
            <span className="pdf-badge-meta">{pdfData.pages} pages · {pdfData.wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </div>

      <h2 className="config-title">Configure your quiz</h2>
      <p className="config-subtitle">Customize how Gemini AI will generate questions from your PDF.</p>

      {/* Quiz Type */}
      <section className="config-section">
        <h3 className="section-label">Question Type</h3>
        <div className="type-grid">
          {QUIZ_TYPES.map((t) => (
            <button
              key={t.value}
              className={`type-card ${quizType === t.value ? "selected" : ""}`}
              onClick={() => setQuizType(t.value)}
              disabled={isGenerating}
            >
              <span className="type-icon">{t.icon}</span>
              <span className="type-label">{t.label}</span>
              <span className="type-desc">{t.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Difficulty */}
      <section className="config-section">
        <h3 className="section-label">Difficulty Level</h3>
        <div className="difficulty-grid">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              className={`diff-card ${difficulty === d.value ? "selected" : ""}`}
              style={{ "--diff-color": d.color }}
              onClick={() => setDifficulty(d.value)}
              disabled={isGenerating}
            >
              <span className="diff-dot" />
              <span className="diff-label">{d.label}</span>
              <span className="diff-desc">{d.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Number of Questions */}
      <section className="config-section">
        <h3 className="section-label">
          Number of Questions
          <span className="section-value">{numQuestions}</span>
        </h3>
        <div className="slider-wrap">
          <span className="slider-min">3</span>
          <input
            type="range"
            min="3"
            max="15"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            disabled={isGenerating}
            className="slider"
          />
          <span className="slider-max">15</span>
        </div>
        <div className="slider-ticks">
          {[3,5,7,10,15].map(n => (
            <button key={n} className={`tick-btn ${numQuestions === n ? "active" : ""}`}
              onClick={() => setNumQuestions(n)} disabled={isGenerating}>{n}</button>
          ))}
        </div>
      </section>

      {error && (
        <div className="error-banner animate-fadeIn">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <button
        className={`generate-btn ${isGenerating ? "loading" : ""}`}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="btn-spinner" />
            <span className="btn-load-msg">{loadMsg}</span>
          </>
        ) : (
          <>
            <span>✦</span>
            Generate {numQuestions} Questions
          </>
        )}
      </button>
    </div>
  );
}
