import React, { useState, useEffect, useRef } from "react";
import "./QuizView.css";

export default function QuizView({ questions, quizConfig, onSubmit, onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef(null);

  const q = questions[current];
  const isShortAnswer = quizConfig.quizType === "short-answer";
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / questions.length) * 100;

  useEffect(() => {
    setTextInput(answers[current] || "");
    if (isShortAnswer && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [current, answers, isShortAnswer]);

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [current]: option }));
  };

  const handleTextSave = () => {
    if (textInput.trim()) {
      setAnswers((prev) => ({ ...prev, [current]: textInput.trim() }));
    }
  };

  const handleNext = () => {
    if (isShortAnswer && textInput.trim()) {
      setAnswers((prev) => ({ ...prev, [current]: textInput.trim() }));
    }
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = () => {
    if (isShortAnswer && textInput.trim()) {
      setAnswers((prev) => ({ ...prev, [current]: textInput.trim() }));
    }
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = () => {
    if (isShortAnswer && textInput.trim()) {
      const final = { ...answers, [current]: textInput.trim() };
      setAnswers(final);
      onSubmit(final);
    } else {
      onSubmit(answers);
    }
  };

  const unanswered = questions.length - Object.keys(answers).length - (isShortAnswer && textInput.trim() && !answers[current] ? 1 : 0);

  const diffBadge = {
    easy: { label: "Easy", color: "var(--success)" },
    medium: { label: "Medium", color: "var(--warning)" },
    hard: { label: "Hard", color: "var(--error)" },
  }[quizConfig.difficulty];

  return (
    <div className="quiz-view animate-fadeUp">
      {/* Top bar */}
      <div className="quiz-topbar">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reconfigure
        </button>

        <div className="quiz-meta">
          <span className="meta-pill" style={{ color: diffBadge.color, borderColor: diffBadge.color + "44", background: diffBadge.color + "11" }}>
            {diffBadge.label}
          </span>
          <span className="meta-pill">
            {quizConfig.quizType.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-wrap">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-progress-text">
          {totalAnswered}/{questions.length} answered
        </span>
      </div>

      {/* Question navigation dots */}
      <div className="question-dots">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`q-dot ${i === current ? "active" : ""} ${answers[i] ? "answered" : ""}`}
            onClick={() => {
              if (isShortAnswer && textInput.trim()) setAnswers((prev) => ({ ...prev, [current]: textInput.trim() }));
              setCurrent(i);
            }}
            title={`Question ${i + 1}`}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="question-card" key={current}>
        <div className="question-num">
          <span>Q{current + 1}</span>
          <span className="q-total">/ {questions.length}</span>
        </div>
        <h2 className="question-text">{q.question}</h2>

        {/* Options */}
        {!isShortAnswer && q.options && q.options.length > 0 && (
          <div className="options-list">
            {q.options.map((option, idx) => {
              const labels = ["A", "B", "C", "D", "E"];
              const isSelected = answers[current] === option;
              return (
                <button
                  key={idx}
                  className={`option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  <span className="option-letter">{labels[idx] || idx + 1}</span>
                  <span className="option-text">{option.replace(/^[A-D]\)\s*/, "")}</span>
                  {isSelected && (
                    <span className="option-check">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Short answer textarea */}
        {isShortAnswer && (
          <div className="short-answer-wrap">
            <textarea
              ref={inputRef}
              className="short-answer-input"
              placeholder="Type your answer here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={4}
            />
            {textInput.trim() && (
              <div className="short-saved">
                <span className={`save-status ${answers[current] === textInput.trim() ? "saved" : "unsaved"}`}>
                  {answers[current] === textInput.trim() ? "✓ Saved" : "● Unsaved"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        <button className="nav-btn prev" onClick={handlePrev} disabled={current === 0}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>

        {current < questions.length - 1 ? (
          <button className="nav-btn next" onClick={handleNext}>
            Next
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            className="submit-btn"
            onClick={() => setShowConfirm(true)}
          >
            Submit Quiz
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay animate-fadeIn" onClick={() => setShowConfirm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Submit Quiz?</h3>
            {unanswered > 0 ? (
              <p className="modal-body warning">
                You have <strong>{unanswered}</strong> unanswered question{unanswered > 1 ? "s" : ""}. You can still submit.
              </p>
            ) : (
              <p className="modal-body success">All questions answered! Ready to see your results?</p>
            )}
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowConfirm(false)}>Keep Going</button>
              <button className="modal-btn confirm" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
