// src/LoginScreen.js
// Paste file này vào pos-ui/src/LoginScreen.js

import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#1a1a2e",
    }}>
      <div style={{
        background: "#16213e", borderRadius: 16, padding: "40px 48px",
        width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🔥</div>
          <h1 style={{ color: "#fff", fontSize: 22, margin: "8px 0 4px", fontWeight: 700 }}>
            BBQ POS
          </h1>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}></p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 6 }}>
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập username..."
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                border: "1px solid #333", background: "#0f3460",
                color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 6 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                border: "1px solid #333", background: "#0f3460",
                color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#ff4d4f22", border: "1px solid #ff4d4f",
              color: "#ff4d4f", borderRadius: 8, padding: "10px 14px",
              marginBottom: 16, fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 8,
              background: loading ? "#555" : "#e94560",
              color: "#fff", fontSize: 16, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}