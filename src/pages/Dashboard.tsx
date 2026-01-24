import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

interface UserStats {
  total_generations: number;
  total_characters: number;
  total_projects: number;
  total_audio_duration: number;
}

interface Project {
  id: number;
  title: string;
  text: string;
  audio_url: string;
  voice: string;
  speed: number;
  format: string;
  character_count: number;
  audio_duration: number;
  created_at: string;
}

const Dashboard = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [stats, setStats] = useState<UserStats>({
    total_generations: 0,
    total_characters: 0,
    total_projects: 0,
    total_audio_duration: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/e0dc4626-43ba-410e-b95b-f6d0859c3bdb?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Сегодня, ${date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `Вчера, ${date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru', { day: 'numeric', month: 'long' });
    }
  };

  const handleDownload = (audioUrl: string, projectName: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${projectName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsData = [
    { title: "Озвучек создано", value: stats.total_generations.toString(), icon: "Volume2", color: "text-blue-600" },
    { title: "Символов использовано", value: stats.total_characters.toLocaleString('ru'), icon: "FileText", color: "text-purple-600" },
    { title: "Проектов", value: stats.total_projects.toString(), icon: "FolderOpen", color: "text-green-600" },
    { title: "Часов аудио", value: (stats.total_audio_duration / 3600).toFixed(1), icon: "Clock", color: "text-orange-600" },
  ];

  const planDetails = {
    free: { name: "Бесплатный", limit: 5000, color: "bg-gray-100 text-gray-700" },
    basic: { name: "Базовый", limit: 50000, color: "bg-blue-100 text-blue-700" },
    pro: { name: "Профи", limit: 300000, color: "bg-purple-100 text-purple-700" },
    unlimited: { name: "Безлимит", limit: Infinity, color: "bg-yellow-100 text-yellow-700" }
  };

  const currentPlan = planDetails[user.plan];
  const usedCharacters = stats.total_characters;
  const usagePercentage = currentPlan.limit === Infinity ? 0 : (usedCharacters / currentPlan.limit) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Volume2" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VoiceAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('studio')}>
              <Icon name="Mic2" size={18} className="mr-2" />
              Студия
            </Button>
            {user.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')}>
                <Icon name="Settings" size={18} className="mr-2" />
                Админка
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground">Привет, {user.name}! Вот статистика вашего аккаунта</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                  <Icon name={stat.icon} size={20} className={stat.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="History" size={20} />
                Последние проекты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="FileX" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Пока нет проектов</p>
                    <Button variant="link" onClick={() => onNavigate('studio')} className="mt-2">
                      Создать первую озвучку
                    </Button>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="Play" size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">Голос: {project.voice} • {formatDuration(project.audio_duration)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(project.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(project.audio_url, project.title)}>
                          <Icon name="Download" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Crown" size={20} />
                  Ваш тариф
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${currentPlan.color}`}>
                  <div className="font-semibold text-lg">{currentPlan.name}</div>
                  <div className="text-sm mt-1">
                    {currentPlan.limit === Infinity ? 'Без ограничений' : `${currentPlan.limit.toLocaleString()} символов/мес`}
                  </div>
                </div>

                {currentPlan.limit !== Infinity && (
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Использовано</span>
                      <span className="font-semibold">{usedCharacters.toLocaleString()} / {currentPlan.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                )}

                {user.plan !== 'unlimited' && (
                  <Button className="w-full" onClick={() => onNavigate('pricing')}>
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    Улучшить тариф
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Zap" size={20} />
                  Быстрые действия
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('studio')}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Новая озвучка
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Download" size={18} className="mr-2" />
                  Скачать все проекты
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('settings')}>
                  <Icon name="Settings" size={18} className="mr-2" />
                  Настройки аккаунта
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;