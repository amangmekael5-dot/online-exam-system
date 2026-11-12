import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  BarChart2, 
  Users, 
  Percent, 
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  FileText,
  Download
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");

  useEffect(() => {
    const allExams = JSON.parse(localStorage.getItem("exams") || "[]");
    const loadedSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]");

    // Teachers only see their own exams; admins see all
    const userId = user?.id || user?._id;
    const loadedExams = user?.role === "admin"
      ? allExams
      : allExams.filter((e) => e.createdById === userId);
    
    setExams(loadedExams);
    setSubmissions(loadedSubmissions);
    
    if (loadedExams.length > 0) {
      setSelectedExamId(loadedExams[0].id);
    }
  }, [user]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const examSubmissions = selectedExam 
    ? submissions.filter((sub) => sub.examTitle === selectedExam.title)
    : [];

  // Metrics
  const totalSubmissions = examSubmissions.length;
  const avgPercentage = totalSubmissions > 0
    ? Math.round(examSubmissions.reduce((acc, sub) => acc + sub.percentage, 0) / totalSubmissions)
    : 0;
  
  const passedCount = examSubmissions.filter((sub) => sub.percentage >= 60).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const cheatCount = examSubmissions.filter((sub) => sub.cheatFlag).length;

  const exportToCSV = () => {
    if (examSubmissions.length === 0) return;

    const headers = ["Student Name", "Date Taken", "Score", "Total Questions", "Percentage", "Status", "Integrity"];
    
    const csvRows = examSubmissions.map(sub => {
      const status = sub.percentage >= 60 ? "Passed" : "Failed";
      const integrity = sub.cheatFlag ? "Flagged" : "Clean";
      return [
        `"${sub.studentName}"`,
        `"${sub.date}"`,
        sub.score,
        sub.totalQuestions,
        `${sub.percentage}%`,
        `"${status}"`,
        `"${integrity}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedExam?.title || 'exam'}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container fade-in" style={{ padding: "40px 24px" }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Detailed Reports</h1>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>No exams found. Create an exam first to see reports.</p>
        </div>
      ) : (
        <>
          {/* Exam Selector */}
          <div className="glass-card" style={{ padding: "24px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "20px" }}>
            <FileText size={24} color="#6366f1" />
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "600" }}>
                Select Exam to View Report
              </label>
              <select 
                className="input-field" 
                value={selectedExamId} 
                onChange={(e) => setSelectedExamId(e.target.value)}
                style={{ width: "100%", margin: 0 }}
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedExam && (
            <>
              {/* Metrics Grid */}
              <div style={styles.statsGrid}>
                <div className="glass-card" style={styles.statCard}>
                  <div style={styles.statIconContainer("#3b82f6")}>
                    <Users size={24} color="#60a5fa" />
                  </div>
                  <div>
                    <span style={styles.statLabel}>Total Submissions</span>
                    <h3 style={styles.statValue}>{totalSubmissions}</h3>
                  </div>
                </div>

                <div className="glass-card" style={styles.statCard}>
                  <div style={styles.statIconContainer("#f59e0b")}>
                    <Percent size={24} color="#fbbf24" />
                  </div>
                  <div>
                    <span style={styles.statLabel}>Average Score</span>
                    <h3 style={styles.statValue}>{avgPercentage}%</h3>
                  </div>
                </div>

                <div className="glass-card" style={styles.statCard}>
                  <div style={styles.statIconContainer("#10b981")}>
                    <BarChart2 size={24} color="#34d399" />
                  </div>
                  <div>
                    <span style={styles.statLabel}>Pass Rate</span>
                    <h3 style={styles.statValue}>{passRate}%</h3>
                  </div>
                </div>

                <div className="glass-card" style={styles.statCard}>
                  <div style={styles.statIconContainer(cheatCount > 0 ? "#ef4444" : "#6366f1")}>
                    <AlertTriangle size={24} color={cheatCount > 0 ? "#f87171" : "#a5b4fc"} />
                  </div>
                  <div>
                    <span style={styles.statLabel}>Cheat Flags</span>
                    <h3 style={{ ...styles.statValue, color: cheatCount > 0 ? "#f87171" : "inherit" }}>
                      {cheatCount}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ padding: "24px", borderBottom: "1px solid var(--border-glass)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Student Submissions</h2>
                  <button 
                    className="btn btn-secondary" 
                    onClick={exportToCSV}
                    disabled={examSubmissions.length === 0}
                    style={{ background: "rgba(99, 102, 241, 0.1)", color: "#818cf8", borderColor: "rgba(99, 102, 241, 0.2)" }}
                  >
                    <Download size={16} />
                    Export to CSV
                  </button>
                </div>
                
                {examSubmissions.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)" }}>No students have taken this exam yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Student Name</th>
                          <th style={styles.th}>Date Taken</th>
                          <th style={styles.th}>Score</th>
                          <th style={styles.th}>Percentage</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Integrity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examSubmissions.map((sub, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: "600" }}>{sub.studentName}</td>
                            <td style={styles.td}>{sub.date}</td>
                            <td style={styles.td}>{sub.score} / {sub.totalQuestions}</td>
                            <td style={{ ...styles.td, fontWeight: "600" }}>{sub.percentage}%</td>
                            <td style={styles.td}>
                              {sub.percentage >= 60 ? (
                                <span style={styles.badgePass}>
                                  <CheckCircle size={14} /> Passed
                                </span>
                              ) : (
                                <span style={styles.badgeFail}>
                                  <XCircle size={14} /> Failed
                                </span>
                              )}
                            </td>
                            <td style={styles.td}>
                              {sub.cheatFlag ? (
                                <span style={styles.badgeCheat}>
                                  <ShieldAlert size={14} /> Flagged
                                </span>
                              ) : (
                                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Clean</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: "32px",
  },
  backBtn: {
    padding: "8px 16px",
    height: "38px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
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
    fontSize: "0.8rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statValue: {
    fontSize: "1.8rem",
    marginTop: "4px",
    fontWeight: "700",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px 24px",
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid var(--border-glass)",
    background: "rgba(255, 255, 255, 0.02)",
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  td: {
    padding: "16px 24px",
    fontSize: "0.95rem",
  },
  badgePass: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
    background: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.3)",
  },
  badgeFail: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  badgeCheat: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
    background: "rgba(245, 158, 11, 0.15)", // Amber color for cheating
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
};

export default Reports;
