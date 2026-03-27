import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

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

interface AdminStatsCardsProps {
  stats: AdminStats | null;
  users: AdminUser[];
}

const AdminStatsCards = ({ stats, users }: AdminStatsCardsProps) => {
  const totalUsers = stats?.total_users || users.length;
  const activeUsers = stats?.active_users || users.filter(u => u.role !== 'blocked').length;
  const totalGenerations = stats?.total_generations || users.reduce((sum, u) => sum + u.total_generations, 0);
  const generationsToday = stats?.generations_today || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Всего пользователей</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Активных</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Activity" size={24} className="text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Озвучек за сутки</p>
              <p className="text-2xl font-bold">{generationsToday.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Volume2" size={24} className="text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Всего озвучек</p>
              <p className="text-2xl font-bold">{totalGenerations.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;
