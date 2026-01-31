import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rescheduled: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function SessionRequests() {
  const [sessions, setSessions] = useState({ asLearner: [], asMentor: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/sessions/my")
      .then((r) => setSessions(r.data))
      .catch(() => setSessions({ asLearner: [], asMentor: [] }))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (sessionId, status) => {
    try {
      await api.patch("/api/sessions/" + sessionId, { status });
      const r = await api.get("/api/sessions/my");
      setSessions(r.data);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  function SessionCard({ s, asMentor }) {
    const other = asMentor ? s.learnerId : s.mentorId;
    const skill = s.skillId;
    const canAccept = asMentor && s.status === "pending";
    const canComplete = asMentor && (s.status === "accepted" || s.status === "rescheduled");
    const canChat = ["accepted", "rescheduled", "completed"].includes(s.status);
    const sc = statusColors[s.status] || "";
    return (
      <div className="card mb-4">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-primary-dark">{skill?.title}</h3>
            <p className="text-sm text-gray-500">{skill?.category}</p>
            <p className="text-sm text-gray-600 mt-1">With: {other?.name}</p>
            <p className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString()} - {s.timeSlot}</p>
            <p className="text-xs text-gray-500">Mode: {s.teachingMode}</p>
          </div>
          <span className={"px-2 py-1 rounded text-xs font-medium " + sc}>{s.status}</span>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {canAccept && <button onClick={() => updateStatus(s._id, "accepted")} className="btn-primary text-sm">Accept</button>}
          {canComplete && <button onClick={() => updateStatus(s._id, "completed")} className="btn-primary text-sm">Mark Completed</button>}
          {canChat && <Link to={"/chat/" + s._id} className="btn-secondary text-sm">Chat</Link>}
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Sessions</h1>
      <p className="text-gray-600 mb-6">Requests you sent and received. Chat is available after acceptance.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">As Learner</h2>
          {sessions.asLearner.length === 0 ? <p className="text-gray-500">No sessions as learner.</p> : sessions.asLearner.map((s) => <SessionCard key={s._id} s={s} asMentor={false} />)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">As Mentor</h2>
          {sessions.asMentor.length === 0 ? <p className="text-gray-500">No sessions as mentor.</p> : sessions.asMentor.map((s) => <SessionCard key={s._id} s={s} asMentor={true} />)}
        </div>
      </div>
    </div>
  );
}
