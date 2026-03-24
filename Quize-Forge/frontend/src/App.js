import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import UploadView from "./components/UploadView";
import ConfigView from "./components/ConfigView";
import QuizView from "./components/QuizView";
import ResultsView from "./components/ResultsView";

const VIEWS = {
  UPLOAD: "upload",
  CONFIG: "config",
  QUIZ: "quiz",
  RESULTS: "results",
};

export default function App() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [pdfData, setPdfData] = useState(null);
  const [quizConfig, setQuizConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  const handlePdfUploaded = (data) => {
    setPdfData(data);
    setView(VIEWS.CONFIG);
  };

  const handleQuizGenerated = (qs, config) => {
    setQuestions(qs);
    setQuizConfig(config);
    setUserAnswers({});
    setView(VIEWS.QUIZ);
  };

  const handleQuizSubmit = (answers) => {
    setUserAnswers(answers);
    setView(VIEWS.RESULTS);
  };

  const handleRestart = () => {
    setPdfData(null);
    setQuizConfig(null);
    setQuestions([]);
    setUserAnswers({});
    setView(VIEWS.UPLOAD);
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setView(VIEWS.QUIZ);
  };

  const getStepNumber = () => {
    const steps = { upload: 1, config: 2, quiz: 3, results: 4 };
    return steps[view] || 1;
  };

  return (
    <div className="app">
      <Header step={getStepNumber()} />

      <main className="main-content">
        {view === VIEWS.UPLOAD && (
          <UploadView onUploaded={handlePdfUploaded} />
        )}
        {view === VIEWS.CONFIG && (
          <ConfigView
            pdfData={pdfData}
            onGenerated={handleQuizGenerated}
            onBack={() => setView(VIEWS.UPLOAD)}
          />
        )}
        {view === VIEWS.QUIZ && (
          <QuizView
            questions={questions}
            quizConfig={quizConfig}
            onSubmit={handleQuizSubmit}
            onBack={() => setView(VIEWS.CONFIG)}
          />
        )}
        {view === VIEWS.RESULTS && (
          <ResultsView
            questions={questions}
            userAnswers={userAnswers}
            quizConfig={quizConfig}
            onRestart={handleRestart}
            onRetake={handleRetakeQuiz}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>Powered by</span>
        <span className="footer-highlight">Gemini AI</span>
        <span className="footer-sep">·</span>
        <span>QuizForge</span>
      </footer>
    </div>
  );
}
