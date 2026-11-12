import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash, Save, BookOpen, Clock, FileQuestion, ArrowLeft, Settings, Shield, Eye } from "lucide-react";

const CreateExam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctOption: 0,
    },
  ]);
  const [error, setError] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [antiCheat, setAntiCheat] = useState(true);
  const [showResults, setShowResults] = useState(true);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, qIdx) => qIdx !== idx);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].questionText = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIdx, val) => {
    const updated = [...questions];
    updated[qIdx].correctOption = parseInt(val, 10);
    setQuestions(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError("");

    // Simple validation
    if (!title.trim() || !description.trim()) {
      setError("Please fill in the exam title and description.");
      return;
    }

    if (duration <= 0) {
      setError("Exam duration must be greater than 0 minutes.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} does not have any question text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${j + 1} in Question ${i + 1} is empty.`);
          return;
        }
      }
    }

    // Save exam to local storage
    const exams = JSON.parse(localStorage.getItem("exams") || "[]");
    const newExam = {
      id: `exam-${Date.now()}`,
      title,
      description,
      duration: parseInt(duration, 10),
      questionsCount: questions.length,
      questions,
      maxAttempts: parseInt(maxAttempts, 10) || 1,
      antiCheat,
      showResults,
      createdById: user?.id || user?._id || null,
      createdByName: user?.name || user?.username || "Unknown",
    };

    exams.push(newExam);
    localStorage.setItem("exams", JSON.stringify(exams));

    navigate("/dashboard");
  };

  return (
    <div className="container fade-in" style={{ padding: "40px 24px", maxWidth: "800px" }}>
      {/* Back Button and Title */}
      <div style={styles.header}>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Create Exam</h1>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "24px" }}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* General Exam Details Card */}
        <div className="glass-card" style={styles.card}>
          <h2 style={styles.cardSectionTitle}>
            <BookOpen size={20} color="#6366f1" />
            Exam Specifications
          </h2>

          <div className="input-group">
            <label htmlFor="title">Exam Title</label>
            <input
              id="title"
              type="text"
              required
              className="input-field"
              placeholder="e.g. Advanced CSS and Layouts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Exam Description</label>
            <textarea
              id="description"
              required
              className="input-field"
              placeholder="Describe the topics covered in this exam..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: "100px", resize: "vertical" }}
            />
          </div>

          <div className="input-group" style={{ maxWidth: "200px" }}>
            <label htmlFor="duration">Duration (Minutes)</label>
            <div style={{ position: "relative" }}>
              <Clock size={16} style={styles.inputIcon} />
              <input
                id="duration"
                type="number"
                required
                min={1}
                className="input-field"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ paddingLeft: "42px", width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings Card */}
        <div className="glass-card" style={{ ...styles.card, marginTop: "24px" }}>
          <h2 style={styles.cardSectionTitle}>
            <Settings size={20} color="#6366f1" />
            Advanced Settings
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginTop: "20px" }}>
            <div className="input-group" style={{ flex: "1", minWidth: "200px", marginBottom: 0 }}>
              <label htmlFor="maxAttempts">Max Attempts per Student</label>
              <input
                id="maxAttempts"
                type="number"
                min={1}
                required
                className="input-field"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
              />
            </div>
            
            <div style={{ flex: "2", display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "1.05rem" }}>
                <input
                  type="checkbox"
                  checked={antiCheat}
                  onChange={(e) => setAntiCheat(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#6366f1", cursor: "pointer" }}
                />
                <Shield size={20} color={antiCheat ? "#34d399" : "var(--text-muted)"} />
                Enable Anti-Cheat Monitor (Blocks tab switching & screenshots)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "1.05rem" }}>
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#6366f1", cursor: "pointer" }}
                />
                <Eye size={20} color={showResults ? "#60a5fa" : "var(--text-muted)"} />
                Show Results Immediately After Submission
              </label>
            </div>
          </div>
        </div>

        {/* Questions Designer */}
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <FileQuestion size={24} color="#6366f1" />
            Questions Planner
          </h2>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="glass-card" style={styles.qCard}>
              <div style={styles.qHeader}>
                <h3 style={{ fontSize: "1.1rem" }}>Question {qIdx + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    style={styles.deleteBtn}
                  >
                    <Trash size={16} color="#ef4444" />
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="input-group">
                <label>Question Content</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter the question text here..."
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                />
              </div>

              {/* Options */}
              <div style={styles.optionsGrid}>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="input-group" style={{ marginBottom: 0 }}>
                    <label>Choice {optIdx + 1}</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder={`Choice ${optIdx + 1} text`}
                      value={opt}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Correct Option Dropdown */}
              <div className="input-group" style={{ marginTop: "20px", maxWidth: "250px" }}>
                <label>Correct Answer Choice</label>
                <select
                  className="input-field"
                  value={q.correctOption}
                  onChange={(e) => handleCorrectOptionChange(qIdx, e.target.value)}
                >
                  <option value={0}>Choice 1</option>
                  <option value={1}>Choice 2</option>
                  <option value={2}>Choice 3</option>
                  <option value={3}>Choice 4</option>
                </select>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddQuestion}
            style={{ width: "100%", height: "50px", marginTop: "16px", borderStyle: "dashed" }}
          >
            <Plus size={18} />
            Add Another Question
          </button>
        </div>

        {/* Save Controls */}
        <div style={styles.saveControls}>
          <button type="submit" className="btn btn-primary" style={{ padding: "12px 32px" }}>
            <Save size={18} />
            Save & Publish Exam
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
  },
  backBtn: {
    padding: "8px 16px",
    height: "38px",
  },
  card: {
    padding: "32px",
    textAlign: "left",
  },
  cardSectionTitle: {
    fontSize: "1.3rem",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
  },
  qCard: {
    padding: "32px",
    textAlign: "left",
    marginBottom: "24px",
  },
  qHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  deleteBtn: {
    padding: "8px",
    background: "rgba(239, 68, 68, 0.05)",
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  saveControls: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
  },
};

export default CreateExam;
