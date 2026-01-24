import { useState, useEffect } from "react";
import Landing from "./Landing";
import Auth from "./Auth";
import Studio from "./Studio";
import Dashboard from "./Dashboard";
import AdminPanel from "./AdminPanel";

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  plan: 'free' | 'basic' | 'pro' | 'unlimited';
  balance: number;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "studio" | "dashboard" | "admin">("landing");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('voiceAppUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('studio');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('voiceAppUser', JSON.stringify(userData));
    setCurrentPage(userData.role === 'admin' ? 'admin' : 'studio');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('voiceAppUser');
    setCurrentPage('landing');
  };

  const handleNavigate = (page: "landing" | "auth" | "studio" | "dashboard" | "admin") => {
    setCurrentPage(page);
  };

  if (!user && currentPage === "landing") {
    return <Landing onNavigate={handleNavigate} />;
  }

  if (!user && currentPage === "auth") {
    return <Auth onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  if (user) {
    switch (currentPage) {
      case "studio":
        return <Studio user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "dashboard":
        return <Dashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case "admin":
        return user.role === 'admin' ? <AdminPanel user={user} onNavigate={handleNavigate} onLogout={handleLogout} /> : <Studio user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <Studio user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  }

  return <Landing onNavigate={handleNavigate} />;
};

export default Index;
