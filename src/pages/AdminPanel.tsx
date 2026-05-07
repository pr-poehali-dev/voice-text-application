import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import WalletWidget from "@/components/WalletWidget";
import NotificationBell from "@/components/NotificationBell";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminStudio2 from "@/components/admin/AdminStudio2";
import type { User } from "./Index";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  plan: string;
  characters_used: number;
  created_at: string;
  total_generations: number;
}

interface AdminStats {
  total_users: number;
  active_users: number;
  users_today: number;
  generations_today: number;
  total_generations: number;
  total_characters: number;
  total_audio_hours: number;
  top_users: Array<{id: number; name: string; email: string; generations: number; characters: number}>;
  plan_stats: Record<string, number>;
  activity: Array<{date: string; count: number}>;
}

const AdminPanel = ({ user, onNavigate, onLogout, onUpdateUser }: { user: User; onNavigate: (page: string) => void; onLogout: () => void; onUpdateUser?: (fields: Partial<User>) => void }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить список пользователей", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/d8226be4-73c4-4b3c-b3af-423231e920d7');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Volume2" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VoiceAI</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Icon name="Shield" size={14} className="mr-1" />
              Администратор
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <WalletWidget user={user} />
            <NotificationBell user={user} />
            <Button variant="ghost" size="sm" onClick={() => onNavigate('studio')}>
              <Icon name="Mic2" size={18} className="mr-2" />
              Студия
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="LayoutDashboard" size={18} className="mr-2" />
              Кабинет
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Управление пользователями и системой VoiceAI</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="users">
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="studio2">
              <Icon name="Mic" size={16} className="mr-2" />
              Студия №2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminStatsCards stats={stats} users={users} />
            <AdminUsersTable
              users={users}
              stats={stats}
              isLoading={isLoading}
              onNavigate={onNavigate}
              onRefresh={fetchUsers}
              onRefreshStats={fetchStats}
              currentUserId={user.id}
              onUpdateCurrentUser={onUpdateUser}
            />
          </TabsContent>

          <TabsContent value="studio2">
            <AdminStudio2 />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;