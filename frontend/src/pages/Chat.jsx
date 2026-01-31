import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { sessionId: paramSessionId } = useParams();
  const [sessionList, setSessionList] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/api/sessions/my").then((r) => {
      const all = [...(r.data.asLearner || []), ...(r.data.asMentor || [])];
      const chatable = all.filter((s) => ["accepted", "rescheduled", "completed"].includes(s.status));
      setSessionList(chatable);
      const fromParam = paramSessionId ? chatable.find((s) => s._id === paramSessionId) : null;
      setSelectedSession(fromParam || (chatable.length ? chatable[0] : null));
    }).catch(() => setSessionList([])).finally(() => setLoading(false));
  }, [paramSessionId]);

  useEffect(() => {
    if (!selectedSession) { setMessages([]); return; }
    api.get("/api/chat/session/" + selectedSession._id).then((r) => setMessages(r.data)).catch(() => setMessages([]));
  }, [selectedSession]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession || sending) return;
    setSending(true);
    try {
      const r = await api.post("/api/chat", { sessionId: selectedSession._id, message: newMessage.trim() });
      setMessages((prev) => [...prev, r.data]);
      setNewMessage("");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  const other = selectedSession ? (selectedSession.mentorId?._id === user?._id ? selectedSession.learnerId : selectedSession.mentorId) : null;

  // Group messages by session and date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    const sessionKey = `${message.sessionId}-${date}`; // Combine sessionId and date for grouping
    if (!acc[sessionKey]) {
      acc[sessionKey] = [];
    }
    acc[sessionKey].push(message);
    return acc;
  }, {});

  if (loading) return <p className="text-gray-500">Loading...</p>;

  if (sessionList.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-primary-dark mb-2">Chat</h1>
        <p className="text-gray-600">No sessions with chat enabled. Chat is available after a session is accepted.</p>
        <Link to="/sessions" className="text-primary font-medium mt-4 inline-block">Go to Sessions</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Chat</h1>
      <p className="text-gray-600 mb-4">Coordinate with mentor or learner. Text only.</p>
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="card">
            <h2 className="text-sm font-semibold text-primary mb-2">Sessions</h2>
            {sessionList.map((s) => {
              const otherUser = s.mentorId?._id === user?._id ? s.learnerId : s.mentorId;
              const active = selectedSession?._id === s._id;
              return (
                <button
                  key={s._id}
                  onClick={() => setSelectedSession(s)}
                  className={
                    "w-full text-left py-2 px-3 rounded-lg mb-1 " +
                    (active ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100")
                  }
                >
                  {otherUser?.name} - {s.skillId?.title} ({new Date(s.date).toLocaleDateString()})
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 card flex flex-col min-h-[400px]">
          {selectedSession && (
            <>
              <div className="border-b pb-2 mb-2">
                <h3 className="font-semibold">{other?.name} - {selectedSession.skillId?.title}</h3>
                <p className="text-sm text-gray-500">Scheduled on: {new Date(selectedSession.date).toLocaleDateString()}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[360px]">
                {/* Render grouped messages */}
                {Object.entries(groupedMessages).map(([key, messages]) => {
                  const [sessionId, date] = key.split('-'); // Extract sessionId and date from the key
                  return (
                    <div key={key}>
                      <div className="text-center text-gray-500 text-sm my-2">{date}</div>
                      {messages.map((m) => (
                        <div key={m._id} className={m.senderId?._id === user?._id ? "text-right" : "text-left"}>
                          <span className={"inline-block px-3 py-2 rounded-lg max-w-[80%] " + (m.senderId?._id === user?._id ? "bg-primary text-white" : "bg-gray-100 text-gray-800")}>
                            {m.senderId?.name}: {m.message}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(m.createdAt).toLocaleTimeString()}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 mt-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="input-field flex-1" />
                <button type="submit" className="btn-primary" disabled={sending || !newMessage.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
