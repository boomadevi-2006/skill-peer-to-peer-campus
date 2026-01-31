import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/leaderboard")
      .then((r) => setLeaders(r.data))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Leaderboard</h1>
      <p className="text-gray-600 mb-6">Top student mentors by points earned.</p>
      <div className="card overflow-hidden">
        {leaders.length === 0 ? (
          <p className="text-gray-500">No data yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-primary/10">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-primary">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-primary">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-primary">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-primary">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((u, i) => (
                <tr key={u._id} className="border-t border-gray-100">
                  <td className="py-3 px-4">{i + 1}</td>
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4 font-semibold text-primary">{u.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
