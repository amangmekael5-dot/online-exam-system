import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Check, ShieldAlert, EyeOff } from "lucide-react";

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [cheatWarning, setCheatWarning] = useState(null);
  const [hasCheated, setHasCheated] = useState(false);
  const [attemptsExhausted, setAttemptsExhausted] = useState(false);
  
  const timerRef = useRef(null);

  // Load Exam
  useEffect(() => {
    const exams = JSON.parse(localStorage.getItem("exams") || "[]");
    const foundExam = exams.find((e) => e.id === id);
    if (!foundExam) {
      navigate("/dashboard");
      return;
    }

    // Check attempts limit
    const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
    const previousAttempts = submissions.filter(
      (sub) => sub.examTitle === foundExam.title && sub.studentName === user.name
    ).length;

    if (foundExam.maxAttempts && previousAttempts >= foundExam.maxAttempts) {
      setAttemptsExhausted(true);
      return;
    }

    setExam(foundExam);
    setTimeLeft(foundExam.duration * 60);
  }, [id, navigate, user?.username]);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted || !exam) {
      if (timeLeft === 0 && exam && !isSubmitted) {
        handleSubmit(); // Auto-submit when timer expires
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, isSubmitted, exam]);

  // Anti-Cheat Monitor
  useEffect(() => {
    if (!exam || !exam.antiCheat || isSubmitted || attemptsExhausted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCheatWarning("Warning: Leaving the exam window is prohibited. Your exam activity has been recorded.");
        setHasCheated(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen") {
        setCheatWarning("Warning: Taking screenshots is prohibited during this exam.");
        setHasCheated(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [exam, isSubmitted, attemptsExhausted]);

  if (attemptsExhausted) {
    return (
      <div style={{ textAlign: "center", padding: "100px", marginTop: "40px" }}>
        <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: "24px" }} />
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>Maximum Attempts Reached</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>You have already reached the maximum allowed attempts for this exam.</p>
        <button className="btn btn-secondary" style={{ marginTop: "32px", padding: "12px 32px" }} onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!exam || !user) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h3>Loading Exam...</h3>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIdx];
  const totalQuestions = exam.questions.length;

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optIdx,
    });
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate score
    let score = 0;
    exam.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        score++;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const finalResult = {
      score,
      totalQuestions,
      percentage,
      passed: percentage >= 60,
    };

    setResult(finalResult);
    setIsSubmitted(true);

    // Save submission to local storage
    const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
    const newSubmission = {
      id: `sub-${Date.now()}`,
      studentName: user.name,
      examTitle: exam.title,
      score,
      totalQuestions,
      percentage,
      date: new Date().toLocaleDateString(),
      cheatFlag: hasCheated,
    };
    
    submissions.push(newSubmission);
    localStorage.setItem("submissions", JSON.stringify(submissions));
  };

  // Timer Formatter
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container fade-in" style={{ padding: "40px 24px" }}>
      {cheatWarning && !isSubmitted && (
        <div className="alert alert-danger" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldAlert size={20} />
            <span>{cheatWarning}</span>
          </div>
          <button onClick={() => setCheatWarning(null)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
            Dismiss
          </button>
        </div>
      )}

      {!isSubmitted ? (
        <div style={styles.grid}>
          {/* Main Quiz Area */}
          <div style={styles.mainCol}>
            <div className="glass-card" style={{ padding: "40px", position: "relative" }}>
              {/* Progress and Timer */}
              <div style={styles.quizHeader}>
                <span style={styles.qIndex}>
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <div style={styles.timer(timeLeft < 60)}>
                  <Clock size={16} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressBarBg}>
                <div style={styles.progressBarFill(((currentIdx + 1) / totalQuestions) * 100)} />
              </div>

              {/* Question Text */}
              <h3 style={styles.questionText}>{currentQuestion.questionText}</h3>

              {/* Options */}
              <div style={styles.optionsList}>
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      className="input-field"
                      style={styles.optionBtn(isSelected)}
                      onClick={() => handleSelectOption(oIdx)}
                    >
                      <div style={styles.radioDot(isSelected)}>
                        {isSelected && <Check size={10} color="#fff" />}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div style={styles.navControls}>
                <button
                  className="btn btn-secondary"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {currentIdx === totalQuestions - 1 ? (
                  <button className="btn btn-success" onClick={handleSubmit}>
                    Submit Exam
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleNext}>
                    Next
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar: question grid navigation */}
          <div style={styles.sidebar}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Questions</h3>
              <div style={styles.qGrid}>
                {exam.questions.map((_, idx) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isCurrent = currentIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      style={styles.gridItem(isCurrent, isAnswered)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={styles.legendColor("rgba(99,102,241,0.2)", "rgba(99,102,241,0.5)")} />
                  <span>Answered</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={styles.legendColor("rgba(255,255,255,0.03)", "rgba(255,255,255,0.08)")} />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Final Score / Results Card */
        <div style={styles.resultsContainer}>
          <div className="glass-card" style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
              <div style={styles.resultIconBg(result.passed)}>
                {result.passed ? (
                  <CheckCircle size={48} color="#34d399" />
                ) : (
                  <AlertCircle size={48} color="#fca5a5" />
                )}
              </div>
              <h2 style={{ fontSize: "2.2rem", margin: "16px 0 8px 0" }}>
                {result.passed ? "Exam Passed!" : "Exam Completed"}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                You have completed **{exam.title}**
              </p>
            </div>

            {/* Score Stats / Results Content */}
            {exam?.showResults !== false ? (
              <>
                <div style={styles.scoreRow}>
                  <div style={styles.scoreBox}>
                    <span style={styles.scoreLabel}>Score</span>
                    <span style={styles.scoreVal}>
                      {result.score} / {result.totalQuestions}
                    </span>
                  </div>
                  <div style={styles.scoreBox}>
                    <span style={styles.scoreLabel}>Percentage</span>
                    <span style={styles.scoreVal}>{result.percentage}%</span>
                  </div>
                  <div style={styles.scoreBox}>
                    <span style={styles.scoreLabel}>Result</span>
                    <span style={styles.resultBadge(result.passed)}>
                      {result.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>

                <p style={styles.scoreFeedback}>
                  {result.passed
                    ? "Excellent job! You demonstrated strong capability and command over this subject."
                    : "You did not achieve the required 60% passing score. We recommend reviewing the material and trying again."}
                </p>
              </>
            ) : (
              <div style={{ padding: "32px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", marginBottom: "32px" }}>
                <EyeOff size={48} color="var(--text-muted)" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>Results Hidden</h3>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                  Your instructor has chosen not to display the results immediately. The final score will be released later.
                </p>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => navigate("/dashboard")}
              style={{ width: "180px", margin: "0 auto" }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap",
    textAlign: "left",
  },
  mainCol: {
    flex: "3",
    minWidth: "300px",
  },
  sidebar: {
    flex: "1",
    minWidth: "220px",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  qIndex: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  timer: (isCritical) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    background: isCritical ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.05)",
    border: `1px solid ${isCritical ? "rgba(239, 68, 68, 0.3)" : "var(--border-glass)"}`,
    color: isCritical ? "#fca5a5" : "#fff",
    fontFamily: "var(--font-heading)",
    fontWeight: "700",
  }),
  progressBarBg: {
    width: "100%",
    height: "6px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "32px",
  },
  progressBarFill: (percentage) => ({
    height: "100%",
    width: `${percentage}%`,
    background: "var(--primary-grad)",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  }),
  questionText: {
    fontSize: "1.4rem",
    marginBottom: "24px",
    lineHeight: "1.4",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "32px",
  },
  optionBtn: (isSelected) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    background: isSelected ? "rgba(99, 102, 241, 0.12)" : "rgba(255,255,255,0.03)",
    borderColor: isSelected ? "var(--accent-indigo)" : "var(--border-glass)",
    boxShadow: isSelected ? "0 0 15px rgba(99, 102, 241, 0.1)" : "none",
  }),
  radioDot: (isSelected) => ({
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: `2px solid ${isSelected ? "var(--accent-indigo)" : "var(--text-muted)"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isSelected ? "var(--accent-indigo)" : "transparent",
    flexShrink: 0,
  }),
  navControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid var(--border-glass)",
    paddingTop: "24px",
  },
  qGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
    gap: "10px",
    marginBottom: "24px",
  },
  gridItem: (isCurrent, isAnswered) => ({
    height: "40px",
    borderRadius: "8px",
    border: isCurrent
      ? "2px solid var(--accent-indigo)"
      : "1px solid var(--border-glass)",
    background: isCurrent
      ? "rgba(99, 102, 241, 0.25)"
      : isAnswered
      ? "rgba(99, 102, 241, 0.12)"
      : "rgba(255, 255, 255, 0.02)",
    color: isCurrent || isAnswered ? "#fff" : "var(--text-muted)",
    cursor: "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendColor: (bg, border) => ({
    width: "12px",
    height: "12px",
    borderRadius: "3px",
    background: bg,
    border: `1px solid ${border}`,
  }),
  resultsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 150px)",
  },
  resultsCard: {
    width: "100%",
    maxWidth: "600px",
    padding: "48px",
    textAlign: "center",
    borderRadius: "24px",
  },
  resultsHeader: {
    marginBottom: "32px",
  },
  resultIconBg: (isPassed) => ({
    display: "inline-flex",
    padding: "16px",
    borderRadius: "50%",
    background: isPassed ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
    border: `1px solid ${isPassed ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
  }),
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--border-glass)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "32px",
  },
  scoreBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  scoreLabel: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  scoreVal: {
    fontSize: "1.3rem",
    fontWeight: "700",
  },
  resultBadge: (passed) => ({
    alignSelf: "center",
    padding: "4px 12px",
    borderRadius: "6px",
    fontWeight: "800",
    fontSize: "0.95rem",
    background: passed ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
    color: passed ? "#34d399" : "#fca5a5",
    border: `1px solid ${passed ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
  }),
  scoreFeedback: {
    color: "var(--text-muted)",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
};

export default TakeExam;
