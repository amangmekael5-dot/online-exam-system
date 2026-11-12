import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Attempting login with:", email);
    
    const result = await login(email, password);
    console.log("Login result:", result);
    
    if (result.success) {
      console.log("Login successful, navigating to dashboard");
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
      console.error("Login error:", result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.card} className="glass-card">
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <LogIn size={28} color="#6366f1" />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ textAlign: "left" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Register here
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

export default Login;