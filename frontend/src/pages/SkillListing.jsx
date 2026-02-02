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
    api
      .get("/api/skills")
      .then(({ data }) => setSkills(data))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
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

  const getCategoryColor = (category) => {
    const colors = {
      programming: "bg-blue-100 text-blue-700",
      design: "bg-pink-100 text-pink-700",
      language: "bg-green-100 text-green-700",
      music: "bg-purple-100 text-purple-700",
      business: "bg-yellow-100 text-yellow-700",
      science: "bg-cyan-100 text-cyan-700",
    };
    const key = category?.toLowerCase().split(" ")[0] || "default";
    return colors[key] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Browse Skills</h1>
        <p className="section-subtitle">
          Discover skills offered by your peers and request a session to learn
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold text-gray-800 mb-2">No skills available</h3>
          <p className="text-gray-500">Check back later or add your own skills!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => (
            <div key={skill._id} className="card-elevated group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-xl text-gray-800 group-hover:text-primary transition-colors">
                  {skill.title}
                </h3>
                <span className={`badge ${getCategoryColor(skill.category)}`}>
                  {skill.category}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Mentor: {skill.mentorId?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>{skill.mentorId?.points ?? 0} points</span>
                </div>
              </div>

              <button onClick={() => openRequest(skill)} className="btn-primary w-full">
                Request Session
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedSkill && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="card-elevated max-w-md w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Request Session</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                X
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary/5 rounded-xl">
              <p className="font-semibold text-primary">{selectedSkill.title}</p>
              <p className="text-sm text-gray-500">with {selectedSkill.mentorId?.name}</p>
            </div>

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time Slot
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teaching Mode
                </label>
                <select
                  value={teachingMode}
                  onChange={(e) => setTeachingMode(e.target.value)}
                  className="input-field"
                >
                  <option value="in-person">In-Person (Campus)</option>
                  <option value="online">Online (Google Meet / Zoom)</option>
                  <option value="flexible">Flexible (Discuss with mentor)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={!!requestingId}>
                  {requestingId ? "Sending..." : "Send Request"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
