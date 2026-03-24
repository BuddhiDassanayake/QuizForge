import React, { useState, useMemo } from "react";
import "./ResultsView.css";

function scoreQuiz(questions, userAnswers, quizType) {
  if (quizType === "short-answer") return null;
  let correct = 0;
  questions.forEach((q, i) => {
    const userAns = userAnswers[i] || "";
    const correctAns = q.correctAnswer || "";
    if (userAns.trim().toLowerCase() === correctAns.trim().toLowerCase()) correct++;
  });
  return correct;
}

function getGrade(pct) {
  if (pct >= 90) return { label: "Excellent!", color: "var(--accent2)", emoji: "🏆" };
  if (pct >= 75) return { label: "Great Job!", color: "var(--success)", emoji: "🎯" };
  if (pct >= 60) return { label: "Good Effort", color: "var(--warning)", emoji: "👍" };
  if (pct >= 40) return { label: "Keep Practicing", color: "var(--accent)", emoji: "📚" };
  return { label: "Keep Trying!", color: "var(--error)", emoji: "💪" };
}

export default function ResultsView({ questions, userAnswers, quizConfig, onRestart, onRetake }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const isShortAnswer = quizConfig?.quizType === "short-answer";

  const score = useMemo(() => scoreQuiz(questions, userAnswers, quizConfig?.quizType), [questions, userAnswers, quizConfig]);
  const pct = score !== null ? Math.round((score / questions.length) * 100) : null;
  const grade = pct !== null ? getGrade(pct) : null;

  const getAnswerStatus = (q, idx) => {
    if (isShortAnswer) return "short";
    const userAns = userAnswers[idx] || "";
    if (!userAns) return "unanswered";
    return userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? "correct" : "incorrect";
  };

  const circumference = 2 * Math.PI * 52;
  const strokeOffset = pct !== null ? circumference * (1 - pct / 100) : circumference;

  return (
    <div className="results-view animate-fadeUp">
      {/* Score Card */}
      <div className="score-card">
        <div className="score-left">
          {pct !== null ? (
            <>
              <div className="score-ring-wrap">
                <svg className="score-ring" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={grade.color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
                  />
                </svg>
                <div className="score-ring-center">
                  <span className="score-pct">{pct}%</span>
                </div>
              </div>
              <div className="score-details">
                <div className="grade-emoji">{grade.emoji}</div>
                <h2 className="grade-label" style={{ color: grade.color }}>{grade.label}</h2>
                <p className="score-fraction">
                  <strong>{score}</strong> out of <strong>{questions.length}</strong> correct
                </p>
                <div className="score-stats">
                  <div className="stat">
                    <span className="stat-num correct-num">{score}</span>
                    <span className="stat-label">Correct</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat">
                    <span className="stat-num incorrect-num">{questions.length - score - (questions.filter((_, i) => !userAnswers[i]).length)}</span>
                    <span className="stat-label">Wrong</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat">
                    <span className="stat-num skipped-num">{questions.filter((_, i) => !userAnswers[i]).length}</span>
                    <span className="stat-label">Skipped</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="short-score-header">
              <div className="short-icon">✎</div>
              <div>
                <h2 className="grade-label" style={{ color: "var(--accent2)" }}>Short Answer Review</h2>
                <p className="score-fraction">Compare your answers with the model answers below</p>
              </div>
            </div>
          )}
        </div>

        <div className="score-actions">
          <button className="action-btn retake" onClick={onRetake}>
            <span>↺</span> Retake Quiz
          </button>
          <button className="action-btn restart" onClick={onRestart}>
            <span>⊕</span> New Quiz
          </button>
        </div>
      </div>

      {/* Quiz info */}
      <div className="result-meta">
        <span className="meta-tag">📄 {quizConfig?.filename}</span>
        <span className="meta-tag">🎯 {quizConfig?.difficulty}</span>
        <span className="meta-tag">📝 {quizConfig?.quizType?.replace("-", " ")}</span>
        <span className="meta-tag">❓ {questions.length} questions</span>
      </div>

      {/* Questions Review */}
      <div className="review-section">
        <h3 className="review-heading">Review Answers</h3>
        <div className="review-list">
          {questions.map((q, idx) => {
            const status = getAnswerStatus(q, idx);
            const isExpanded = expandedIdx === idx;
            const userAns = userAnswers[idx];

            return (
              <div key={idx} className={`review-item ${status}`}>
                <div
                  className="review-header"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                >
                  <div className="review-status-icon">
                    {status === "correct" && <span className="icon-correct">✓</span>}
                    {status === "incorrect" && <span className="icon-incorrect">✗</span>}
                    {status === "unanswered" && <span className="icon-skipped">—</span>}
                    {status === "short" && <span className="icon-short">✎</span>}
                  </div>
                  <div className="review-question-preview">
                    <span className="review-q-num">Q{idx + 1}</span>
                    <span className="review-q-text">{q.question}</span>
                  </div>
                  <div className="review-expand">
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="review-body animate-fadeIn">
                    {/* Your Answer */}
                    <div className="answer-block your-answer">
                      <span className="answer-block-label">Your Answer</span>
                      <span className={`answer-block-text ${status}`}>
                        {userAns ? userAns.replace(/^[A-D]\)\s*/, "") : <em>Not answered</em>}
                      </span>
                    </div>

                    {/* Correct Answer (non-short) */}
                    {!isShortAnswer && (
                      <div className="answer-block correct-answer">
                        <span className="answer-block-label">Correct Answer</span>
                        <span className="answer-block-text correct">
                          {q.correctAnswer?.replace(/^[A-D]\)\s*/, "")}
                        </span>
                      </div>
                    )}

                    {/* Model answer for short answer */}
                    {isShortAnswer && (
                      <div className="answer-block correct-answer">
                        <span className="answer-block-label">Model Answer</span>
                        <span className="answer-block-text correct">{q.correctAnswer}</span>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="explanation-block">
                        <span className="explanation-icon">💡</span>
                        <p className="explanation-text">{q.explanation}</p>
                      </div>
                    )}

                    {/* Options list (multiple choice) */}
                    {!isShortAnswer && q.options && q.options.length > 0 && (
                      <div className="all-options">
                        <span className="all-options-label">All Options</span>
                        <div className="all-options-list">
                          {q.options.map((opt, oi) => {
                            const isCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                            const isChosen = opt.trim().toLowerCase() === (userAns || "").trim().toLowerCase();
                            return (
                              <div key={oi} className={`opt-review ${isCorrect ? "opt-correct" : ""} ${isChosen && !isCorrect ? "opt-wrong-choice" : ""}`}>
                                <span>{opt.replace(/^[A-D]\)\s*/, "")}</span>
                                {isCorrect && <span className="opt-tag correct-tag">✓ Correct</span>}
                                {isChosen && !isCorrect && <span className="opt-tag your-tag">Your answer</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
