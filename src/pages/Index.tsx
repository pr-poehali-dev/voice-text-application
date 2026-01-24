import { useState } from "react";
import Landing from "./Landing";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Subscription from "./Subscription";
import Profile from "./Profile";
import Admin from "./Admin";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "dashboard" | "subscription" | "profile" | "admin">("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: "landing" | "auth" | "dashboard" | "subscription" | "profile" | "admin") => {
    setCurrentPage(page);
  };

  if (!isLoggedIn && currentPage === "landing") {
    return <Landing onNavigate={handleNavigate} />;
  }

  if (!isLoggedIn && currentPage === "auth") {
    return <Auth onLogin={handleLogin} />;
  }

  if (isLoggedIn) {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "subscription":
        return <Subscription onNavigate={handleNavigate} />;
      case "profile":
        return <Profile onNavigate={handleNavigate} />;
      case "admin":
        return <Admin onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  }

  return <Landing onNavigate={handleNavigate} />;
};

export default Index;