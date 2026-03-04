// src/UserManagement.js
// Tab quản lý nhân viên cho Admin
// Paste vào pos-ui/src/UserManagement.js

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ROLE_LABEL = { admin: "Admin", cashier: "Thu ngân", waiter: "Nhân viên order" };
const ROLE_COLOR = { admin: "#e94560", cashier: "#faad14", waiter: "#52c41a" };

export default function UserManagement({ apiUrl }) {
  const { getToken } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ username: "", password: "", role: "waiter", full_name: "" });
  const [error,    setError]    = useState("");

  const headers = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  });

  const loadUsers = async () => {
    const res = await fetch(`${apiUrl}/users`, { headers: headers() });
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { loadUsers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ username: "", password: "", role: "waiter", full_name: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ username: u.username, password: "", role: u.role, full_name: u.full_name, active: u.active });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      let res;
      if (editing) {
        const body = { full_name: form.full_name, role: form.role, active: form.active };
        if (form.password) body.password = form.password;
        res = await fetch(`${apiUrl}/users/${editing.id}`, {
          method: "PUT", headers: headers(), body: JSON.stringify(body),
        });
      } else {
        if (!form.username || !form.password) return setError("Vui lòng điền đầy đủ thông tin");
        res = await fetch(`${apiUrl}/users`, {
          method: "POST", headers: headers(),
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Lỗi không xác định");
      setShowForm(false);
      loadUsers();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Xóa tài khoản "${u.username}"?`)) return;
    await fetch(`${apiUrl}/users/${u.id}`, { method: "DELETE", headers: headers() });
    loadUsers();
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid #333", background: "#1a1a2e",
    color: "#fff", fontSize: 14, boxSizing: "border-box", marginBottom: 12,
  };

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>👥 Quản lý nhân viên</h2>
        <button onClick={openCreate} style={{
          background: "#e94560", color: "#fff", border: "none",
          borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 14,
        }}>+ Thêm tài khoản</button>
      </div>

      {/* Danh sách */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map(u => (
          <div key={u.id} style={{
            background: "#16213e", borderRadius: 12, padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{u.full_name || u.username}</span>
              <span style={{ color: "#888", fontSize: 13, marginLeft: 8 }}>@{u.username}</span>
              <span style={{
                background: ROLE_COLOR[u.role] + "33", color: ROLE_COLOR[u.role],
                borderRadius: 6, padding: "2px 8px", fontSize: 12, marginLeft: 10,
              }}>{ROLE_LABEL[u.role]}</span>
              {!u.active && <span style={{ color: "#ff4d4f", fontSize: 12, marginLeft: 8 }}>🔒 Đã khóa</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEdit(u)} style={{
                background: "#0f3460", color: "#fff", border: "none",
                borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13,
              }}>Sửa</button>
              <button onClick={() => handleDelete(u)} style={{
                background: "#ff4d4f22", color: "#ff4d4f", border: "1px solid #ff4d4f",
                borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13,
              }}>Xóa</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#16213e", borderRadius: 16, padding: 32, width: 380,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <h3 style={{ margin: "0 0 20px", color: "#fff" }}>
              {editing ? "Sửa tài khoản" : "Tạo tài khoản mới"}
            </h3>

            {!editing && (
              <>
                <label style={{ color: "#aaa", fontSize: 13 }}>Username</label>
                <input style={inputStyle} value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})} placeholder="username" />
              </>
            )}

            <label style={{ color: "#aaa", fontSize: 13 }}>Họ tên</label>
            <input style={inputStyle} value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Tên nhân viên" />

            <label style={{ color: "#aaa", fontSize: 13 }}>
              {editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
            </label>
            <input style={inputStyle} type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••" />

            <label style={{ color: "#aaa", fontSize: 13 }}>Vai trò</label>
            <select style={{...inputStyle, cursor: "pointer"}} value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}>
              <option value="waiter">Nhân viên order</option>
              <option value="cashier">Thu ngân</option>
              <option value="admin">Admin</option>
            </select>

            {editing && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#aaa", marginBottom: 16, cursor: "pointer" }}>
                <input type="checkbox" checked={form.active !== false}
                  onChange={e => setForm({...form, active: e.target.checked})} />
                Tài khoản đang hoạt động
              </label>
            )}

            {error && <div style={{ color: "#ff4d4f", marginBottom: 12, fontSize: 14 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} style={{
                flex: 1, background: "#e94560", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px", cursor: "pointer", fontWeight: 700,
              }}>{editing ? "Lưu" : "Tạo tài khoản"}</button>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, background: "#333", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px", cursor: "pointer",
              }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}