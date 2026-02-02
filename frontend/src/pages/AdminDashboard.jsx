import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AdminDashboard({ tab: propTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathTab = location.pathname.replace("/admin", "").replace("/", "") || "dashboard";
  const tab = propTab || pathTab || "dashboard";

  const [stats, setStats] = useState({ userCount: 0, skillCount: 0, sessionCount: 0 });
  const [students, setStudents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    if (tab === "dashboard" || !tab) {
      setLoading(true);
      api
        .get("/api/admin/stats")
        .then((r) => setStats(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === "students") {
      setLoading(true);
      Promise.all([
        api.get("/api/admin/students"),
        api.get("/api/admin/skills"),
        api.get("/api/admin/sessions"),
      ])
        .then(([studentsRes, skillsRes, sessionsRes]) => {
          setStudents(studentsRes.data);
          setSkills(skillsRes.data);
          setSessions(sessionsRes.data);
        })
        .catch(() => setStudents([]))
        .finally(() => setLoading(false));
    } else if (tab === "skills") {
      api
        .get("/api/admin/skills")
        .then((r) => setSkills(r.data))
        .catch(() => setSkills([]))
        .finally(() => setLoading(false));
    } else if (tab === "sessions") {
      api
        .get("/api/admin/sessions")
        .then((r) => setSessions(r.data))
        .catch(() => setSessions([]))
        .finally(() => setLoading(false));
    } else if (tab === "leaderboard") {
      api
        .get("/api/admin/leaderboard")
        .then((r) => setLeaderboard(r.data))
        .catch(() => setLeaderboard([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab]);

  const go = (t) => navigate("/admin" + (t === "dashboard" ? "" : "/" + t));

  const statCards = [
    { label: "Students", value: stats.userCount },
    { label: "Skills", value: stats.skillCount },
    { label: "Sessions", value: stats.sessionCount },
  ];

  const getStatusBadge = (status) => {
    const configs = {
      completed: "badge-success",
      accepted: "badge-info",
      pending: "badge-warning",
    };
    return configs[status] || "badge-neutral";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Monitor and manage your campus learning community</p>
      </div>

      {/* Stats */}
      {(tab === "dashboard" || !tab) && (
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    index === 0
                      ? "from-blue-400 to-indigo-400"
                      : index === 1
                      ? "from-purple-400 to-pink-400"
                      : "from-green-400 to-emerald-400"
                  } flex items-center justify-center text-2xl shadow-lg`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard quick links */}
      {(tab === "dashboard" || !tab) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { to: "/admin/students", label: "Students", desc: "View all students" },
            { to: "/admin/skills", label: "Skills", desc: "Manage skills" },
            { to: "/admin/sessions", label: "Sessions", desc: "View sessions" },
            { to: "/admin/leaderboard", label: "Leaderboard", desc: "Top mentors" },
          ].map((link, index) => (
            <button
              key={link.to}
              onClick={() => go(link.to.replace("/admin/", ""))}
              className={`card-elevated p-5 text-left group animate-fade-in flex items-center gap-4`}
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${
                  index === 0
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-600"
                    : index === 1
                    ? "bg-purple-50 hover:bg-purple-100 text-purple-600"
                    : index === 2
                    ? "bg-green-50 hover:bg-green-100 text-green-600"
                    : "bg-yellow-50 hover:bg-yellow-100 text-yellow-600"
                } flex items-center justify-center text-xl transition-transform group-hover:scale-110`}
              >
                {index === 0 ? ">" : index === 1 ? "*" : index === 2 ? "=" : "#"}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{link.label}</h3>
                <p className="text-gray-500 text-sm">{link.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Students table */}
      {tab === "students" && (
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800">All Students</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No students</h3>
              <p className="text-gray-500">No students registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Points</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Skills</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((u) => {
                    const studentSkills = skills.filter((s) => s.mentorId?._id === u._id);
                    const studentSessionsAsLearner = sessions.filter((s) => s.learnerId?._id === u._id);
                    const studentSessionsAsMentor = sessions.filter((s) => s.mentorId?._id === u._id);
                    const expanded = expandedStudentId === u._id;
                    return (
                      <React.Fragment key={u._id}>
                        <tr
                          onClick={() => setExpandedStudentId(expanded ? null : u._id)}
                          className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="avatar text-xs">
                                {u.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4 text-gray-600">{u.contact || "-"}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-primary">{u.points ?? 0}</span>
                          </td>
                          <td className="py-3 px-4">{studentSkills.length}</td>
                          <td className="py-3 px-4">
                            {studentSessionsAsLearner.length + studentSessionsAsMentor.length}
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-t border-gray-100 bg-gray-50/50">
                            <td colSpan={6} className="py-4 px-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="bg-white rounded-xl p-4">
                                  <h3 className="text-sm font-semibold text-primary mb-2">
                                    Skills (teaching)
                                  </h3>
                                  {studentSkills.length === 0 ? (
                                    <p className="text-sm text-gray-500">None</p>
                                  ) : (
                                    <ul className="text-sm space-y-1">
                                      {studentSkills.map((s) => (
                                        <li key={s._id} className="flex justify-between">
                                          <span>{s.title}</span>
                                          <span className="text-gray-500">{s.category}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div className="bg-white rounded-xl p-4">
                                  <h3 className="text-sm font-semibold text-primary mb-2">Sessions</h3>
                                  {studentSessionsAsLearner.length === 0 &&
                                  studentSessionsAsMentor.length === 0 ? (
                                    <p className="text-sm text-gray-500">None</p>
                                  ) : (
                                    <ul className="text-sm space-y-2">
                                      {studentSessionsAsLearner.map((s) => (
                                        <li key={s._id} className="border-l-2 border-blue-300 pl-2">
                                          <span className="font-medium">Learner:</span> {s.skillId?.title} with{" "}
                                          {s.mentorId?.name} | {new Date(s.date).toLocaleDateString()} (
                                          {s.status})
                                        </li>
                                      ))}
                                      {studentSessionsAsMentor.map((s) => (
                                        <li key={s._id} className="border-l-2 border-green-300 pl-2">
                                          <span className="font-medium">Mentor:</span> {s.skillId?.title} with{" "}
                                          {s.learnerId?.name} | {new Date(s.date).toLocaleDateString()} (
                                          {s.status})
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Skills table */}
      {tab === "skills" && (
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800">All Skills</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No skills</h3>
              <p className="text-gray-500">No skills offered by students</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Mentor</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s) => (
                    <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{s.title}</td>
                      <td className="py-3 px-4">
                        <span className="badge badge-neutral">{s.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="avatar text-xs">
                            {s.mentorId?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{s.mentorId?.name}</p>
                            <p className="text-xs text-gray-500">{s.mentorId?.email}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sessions table */}
      {tab === "sessions" && (
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800">All Sessions</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No sessions</h3>
              <p className="text-gray-500">No sessions scheduled</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Skill</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Learner</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Mentor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{s.skillId?.title}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{s.learnerId?.name}</p>
                        <p className="text-xs text-gray-500">{s.learnerId?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{s.mentorId?.name}</p>
                        <p className="text-xs text-gray-500">{s.mentorId?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p>{new Date(s.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{s.timeSlot || "-"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${getStatusBadge(s.status)}`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800">Top Mentors</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No data</h3>
              <p className="text-gray-500">Leaderboard will appear soon</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, i) => (
                  <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span
                        className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold ${
                          i === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : i === 1
                            ? "bg-gray-100 text-gray-700"
                            : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">{u.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
