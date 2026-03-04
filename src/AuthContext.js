// src/AuthContext.js
// Paste file này vào pos-ui/src/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children, apiUrl }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pos_token");
    const saved = localStorage.getItem("pos_user");
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
    setReady(true);
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");
    localStorage.setItem("pos_token", data.token);
    localStorage.setItem("pos_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pos_token");
    localStorage.removeItem("pos_user");
    setUser(null);
  };

  const getToken = () => localStorage.getItem("pos_token");

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}