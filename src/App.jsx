import React, { useState, useEffect } from "react";
import "./App.css";
import { PenTool } from "lucide-react";
import { supabase } from "./supabaseClient";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Builder from "./pages/Builder";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserRole(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
         checkUserRole(session.user);
      } else {
         setUser(null);
         setCurrentView("landing");
         setCurrentResume(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (sessionUser) => {
    // Attempt to fetch profile info
    const { data, error } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
    const role = data?.role || 'user';
    setUser({ ...sessionUser, role, name: sessionUser.user_metadata?.full_name || sessionUser.email });
    if(currentView === 'landing' || currentView === 'auth') {
        setCurrentView(role === 'admin' ? "admin" : "dashboard");
    }
  };

  const handleLogin = (userData) => {
    if (!userData) return;
    // Handled by AuthStateChange generally, but just in case
    if (!user) {
        checkUserRole(userData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView("landing");
    setCurrentResume(null);
  };


  return (
    <div className="app-container animate-fade-in">
      {/* Header */}
      <header className="app-header">
        <div
          className="logo"
          style={{ cursor: "pointer" }}
          onClick={() => setCurrentView(user ? (user.role === 'admin' ? 'admin' : 'dashboard') : "landing")}
        >
          <PenTool size={28} color="var(--accent-color)" />
          <span>AI Resume Maker</span>
        </div>

        <nav className="nav-links">
          {user ? (
            <>
              {user.role === 'admin' && (
                  <button onClick={() => setCurrentView("admin")}>
                    Admin Area
                  </button>
              )}
              <button onClick={() => setCurrentView("dashboard")}>
                Dashboard
              </button>
              <button onClick={() => setCurrentView("builder")}>
                Create
              </button>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: "6px 12px" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {currentView === "landing" && (
                <>
                  <button onClick={() => setCurrentView("auth")}>
                    Login
                  </button>

                  <button
                    onClick={() => setCurrentView("auth")}
                    className="btn-primary"
                  >
                    Get Started
                  </button>
                </>
              )}
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {currentView === "landing" && (
          <Landing onNavigate={setCurrentView} />
        )}

        {currentView === "auth" && (
          <Auth onLogin={handleLogin} onNavigate={setCurrentView} />
        )}

        {currentView === "dashboard" && (
          <Dashboard
            onNavigate={(view) => {
                if (view === 'builder') setCurrentResume(null);
                setCurrentView(view);
            }}
            user={user}
            onLogout={handleLogout}
            onEditResume={(resume) => {
                setCurrentResume(resume);
                setCurrentView('builder');
            }}
          />
        )}

        {currentView === "admin" && (
          <AdminDashboard
            onNavigate={setCurrentView}
            user={user}
            onLogout={handleLogout}
          />
        )}

        {currentView === "builder" && (
          <Builder 
             onNavigate={setCurrentView} 
             user={user} 
             initialData={currentResume?.data}
             resumeId={currentResume?.id}
          />
        )}
      </main>
    </div>
  );
}

export default App;