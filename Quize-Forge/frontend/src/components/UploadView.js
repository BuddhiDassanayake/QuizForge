import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./UploadView.css";

export default function UploadView({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });
      setProgress(100);
      setTimeout(() => onUploaded(res.data), 400);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload. Make sure the backend server is running.");
    } finally {
      setIsUploading(false);
    }
  }, [onUploaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleFileInput = (e) => processFile(e.target.files[0]);
  const handleClick = () => !isUploading && fileInputRef.current?.click();

  return (
    <div className="upload-view animate-fadeUp">
      <div className="upload-hero">
        <div className="hero-badge">AI-Powered</div>
        <h1 className="hero-title">
          Turn any PDF into a<br />
          <span className="gradient-text">smart quiz</span>
        </h1>
        <p className="hero-subtitle">
          Upload your study material, textbook, or document — and let Gemini AI craft personalized quiz questions for you.
        </p>
      </div>

      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${isUploading ? "uploading" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF"
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="visually-hidden"
        />

        {isUploading ? (
          <div className="upload-progress">
            <div className="progress-icon">
              <svg className="progress-ring" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="30" cy="30" r="26" fill="none"
                  stroke="var(--accent)" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                  transform="rotate(-90 30 30)"
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
              </svg>
              <span className="progress-pct">{progress}%</span>
            </div>
            <p className="upload-status-text">
              {progress < 100 ? "Uploading & parsing PDF..." : "Processing complete!"}
            </p>
          </div>
        ) : (
          <div className="drop-content">
            <div className="drop-icon-wrap">
              <div className="drop-icon-ring" />
              <div className="drop-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4L16 20M16 4L10 10M16 4L22 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 22v3a1 1 0 001 1h18a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="drop-main">Drop your PDF here</p>
            <p className="drop-sub">or <span className="drop-link">browse files</span></p>
            <div className="drop-hint">
              <span>PDF only</span>
              <span>·</span>
              <span>Max 20MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner animate-fadeIn">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="feature-grid">
        {[
          { icon: "🧠", title: "Gemini AI", desc: "State-of-the-art AI understands your content deeply" },
          { icon: "⚡", title: "Instant Quiz", desc: "Questions generated in seconds from any PDF" },
          { icon: "🎯", title: "3 Quiz Types", desc: "Multiple choice, true/false, or short answer" },
          { icon: "📊", title: "Scored Results", desc: "Detailed feedback and explanations for each answer" },
        ].map((f) => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
