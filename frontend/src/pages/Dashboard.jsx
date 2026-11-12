import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Award,
  Clock,
  PlusCircle,
  FileText,
  Users,
  Percent,
  CheckCircle,
  Play,
  Shield,
  Edit,
  Trash2
} from "lucide-react";

// Helper to initialize local storage mock data
const initializeLocalStorage = () => {
  const existingExams = localStorage.getItem("exams");
  if (!existingExams) {
    const defaultExams = [
      {
        id: "exam-1",
        title: "JavaScript Fundamentals",
        description: "Test your knowledge of scopes, closures, promises, and ES6+ features.",
        duration: 15,
        questionsCount: 3,
        questions: [
          {
            questionText: "What is the output of `console.log(typeof NaN)`?",
            options: ["'number'", "'NaN'", "'undefined'", "'object'"],
            correctOption: 0
          },
          {
            questionText: "Which keyword is used to declare block-scoped variables in JavaScript?",
            options: ["var", "let", "const", "Both let and const"],
            correctOption: 3
          },
          {
            questionText: "What is the purpose of Promise.all()?",
            options: [
              "Wait for all promises to resolve or any to reject",
              "Resolve the first promise that completes",
              "Execute promises in sequence",
              "None of the above"
            ],
            correctOption: 0
          }
        ]
      },
      {
        id: "exam-2",
        title: "Database Systems & MongoDB Basics",
        description: "Evaluate your understanding of schema design, document models, and basic MongoDB queries.",
        duration: 10,
        questionsCount: 2,
        questions: [
          {
            questionText: "Which MongoDB method is used to retrieve documents from a collection?",
            options: ["find()", "get()", "select()", "retrieve()"],
            correctOption: 0
          },
          {
            questionText: "Is MongoDB a relational or non-relational database?",
            options: ["Relational (SQL)", "Non-relational (NoSQL)", "Neither", "Both"],
            correctOption: 1
          }
        ]
      }
    ];
    localStorage.setItem("exams", JSON.stringify(defaultExams));
  }

  const existingSubmissions = localStorage.getItem("submissions");
  if (!existingSubmissions) {
    const defaultSubmissions = [
      {
        id: "sub-1",
        studentName: "john_doe",
        examTitle: "JavaScript Fundamentals",
        score: 2,
        totalQuestions: 3,
        percentage: 67,
        date: new Date().toLocaleDateString()
      }
    ];
    localStorage.setItem("submissions", JSON.stringify(defaultSubmissions));
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [viewMode, setViewMode] = useState(null);

  useEffect(() => {
    initializeLocalStorage();
    setExams(JSON.parse(localStorage.getItem("exams") || "[]"));
    setSubmissions(JSON.parse(localStorage.getItem("submissions") || "[]"));
  }, []);

  useEffect(() => {
    if (user && !viewMode) {
      setViewMode(user.role === "admin" || user.role === "teacher" ? "teacher" : "student");
    }
  }, [user, viewMode]);

  if (!user || !viewMode) return null;

  const isTeacher = viewMode === "teacher" || viewMode === "admin";

  // Teachers see only their own exams; admins see everything
  const userId = user?.id || user?._id;
  const visibleExams = user.role === "admin"
    ? exams
    : isTeacher
      ? exams.filter((e) => e.createdById === userId)
      : exams; // students see all exams

  const handleDeleteExam = (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      const updatedExams = exams.filter((e) => e.id !== examId);
      setExams(updatedExams);
      localStorage.setItem("exams", JSON.stringify(updatedExams));
    }
  };

  // Filter student submissions
  const studentSubmissions = submissions.filter(
    (sub) => sub.studentName === user.name
  );

  // Compute metrics
  const avgScore = isTeacher
    ? submissions.length
      ? Math.round(
          submissions.reduce((acc, sub) => acc + sub.percentage, 0) /
            submissions.length
        )
      : 0
    : studentSubmissions.length
    ? Math.round(
        studentSubmissions.reduce((acc, sub) => acc + sub.percentage, 0) /
          studentSubmissions.length
      )
    : 0;

  return (
    <div className="container fade-in" style={{ padding: "40px 24px" }}>
      {/* Welcome Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 8px 0", textTransform: "capitalize" }}>
            Welcome {isTeacher ? "Instructor" : "Student"} {user.name}!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            {isTeacher
              ? "Manage exams, create new tests, and monitor student performance."
              : "Review your performance, browse exams, and test your skills."}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          
          {/* Admin Panel button — only for admin role */}
          {user.role === "admin" && (
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/admin")}
              style={{ background: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.3)", color: "#c084fc" }}
            >
              <Shield size={18} />
              Admin Panel
            </button>
          )}
          
          {isTeacher && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/reports")}
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <FileText size={18} />
                View Detailed Reports
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/create-exam")}
              >
                <PlusCircle size={18} />
                Create New Exam
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIconContainer(isTeacher ? "#8b5cf6" : "#3b82f6")}>
            <FileText size={24} color={isTeacher ? "#c084fc" : "#60a5fa"} />
          </div>
          <div>
            <span style={styles.statLabel}>
              {isTeacher ? "Total Exams Created" : "Total Exams Taken"}
            </span>
            <h3 style={styles.statValue}>
              {isTeacher ? exams.length : studentSubmissions.length}
            </h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIconContainer(isTeacher ? "#10b981" : "#8b5cf6")}>
            {isTeacher ? (
              <Users size={24} color="#34d399" />
            ) : (
              <Award size={24} color="#c084fc" />
            )}
          </div>
          <div>
            <span style={styles.statLabel}>
              {isTeacher ? "Student Submissions" : "Completed Submissions"}
            </span>
            <h3 style={styles.statValue}>
              {isTeacher ? submissions.length : studentSubmissions.length}
            </h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIconContainer("#f59e0b")}>
            <Percent size={24} color="#fbbf24" />
          </div>
          <div>
            <span style={styles.statLabel}>Average Score</span>
            <h3 style={styles.statValue}>{avgScore}%</h3>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div style={styles.mainContent}>
        {/* Left Column: List of Exams */}
        <div style={styles.leftCol}>
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={24} color="#6366f1" />
            Available Exams
          </h2>

          <div style={styles.examsList}>
            {visibleExams.length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "var(--text-muted)" }}>
                  {isTeacher ? "You haven't created any exams yet." : "No exams available."}
                </p>
              </div>
            ) : (
              visibleExams.map((exam) => {
                const isCompleted = !isTeacher && studentSubmissions.some(
                  (sub) => sub.examTitle === exam.title
                );

                return (
                  <div key={exam.id} className="glass-card" style={styles.examItem}>
                    <div style={styles.examMain}>
                      <h3 style={styles.examTitle}>{exam.title}</h3>
                      <p style={styles.examDesc}>{exam.description}</p>
                      
                      <div style={styles.examMeta}>
                        <div style={styles.metaItem}>
                          <Clock size={15} color="var(--text-muted)" />
                          <span>{exam.duration} mins</span>
                        </div>
                        <div style={styles.metaItem}>
                          <FileText size={15} color="var(--text-muted)" />
                          <span>{exam.questionsCount || exam.questions?.length || 0} Questions</span>
                        </div>
                        {isCompleted && (
                          <div style={styles.metaItem} className="user-badge badge-student">
                            <CheckCircle size={13} />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={styles.examAction}>
                      {isTeacher ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => navigate(`/edit-exam/${exam.id}`)}
                            title="Edit Exam"
                            style={{ padding: "8px" }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeleteExam(exam.id)}
                            title="Delete Exam"
                            style={{ padding: "8px", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : isCompleted ? (
                        <button className="btn btn-secondary" disabled>
                          Taken
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/exam/${exam.id}`)}
                        >
                          <Play size={15} />
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Submissions / Performance History */}
        <div style={styles.rightCol}>
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Award size={24} color="#10b981" />
            {isTeacher ? "Recent Submissions" : "Your Performance"}
          </h2>

          <div style={styles.historyList}>
            {(isTeacher ? submissions : studentSubmissions).length === 0 ? (
              <div className="glass-card" style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "var(--text-muted)" }}>No submissions yet.</p>
              </div>
            ) : (
              (isTeacher ? submissions : studentSubmissions)
                .slice()
                .reverse()
                .map((sub, index) => (
                  <div key={index} className="glass-card" style={styles.historyItem}>
                    <div style={{ flex: 1 }}>
                      <h4 style={styles.historyTitle}>{sub.examTitle}</h4>
                      <p style={styles.historyMeta}>
                        {isTeacher ? `Student: ${sub.studentName} | ` : ""}Date: {sub.date}
                      </p>
                    </div>
                    <div style={styles.historyScore(sub.percentage >= 60)}>
                      {sub.score}/{sub.totalQuestions}
                      <span style={{ fontSize: "0.75rem", display: "block", color: "var(--text-muted)" }}>
                        ({sub.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  statIconContainer: (bgColor) => ({
    display: "flex",
    padding: "12px",
    borderRadius: "12px",
    background: `${bgColor}20`,
    border: `1px solid ${bgColor}40`,
  }),
  statLabel: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statValue: {
    fontSize: "2rem",
    marginTop: "4px",
  },
  mainContent: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: "2",
    minWidth: "300px",
  },
  rightCol: {
    flex: "1",
    minWidth: "300px",
  },
  examsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  examItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "24px",
    textAlign: "left",
  },
  examMain: {
    flex: 1,
  },
  examTitle: {
    fontSize: "1.25rem",
    marginBottom: "8px",
  },
  examDesc: {
    color: "var(--text-muted)",
    fontSize: "0.95rem",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  examMeta: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  examAction: {
    flexShrink: 0,
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  historyItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 20px",
    textAlign: "left",
  },
  historyTitle: {
    fontSize: "1rem",
    marginBottom: "4px",
  },
  historyMeta: {
    color: "var(--text-muted)",
    fontSize: "0.8rem",
  },
  historyScore: (isPassed) => ({
    textAlign: "right",
    fontWeight: "700",
    fontSize: "1.1rem",
    color: isPassed ? "var(--color-success)" : "var(--color-danger)",
  }),
};

export default Dashboard;
