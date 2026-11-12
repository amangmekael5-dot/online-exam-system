import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TakeExam from "./pages/TakeExam";
import CreateExam from "./pages/CreateExam";
import EditExam from "./pages/EditExam";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import { LogOut, GraduationCap, Sun, Moon } from "lucide-react";
import "./App.css";

// Navigation Layout Wrapper
const NavigationLayout = ({ children }) => {
  const { user, logout } = useAuth();
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <>
      {user && (
        <nav className="navbar">
          <div className="container navbar-content">
            <Link to="/dashboard" className="logo">
              <GraduationCap size={28} />
              <span>ExamCore</span>
            </Link>
            
            <div className="nav-links">
              <span className={`user-badge badge-${user.role}`}>
                {user.role}
              </span>
              <span style={styles.username}>{user.username}</span>
              
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: "6px", display: "flex" }} title="Toggle Theme">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button onClick={logout} className="btn btn-secondary" style={styles.logoutBtn}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      <main style={{ flex: 1 }}>{children}</main>
    </>
  );
};

// Route protection for signed in users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="glass-card" style={styles.loadingCard}>
          <h3>Verifying credentials...</h3>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <NavigationLayout>{children}</NavigationLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Route protection for guest/anonymous users
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="glass-card" style={styles.loadingCard}>
          <h3>Verifying credentials...</h3>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Route protection for teachers only
const TeacherRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="glass-card" style={styles.loadingCard}>
          <h3>Verifying permissions...</h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAuthorized = user && (user.role === "teacher" || user.role === "admin");
  return isAuthorized ? (
    <NavigationLayout>{children}</NavigationLayout>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// Route protection for admin only
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="glass-card" style={styles.loadingCard}>
          <h3>Verifying admin permissions...</h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return user?.role === "admin" ? (
    <NavigationLayout>{children}</NavigationLayout>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest Public Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <TakeExam />
              </ProtectedRoute>
            }
          />

          {/* Teacher Dedicated Routes */}
          <Route
            path="/create-exam"
            element={
              <TeacherRoute>
                <CreateExam />
              </TeacherRoute>
            }
          />
          <Route
            path="/edit-exam/:id"
            element={
              <TeacherRoute>
                <EditExam />
              </TeacherRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <TeacherRoute>
                <Reports />
              </TeacherRoute>
            }
          />

          {/* Admin Dedicated Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

          {/* Root Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const styles = {
  username: {
    color: "var(--text-main)",
    fontSize: "0.95rem",
    fontWeight: "600",
    marginRight: "8px",
  },
  logoutBtn: {
    padding: "6px 12px",
    fontSize: "0.85rem",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "24px",
  },
  loadingCard: {
    padding: "32px",
    width: "100%",
    maxWidth: "300px",
    textAlign: "center",
  },
};

export default App;
