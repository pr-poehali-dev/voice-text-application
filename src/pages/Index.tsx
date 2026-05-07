import { useState, useEffect } from "react";
import Landing from "./Landing";
import Auth from "./Auth";
import Studio from "./Studio";
import Dashboard from "./Dashboard";
import AdminPanel from "./AdminPanel";
import Settings from "./Settings";
import Pricing from "./Pricing";
import DemoLimitModal from "@/components/DemoLimitModal";
import PlanBanner from "@/components/PlanBanner";
import PlanBlockOverlay from "@/components/PlanBlockOverlay";
import { usePlanStatus } from "@/hooks/usePlanStatus";
import { loadDemoUsage, saveDemoUsage } from "@/lib/demoFingerprint";

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  plan: 'free' | 'basic' | 'pro' | 'unlimited';
  balance: number;
  avatarUrl?: string;
  isDemo?: boolean;
}

export type { DemoUsage } from "@/lib/demoFingerprint";

const DEMO_USER: User = {
  id: 0,
  email: "demo@voiceai.ru",
  name: "Демо-пользователь",
  role: "user",
  plan: "unlimited",
  balance: 9999,
  isDemo: true,
};

const DEMO_LIMIT = 3;

const Index = ({ startDemo }: { startDemo?: boolean } = {}) => {
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "studio" | "dashboard" | "admin" | "settings" | "pricing" | "payment">("landing");
  const [user, setUser] = useState<User | null>(null);
  const [demoUsage, setDemoUsage] = useState(() => loadDemoUsage());
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoLimitFeature, setDemoLimitFeature] = useState<string>("");
  const planStatus = usePlanStatus(user);

  useEffect(() => {
    if (startDemo) {
      setUser(DEMO_USER);
      setDemoUsage(loadDemoUsage());
      setCurrentPage('studio');
      return;
    }
    const savedUser = localStorage.getItem('voiceAppUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('studio');
    }
  }, [startDemo]);

  const handleDemoAction = (feature: keyof import("@/lib/demoFingerprint").DemoUsage): boolean => {
    const current = demoUsage[feature];
    if (current >= DEMO_LIMIT) {
      setDemoLimitFeature(feature);
      setShowDemoModal(true);
      return false;
    }
    const updated = { ...demoUsage, [feature]: demoUsage[feature] + 1 };
    setDemoUsage(updated);
    saveDemoUsage(updated);
    return true;
  };

  const handleStartDemo = () => {
    setUser(DEMO_USER);
    setDemoUsage(loadDemoUsage());
    setCurrentPage('studio');
  };

  const handleLogin = (userData: User, isNewUser: boolean = false) => {
    setUser(userData);
    localStorage.setItem('voiceAppUser', JSON.stringify(userData));
    setCurrentPage(userData.role === 'admin' ? 'admin' : 'studio');
    
    if (isNewUser) {
      setTimeout(() => {
        if ((window as unknown as { addNotification?: (n: object) => void }).addNotification) {
          (window as unknown as { addNotification: (n: object) => void }).addNotification({
            title: "Добро пожаловать в наше веб-приложение!",
            message: "Желаем плодотворной работы.",
            type: "success",
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }, 500);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('voiceAppUser');
    setDemoUsage({ generate: 0, translate: 0, download: 0 });
    setCurrentPage('landing');
  };

  const handleNavigate = (page: "landing" | "auth" | "studio" | "dashboard" | "admin" | "settings" | "pricing" | "payment") => {
    setCurrentPage(page);
  };

  const handleUpdateUser = (fields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem('voiceAppUser', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDemoRegister = () => {
    setUser(null);
    setCurrentPage('auth');
  };

  const demoProps = user?.isDemo
    ? { demoUsage, demoLimit: DEMO_LIMIT, onDemoAction: handleDemoAction, onDemoRegister: handleDemoRegister }
    : undefined;

  if (!user && currentPage === "landing") {
    return <Landing onNavigate={handleNavigate} onStartDemo={handleStartDemo} />;
  }

  if (!user && currentPage === "auth") {
    return <Auth onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  const allowedWhenBlocked = currentPage === 'pricing' || currentPage === 'settings';

  if (user) {
    return (
      <>
        <PlanBanner planStatus={planStatus} onNavigate={handleNavigate} />
        {(() => {
          switch (currentPage) {
            case "studio":
              return <Studio user={user} onNavigate={handleNavigate} onLogout={handleLogout} demoProps={demoProps} />;
            case "dashboard":
              return <Dashboard user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
            case "admin":
              return user.role === 'admin' ? <AdminPanel user={user} onNavigate={handleNavigate} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /> : <Studio user={user} onNavigate={handleNavigate} onLogout={handleLogout} demoProps={demoProps} />;
            case "settings":
              return <Settings user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
            case "pricing":
              return <Pricing user={user} onNavigate={handleNavigate} />;
            default:
              return <Studio user={user} onNavigate={handleNavigate} onLogout={handleLogout} demoProps={demoProps} />;
          }
        })()}
        {planStatus.isBlocked && !allowedWhenBlocked && (
          <PlanBlockOverlay onNavigate={handleNavigate} />
        )}
        <DemoLimitModal
          open={showDemoModal}
          feature={demoLimitFeature}
          onClose={() => setShowDemoModal(false)}
          onRegister={() => { setShowDemoModal(false); setUser(null); setCurrentPage('auth'); }}
        />
      </>
    );
  }

  return <Landing onNavigate={handleNavigate} onStartDemo={handleStartDemo} />;
};

export default Index;