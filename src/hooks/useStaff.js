// ─── useStaff — CRUD nhân viên (admin only) ──────────────────────────────────
import { useState, useCallback } from "react";
import { API_URL } from "../constants";

export function useStaff(apiFetch) {
  const [staffList,     setStaffList]     = useState([]);
  const [staffForm,     setStaffForm]     = useState({ username:"", password:"", role:"waiter", full_name:"" });
  const [staffEditing,  setStaffEditing]  = useState(null);
  const [staffShowForm, setStaffShowForm] = useState(false);
  const [staffError,    setStaffError]    = useState("");

  const fetchStaff = useCallback(() => {
    apiFetch(`${API_URL}/users`)
      .then(r => r && r.ok ? r.json() : [])
      .then(d => Array.isArray(d) && setStaffList(d))
      .catch(() => {});
  }, [apiFetch]);

  const openCreateStaff = () => {
    setStaffEditing(null);
    setStaffForm({ username:"", password:"", role:"waiter", full_name:"" });
    setStaffError(""); setStaffShowForm(true);
  };

  const openEditStaff = (u) => {
    setStaffEditing(u);
    setStaffForm({ username:u.username, password:"", role:u.role, full_name:u.full_name||"", active:u.active });
    setStaffError(""); setStaffShowForm(true);
  };

  const submitStaff = async () => {
    setStaffError("");
    try {
      let res;
      if (staffEditing) {
        const body = { full_name:staffForm.full_name, role:staffForm.role, active:staffForm.active };
        if (staffForm.password) body.password = staffForm.password;
        res = await apiFetch(`${API_URL}/users/${staffEditing.id}`, {
          method: "PUT",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify(body),
        });
      } else {
        if (!staffForm.username || !staffForm.password) return setStaffError("Vui lòng điền đầy đủ thông tin");
        res = await apiFetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify(staffForm),
        });
      }
      const d = res && await res.json();
      if (!res || !res.ok) return setStaffError(d?.error || "Lỗi không xác định");
      setStaffShowForm(false); fetchStaff();
    } catch(e) { setStaffError(e.message); }
  };

  const deleteStaff = async (u) => {
    if (!window.confirm(`Xóa tài khoản "${u.username}"?`)) return;
    await apiFetch(`${API_URL}/users/${u.id}`, { method:"DELETE" });
    fetchStaff();
  };

  return {
    staffList,
    staffForm, setStaffForm,
    staffEditing,
    staffShowForm, setStaffShowForm,
    staffError,
    fetchStaff,
    openCreateStaff, openEditStaff,
    submitStaff, deleteStaff,
  };
}