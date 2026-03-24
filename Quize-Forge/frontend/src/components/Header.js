import React from "react";
import "./Header.css";

const steps = [
  { num: 1, label: "Upload PDF" },
  { num: 2, label: "Configure" },
  { num: 3, label: "Take Quiz" },
  { num: 4, label: "Results" },
];

export default function Header({ step }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Quiz<span className="logo-accent">Forge</span></span>
        </div>

        <nav className="steps-nav" aria-label="Progress">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`step-item ${step === s.num ? "active" : ""} ${step > s.num ? "done" : ""}`}>
                <div className="step-bubble">
                  {step > s.num ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{s.num}</span>
                  )}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-connector ${step > s.num ? "filled" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </header>
  );
}
