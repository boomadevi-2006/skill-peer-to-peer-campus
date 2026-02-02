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

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(message);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="section-title">Chat</h1>
          <p className="section-subtitle">Connect with your learning partners</p>
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="card animate-pulse h-96" />
          </div>
          <div className="flex-1 card animate-pulse h-96" />
        </div>
      </div>
    );
  }

  if (sessionList.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="section-title">Chat</h1>
          <p className="section-subtitle">Connect with your learning partners</p>
        </div>
        <div className="card text-center py-16">
          <h3 className="text-xl font-bold text-gray-800 mb-2">No chats yet</h3>
          <p className="text-gray-500 mb-6">Chat is available after a session is accepted</p>
          <Link to="/sessions" className="btn-primary inline-block">
            Go to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Chat</h1>
        <p className="section-subtitle">Coordinate with your mentor or learner</p>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sessions list */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Your Sessions
            </h2>
            <div className="space-y-2">
              {sessionList.map((s) => {
                const otherUser = s.mentorId?._id === user?._id ? s.learnerId : s.mentorId;
                const active = selectedSession?._id === s._id;
                return (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSession(s)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      active
                        ? "bg-primary text-white shadow-lg"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="font-medium truncate">{otherUser?.name}</div>
                    <div className={`text-xs ${active ? "text-primary-pale" : "text-gray-500"}`}>
                      {s.skillId?.title} | {new Date(s.date).toLocaleDateString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 card flex flex-col min-h-[500px]">
          {selectedSession && (
            <>
              {/* Chat header */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar-lg">
                    {other?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{other?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedSession.skillId?.title} | {new Date(selectedSession.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 min-h-[300px] max-h-[400px] px-2">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="text-center text-gray-400 text-sm my-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{date}</span>
                    </div>
                    {msgs.map((m) => (
                      <div
                        key={m._id}
                        className={`flex ${m.senderId?._id === user?._id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] ${
                            m.senderId?._id === user?._id ? "message-sent" : "message-received"
                          } px-4 py-2.5`}
                        >
                          <p>{m.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              m.senderId?._id === user?._id ? "text-primary-pale" : "text-gray-400"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  className="btn-primary px-6"
                  disabled={sending || !newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
