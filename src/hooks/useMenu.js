// ─── useMenu — fetch, thêm, sửa, xóa món ăn ─────────────────────────────────
import { useState, useCallback } from "react";
import { API_URL } from "../constants";

export function useMenu(apiFetch) {
  const [menu,     setMenu]     = useState([]);
  const [newItem,  setNewItem]  = useState({ name: "", price: "", type: "FOOD" });
  const [file,     setFile]     = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editFile, setEditFile] = useState(null);

  const fetchMenu = useCallback(() => {
    fetch(`${API_URL}/menu`).then(r => r.json()).then(setMenu).catch(() => {});
  }, []);

  const addMenu = async () => {
    if (!newItem.name || !newItem.price) return alert("Vui lòng nhập tên và giá món!");
    const fd = new FormData();
    fd.append("name",  newItem.name);
    fd.append("price", newItem.price);
    fd.append("type",  newItem.type);
    if (file) fd.append("image", file);
    const res = await apiFetch(`${API_URL}/menu`, { method: "POST", body: fd });
    if (!res || !res.ok) {
      if (res) { const d = await res.json().catch(() => ({})); alert(d.error || "Lỗi thêm món!"); }
      return false;
    }
    setNewItem({ name: "", price: "", type: "FOOD" });
    setFile(null);
    fetchMenu();
    return true;
  };

  const updateMenu = async () => {
    if (!editItem) return;
    const fd = new FormData();
    fd.append("name",  editItem.name);
    fd.append("price", editItem.price);
    fd.append("type",  editItem.type);
    if (editFile) fd.append("image", editFile);
    const res = await apiFetch(`${API_URL}/menu/${editItem.id}`, { method: "PUT", body: fd });
    if (!res || !res.ok) {
      if (res) { const d = await res.json().catch(() => ({})); alert(d.error || "Lỗi cập nhật!"); }
      return;
    }
    setEditItem(null);
    setEditFile(null);
    fetchMenu();
  };

  const deleteMenu = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    await apiFetch(`${API_URL}/menu/${id}`, { method: "DELETE" });
    fetchMenu();
  };

  return {
    menu, fetchMenu,
    newItem,  setNewItem,
    file,     setFile,
    editItem, setEditItem,
    editFile, setEditFile,
    addMenu, updateMenu, deleteMenu,
  };
}