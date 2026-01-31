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
      api.get("/api/admin/stats").then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
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
      api.get("/api/admin/skills").then((r) => setSkills(r.data)).catch(() => setSkills([])).finally(() => setLoading(false));
    } else if (tab === "sessions") {
      api.get("/api/admin/sessions").then((r) => setSessions(r.data)).catch(() => setSessions([])).finally(() => setLoading(false));
    } else if (tab === "leaderboard") {
      api.get("/api/admin/leaderboard").then((r) => setLeaderboard(r.data)).catch(() => setLeaderboard([])).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab]);

  const go = (t) => navigate("/admin" + (t === "dashboard" ? "" : "/" + t));

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Monitor users, skills, sessions, and leaderboard.</p>

      {(tab === "dashboard" || !tab) && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="card border-primary/20">
            <h2 className="text-sm font-semibold text-primary">Students</h2>
            <p className="text-3xl font-bold text-primary-dark mt-1">{stats.userCount}</p>
          </div>
          <div className="card border-primary/20">
            <h2 className="text-sm font-semibold text-primary">Skills</h2>
            <p className="text-3xl font-bold text-primary-dark mt-1">{stats.skillCount}</p>
          </div>
          <div className="card border-primary/20">
            <h2 className="text-sm font-semibold text-primary">Sessions</h2>
            <p className="text-3xl font-bold text-primary-dark mt-1">{stats.sessionCount}</p>
          </div>
        </div>
      )}

      {tab === "students" && (
        <div className="card overflow-hidden">
          <h2 className="text-lg font-semibold text-primary mb-4">All Students</h2>
          <p className="text-sm text-gray-500 mb-4">Click a row to expand and see that student&apos;s skills and session details.</p>
          {loading ? <p className="text-gray-500">Loading...</p> : students.length === 0 ? <p className="text-gray-500">No students.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Name</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Email</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Contact</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Points</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Skills (teaching)</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Sessions</th>
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
                          className="border-t border-gray-100 hover:bg-primary/5 cursor-pointer"
                        >
                          <td className="py-2 px-3 font-medium">{u.name}</td>
                          <td className="py-2 px-3">{u.email}</td>
                          <td className="py-2 px-3">{u.contact || "—"}</td>
                          <td className="py-2 px-3">{u.points ?? 0}</td>
                          <td className="py-2 px-3">{studentSkills.length}</td>
                          <td className="py-2 px-3">{studentSessionsAsLearner.length + studentSessionsAsMentor.length}</td>
                        </tr>
                        {expanded && (
                          <tr className="border-t border-gray-100 bg-gray-50">
                            <td colSpan={6} className="py-4 px-3">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <h3 className="text-sm font-semibold text-primary mb-2">Skills (teaching)</h3>
                                  {studentSkills.length === 0 ? <p className="text-sm text-gray-500">None</p> : (
                                    <ul className="text-sm space-y-1">
                                      {studentSkills.map((s) => (
                                        <li key={s._id} className="flex justify-between"><span>{s.title}</span><span className="text-gray-500">{s.category}</span></li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-primary mb-2">Sessions</h3>
                                  {studentSessionsAsLearner.length === 0 && studentSessionsAsMentor.length === 0 ? <p className="text-sm text-gray-500">None</p> : (
                                    <ul className="text-sm space-y-2">
                                      {studentSessionsAsLearner.map((s) => (
                                        <li key={s._id} className="border-l-2 border-primary/30 pl-2">
                                          <span className="font-medium">Learner</span>: {s.skillId?.title} with {s.mentorId?.name} — {new Date(s.date).toLocaleDateString()} {s.timeSlot} ({s.teachingMode}) — {s.status}
                                        </li>
                                      ))}
                                      {studentSessionsAsMentor.map((s) => (
                                        <li key={s._id} className="border-l-2 border-primary pl-2">
                                          <span className="font-medium">Mentor</span>: {s.skillId?.title} with {s.learnerId?.name} — {new Date(s.date).toLocaleDateString()} {s.timeSlot} ({s.teachingMode}) — {s.status}
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

      {tab === "skills" && (
        <div className="card overflow-hidden">
          <h2 className="text-lg font-semibold text-primary mb-4">All Skills</h2>
          <p className="text-sm text-gray-500 mb-4">Skills offered by students (mentors).</p>
          {loading ? <p className="text-gray-500">Loading...</p> : skills.length === 0 ? <p className="text-gray-500">No skills.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Title</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Category</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Mentor (name)</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Mentor (email)</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s) => (
                    <tr key={s._id} className="border-t border-gray-100">
                      <td className="py-2 px-3 font-medium">{s.title}</td>
                      <td className="py-2 px-3">{s.category}</td>
                      <td className="py-2 px-3">{s.mentorId?.name}</td>
                      <td className="py-2 px-3 text-gray-600">{s.mentorId?.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "sessions" && (
        <div className="card overflow-hidden">
          <h2 className="text-lg font-semibold text-primary mb-4">All Sessions</h2>
          <p className="text-sm text-gray-500 mb-4">Full session details including date, time slot, and teaching mode.</p>
          {loading ? <p className="text-gray-500">Loading...</p> : sessions.length === 0 ? <p className="text-gray-500">No sessions.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Skill</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Learner</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Mentor</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Date</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Time Slot</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Teaching Mode</th>
                    <th className="text-left py-2 px-3 font-semibold text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s._id} className="border-t border-gray-100">
                      <td className="py-2 px-3">{s.skillId?.title}</td>
                      <td className="py-2 px-3">{s.learnerId?.name}<br /><span className="text-xs text-gray-500">{s.learnerId?.email}</span></td>
                      <td className="py-2 px-3">{s.mentorId?.name}<br /><span className="text-xs text-gray-500">{s.mentorId?.email}</span></td>
                      <td className="py-2 px-3">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3">{s.timeSlot || "—"}</td>
                      <td className="py-2 px-3">{s.teachingMode || "—"}</td>
                      <td className="py-2 px-3"><span className={"px-2 py-0.5 rounded text-xs font-medium " + (s.status === "completed" ? "bg-green-100 text-green-800" : s.status === "accepted" ? "bg-blue-100 text-blue-800" : s.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800")}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="card overflow-hidden">
          <h2 className="text-lg font-semibold text-primary mb-4">Leaderboard (Top Mentors)</h2>
          {loading ? <p className="text-gray-500">Loading...</p> : leaderboard.length === 0 ? <p className="text-gray-500">No data.</p> : (
            <table className="w-full">
              <thead className="bg-primary/10"><tr><th className="text-left py-2 px-3 font-semibold text-primary">Rank</th><th className="text-left py-2 px-3 font-semibold text-primary">Name</th><th className="text-left py-2 px-3 font-semibold text-primary">Email</th><th className="text-left py-2 px-3 font-semibold text-primary">Points</th></tr></thead>
              <tbody>
                {leaderboard.map((u, i) => (
                  <tr key={u._id} className="border-t border-gray-100"><td className="py-2 px-3">{i + 1}</td><td className="py-2 px-3">{u.name}</td><td className="py-2 px-3">{u.email}</td><td className="py-2 px-3 font-semibold text-primary">{u.points}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
