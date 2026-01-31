import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function SkillListing() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [teachingMode, setTeachingMode] = useState("flexible");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/skills").then(({ data }) => setSkills(data)).catch(() => setSkills([])).finally(() => setLoading(false));
  }, []);

  const openRequest = (skill) => {
    setSelectedSkill(skill);
    setDate("");
    setTimeSlot("");
    setTeachingMode("flexible");
    setShowModal(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!selectedSkill) return;
    setRequestingId(selectedSkill._id);
    try {
      await api.post("/api/sessions", {
        skillId: selectedSkill._id,
        date: new Date(date).toISOString(),
        timeSlot,
        teachingMode,
      });
      setShowModal(false);
      setSelectedSkill(null);
      navigate("/sessions");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setRequestingId(null);
    }
  };

  const myId = user?._id;
  const filtered = skills.filter((s) => s.mentorId?._id !== myId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Browse Skills</h1>
      <p className="text-gray-600 mb-6">Skills offered by other students. Request a session to learn.</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => (
            <div key={skill._id} className="card hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-primary-dark">{skill.title}</h3>
              <p className="text-sm text-gray-500">{skill.category}</p>
              <p className="text-sm text-gray-600 mt-2">Mentor: {skill.mentorId?.name}</p>
              <p className="text-xs text-gray-500">Points: {skill.mentorId?.points ?? 0}</p>
              <button onClick={() => openRequest(skill)} className="btn-primary mt-4 w-full">
                Request Session
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-lg font-semibold text-primary mb-4">Request: {selectedSkill.title}</h2>
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 2:00 PM - 3:00 PM"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Mode</label>
                <select value={teachingMode} onChange={(e) => setTeachingMode(e.target.value)} className="input-field">
                  <option value="in-person">In-Person (Campus)</option>
                  <option value="online">Online (Google Meet / Zoom)</option>
                  <option value="flexible">Teaching Happens Outside (Flexible)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={!!requestingId}>
                  {requestingId ? "Sending..." : "Send Request"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
