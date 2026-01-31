import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  useEffect(() => {
    api.get("/api/auth/me").then((r) => updateUser(r.data)).catch(() => {});
  }, [updateUser]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-dark mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.name}.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card border-primary/20">
          <h2 className="text-lg font-semibold text-primary">Your Points</h2>
          <p className="text-3xl font-bold text-primary-dark mt-2">{user?.points ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Earn points by mentoring</p>
        </div>
        <Link to="/skills" className="card border-primary/20 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-primary">My Skills</h2>
          <p className="text-sm text-gray-600 mt-2">Skills you can teach</p>
        </Link>
        <Link to="/browse" className="card border-primary/20 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-primary">Browse Skills</h2>
          <p className="text-sm text-gray-600 mt-2">Find skills to learn</p>
        </Link>
        <Link to="/sessions" className="card border-primary/20 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-primary">Sessions</h2>
          <p className="text-sm text-gray-600 mt-2">Session requests</p>
        </Link>
        <Link to="/chat" className="card border-primary/20 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-primary">Chat</h2>
          <p className="text-sm text-gray-600 mt-2">Coordinate with peers</p>
        </Link>
        <Link to="/leaderboard" className="card border-primary/20 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-primary">Leaderboard</h2>
          <p className="text-sm text-gray-600 mt-2">Top mentors</p>
        </Link>
      </div>
    </div>
  );
}
