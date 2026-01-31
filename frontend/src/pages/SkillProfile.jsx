import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function SkillProfile() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchSkills = () => {
    api.get("/api/skills/my").then((r) => setSkills(r.data)).catch(() => setSkills([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.patch("/api/skills/" + editingId, { title, category });
        setEditingId(null);
      } else {
        await api.post("/api/skills", { title, category });
      }
      setTitle("");
      setCategory("");
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setTitle(s.title);
    setCategory(s.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setCategory("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await api.delete("/api/skills/" + id);
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Skills I Can Teach</h1>
      <p className="text-gray-600 mb-6">Add and manage skills you offer.</p>
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">{editingId ? "Edit Skill" : "Add Skill"}</h2>
        {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Python" required />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" placeholder="e.g. Programming" required />
          </div>
          <button type="submit" className="btn-primary">{editingId ? "Update" : "Add"}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </form>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-primary mb-4">My Skills</h2>
        {loading ? <p className="text-gray-500">Loading...</p> : skills.length === 0 ? <p className="text-gray-500">No skills yet. Add one above.</p> : (
          <ul className="divide-y divide-gray-100">
            {skills.map((s) => (
              <li key={s._id} className="py-3 flex justify-between items-center">
                <div><span className="font-medium">{s.title}</span> <span className="text-gray-500">({s.category})</span></div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(s)} className="text-primary text-sm font-medium hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s._id)} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
