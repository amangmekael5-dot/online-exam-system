import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(username, email, password, role);
    if (result.success) {
      navigate("/login");
    } else {
      setError(result.error || "Registration failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.card} className="glass-card">
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <UserPlus size={28} color="#6366f1" />
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Get started on the ultimate exam platform</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                id="username"
                type="text"
                required
                className="input-field"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="role">I am registering as a</label>
            <div style={styles.inputWrapper}>
              <ShieldCheck size={18} style={styles.inputIcon} />
              <select
                id="role"
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.input}
              >
                <option value="student">Student (Take exams)</option>
                <option value="teacher">Teacher (Create & manage exams)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 70px)",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
  },
  header: {
    marginBottom: "32px",
  },
  iconContainer: {
    display: "inline-flex",
    padding: "16px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.15)",
    marginBottom: "16px",
    border: "1px solid rgba(99, 102, 241, 0.25)",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "8px",
  },
  subtitle: {
    color: "var(--text-muted)",
    fontSize: "0.95rem",
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
  },
  input: {
    width: "100%",
    paddingLeft: "42px",
  },
  submitBtn: {
    width: "100%",
    marginTop: "12px",
    height: "48px",
  },
  footer: {
    marginTop: "24px",
    fontSize: "0.9rem",
    color: "var(--text-muted)",
  },
  link: {
    color: "#6366f1",
    fontWeight: "600",
  },
};

export default Register;
