import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="bg-primary-dark text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="font-semibold text-lg">
              SkillSwap Campus
            </NavLink>
            <div className="flex items-center gap-4">
              {isAdmin ? (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/students"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Students
                  </NavLink>
                  <NavLink
                    to="/admin/skills"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Skills
                  </NavLink>
                  <NavLink
                    to="/admin/sessions"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Sessions
                  </NavLink>
                  <NavLink
                    to="/admin/leaderboard"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Leaderboard
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/skills"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    My Skills
                  </NavLink>
                  <NavLink
                    to="/browse"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Browse
                  </NavLink>
                  <NavLink
                    to="/sessions"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Sessions
                  </NavLink>
                  <NavLink
                    to="/chat"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Chat
                  </NavLink>
                  <NavLink
                    to="/leaderboard"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md ${isActive ? 'bg-primary-light' : 'hover:bg-primary'}`
                    }
                  >
                    Leaderboard
                  </NavLink>
                </>
              )}
              <span className="text-primary-pale text-sm">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-light text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-sm text-gray-500 mb-4 bg-primary-pale/20 border border-primary-pale/40 rounded-lg px-3 py-2">
          Teaching happens outside the platform using mutually agreed methods (e.g. in-person, Google Meet, WhatsApp).
        </p>
        <Outlet />
      </main>
    </div>
  );
}
