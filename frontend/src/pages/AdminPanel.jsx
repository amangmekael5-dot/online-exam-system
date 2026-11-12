import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  GraduationCap,
  BookOpen,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Users,
  Key,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    value: "student",
    label: "Student",
    description: "Can browse and take exams",
    icon: <GraduationCap size={22} color="#60a5fa" />,
    color: "#3b82f6",
  },
  {
    value: "teacher",
    label: "Instructor",
    description: "Can create exams and view reports",
    icon: <BookOpen size={22} color="#34d399" />,
    color: "#10b981",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full access – can manage all users",
    icon: <Shield size={22} color="#c084fc" />,
    color: "#8b5cf6",
  },
];

const ROLE_BADGE = {
  student: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  teacher: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  admin:   { bg: "rgba(139,92,246,0.15)",  color: "#c084fc", border: "rgba(139,92,246,0.3)" },
  user:    { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", border: "rgba(156,163,175,0.3)" },
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Create user form ───────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  // ─── Feedback ───────────────────────────────────────────────────────
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ─── User list ──────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);

  // ─── Active action per row: "edit" | "reset" | null ─────────────────
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // "edit" | "reset"

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("student");
  const [editLoading, setEditLoading] = useState(false);

  // Reset field
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const API = "http://localhost:5000/api/auth";

  const clearFeedback = () => { setSuccess(""); setError(""); };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchUsers();
  }, [user]);

  if (!user || user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  // ─── Create handler ──────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create user.");
      } else {
        setSuccess(`✓ ${data.message}! Login: ${email} / ${password}`);
        setName(""); setEmail(""); setPassword(""); setRole("student");
        fetchUsers();
      }
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Open edit mode ──────────────────────────────────────────────────
  const openEdit = (u) => {
    setActiveUserId(u._id);
    setActiveAction("edit");
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    clearFeedback();
  };

  // ─── Edit handler ────────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    clearFeedback();
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/update-user/${activeUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: editName, email: editEmail, role: editRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update user.");
      } else {
        setSuccess("✓ User updated successfully!");
        setActiveUserId(null); setActiveAction(null);
        fetchUsers();
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete handler ──────────────────────────────────────────────────
  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    clearFeedback();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/delete-user/${u._id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete user.");
      } else {
        setSuccess(`✓ User "${u.name}" deleted.`);
        if (activeUserId === u._id) { setActiveUserId(null); setActiveAction(null); }
        fetchUsers();
      }
    } catch {
      setError("Could not connect to the server.");
    }
  };

  // ─── Reset password handler ──────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    clearFeedback();
    setResetLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ userId: activeUserId, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
      } else {
        setSuccess("✓ Password reset successfully!");
        setActiveUserId(null); setActiveAction(null); setNewPassword("");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeAction = () => { setActiveUserId(null); setActiveAction(null); setNewPassword(""); };
  const selectedRoleInfo = ROLE_OPTIONS.find((r) => r.value === role);

  return (
    <div className="container fade-in" style={{ padding: "40px 24px", maxWidth: "780px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "36px" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", height: "38px" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: "0 0 4px 0" }}>Admin Panel</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Create and manage all user accounts</p>
        </div>
      </div>

      {/* ── Global Feedback ── */}
      {success && (
        <div className="alert" style={{ marginBottom: "24px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <CheckCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span style={{ lineHeight: "1.5" }}>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Create User Card ── */}
      <div className="glass-card" style={{ padding: "36px" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
          <UserPlus size={22} color="#6366f1" /> Create New Account
        </h2>

        <form onSubmit={handleCreate}>
          {/* Role cards */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", marginBottom: "12px", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Select Role
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {ROLE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                  style={{ padding: "16px 12px", borderRadius: "14px", border: role === opt.value ? `2px solid ${opt.color}` : "1px solid var(--border-glass)", background: role === opt.value ? `${opt.color}18` : "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: role === opt.value ? `0 0 20px ${opt.color}25` : "none" }}>
                  <div style={{ marginBottom: "8px" }}>{opt.icon}</div>
                  <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px", color: role === opt.value ? "var(--text-heading)" : "var(--text-muted)" }}>{opt.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.3" }}>{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="admin-name">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input id="admin-name" type="text" required className="input-field" placeholder={`Enter ${selectedRoleInfo?.label} full name`} value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: "42px" }} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="admin-email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input id="admin-email" type="email" required className="input-field" placeholder="e.g. user@school.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: "42px" }} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="admin-password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input id="admin-password" type="text" required minLength={6} className="input-field" placeholder="Set a strong password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: "42px" }} />
            </div>
            <small style={{ color: "var(--text-muted)", marginTop: "4px" }}>Shown in plain text so you can share it with the user.</small>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "14px", marginTop: "8px", fontSize: "1rem" }}>
            {loading ? "Creating Account..." : <><UserPlus size={18} /> Create {selectedRoleInfo?.label} Account</>}
          </button>
        </form>
      </div>

      {/* ── Manage Users Card ── */}
      <div className="glass-card" style={{ padding: "36px", marginTop: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={22} color="#10b981" /> Manage Users
            <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-muted)", marginLeft: "4px" }}>({users.length} total)</span>
          </h2>
          <button className="btn btn-secondary" onClick={fetchUsers} style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px 0" }}>No users found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {users.map((u) => {
              const badge = ROLE_BADGE[u.role] || ROLE_BADGE.user;
              const isEditing  = activeUserId === u._id && activeAction === "edit";
              const isResetting = activeUserId === u._id && activeAction === "reset";

              return (
                <div key={u._id} style={{ borderRadius: "14px", border: "1px solid var(--border-glass)", overflow: "hidden", transition: "border-color 0.2s", background: "rgba(255,255,255,0.02)" }}>
                  {/* Row header */}
                  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>{u.name}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{u.email}</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", padding: "2px 10px", borderRadius: "20px", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {u.role}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (shown when no action is open for this row) */}
                    {!isEditing && !isResetting && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-secondary" onClick={() => openEdit(u)} title="Edit User" style={{ padding: "7px 14px", fontSize: "0.85rem" }}>
                          <Edit size={15} /> Edit
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setActiveUserId(u._id); setActiveAction("reset"); clearFeedback(); }} title="Reset Password" style={{ padding: "7px 14px", fontSize: "0.85rem" }}>
                          <Key size={15} /> Reset PW
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleDelete(u)} title="Delete User" style={{ padding: "7px 14px", fontSize: "0.85rem", color: "#f87171", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    )}
                    {/* Cancel button when an action is open */}
                    {(isEditing || isResetting) && (
                      <button className="btn btn-secondary" onClick={closeAction} style={{ padding: "7px 14px", fontSize: "0.85rem" }}>
                        <X size={15} /> Cancel
                      </button>
                    )}
                  </div>

                  {/* ── Edit Form ── */}
                  {isEditing && (
                    <form onSubmit={handleEdit} style={{ padding: "20px", borderTop: "1px solid var(--border-glass)", background: "rgba(99,102,241,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: "600" }}>✏️ Edit User Details</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label>Full Name</label>
                          <div style={{ position: "relative" }}>
                            <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input type="text" required className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ paddingLeft: "36px", padding: "10px 12px 10px 36px" }} />
                          </div>
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label>Email Address</label>
                          <div style={{ position: "relative" }}>
                            <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input type="email" required className="input-field" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ paddingLeft: "36px", padding: "10px 12px 10px 36px" }} />
                          </div>
                        </div>
                      </div>
                      <div className="input-group" style={{ margin: 0, maxWidth: "240px" }}>
                        <label>Role</label>
                        <select className="input-field" value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ padding: "10px 36px 10px 12px" }}>
                          <option value="student">Student</option>
                          <option value="teacher">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button type="submit" disabled={editLoading} className="btn btn-primary" style={{ padding: "9px 20px", fontSize: "0.9rem" }}>
                          <Save size={15} /> {editLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button type="button" onClick={closeAction} className="btn btn-secondary" style={{ padding: "9px 20px", fontSize: "0.9rem" }}>
                          <X size={15} /> Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ── Reset Password Form ── */}
                  {isResetting && (
                    <form onSubmit={handleResetPassword} style={{ padding: "20px", borderTop: "1px solid var(--border-glass)", background: "rgba(245,158,11,0.04)", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: "600" }}>🔑 Reset Password for <strong style={{ color: "var(--text-main)" }}>{u.name}</strong></h4>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                          <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                          <input type="text" className="input-field" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px" }} />
                        </div>
                        <button type="submit" disabled={resetLoading} className="btn btn-primary" style={{ padding: "9px 20px", fontSize: "0.9rem" }}>
                          <Key size={15} /> {resetLoading ? "Saving..." : "Set Password"}
                        </button>
                        <button type="button" onClick={closeAction} className="btn btn-secondary" style={{ padding: "9px 20px", fontSize: "0.9rem" }}>
                          <X size={15} /> Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
