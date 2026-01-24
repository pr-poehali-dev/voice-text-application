import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const stats = [
    { title: "Активные проекты", value: "12", change: "+2", icon: "Briefcase", trend: "up" },
    { title: "Пользователи", value: "1,234", change: "+18%", icon: "Users", trend: "up" },
    { title: "Доход за месяц", value: "₽145,000", change: "+12%", icon: "TrendingUp", trend: "up" },
    { title: "Хранилище", value: "67%", change: "8.1 GB", icon: "Database", trend: "neutral" },
  ];

  const recentActivity = [
    { action: "Новый пользователь зарегистрирован", time: "2 мин назад", type: "user" },
    { action: "Подписка продлена", time: "15 мин назад", type: "payment" },
    { action: "Проект создан", time: "1 час назад", type: "project" },
    { action: "Отчёт сформирован", time: "2 часа назад", type: "report" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SaaS Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Icon name="Bell" size={18} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('profile')} className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Icon name="User" size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Панель управления</h1>
          <p className="text-muted-foreground">Обзор ключевых показателей вашего бизнеса</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={stat.icon} size={20} className="text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="flex items-center gap-1">
                  {stat.trend === "up" && <Icon name="TrendingUp" size={14} className="text-green-600" />}
                  <span className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
                    {stat.change} от прошлого месяца
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={20} />
                Последняя активность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon 
                        name={activity.type === "user" ? "UserPlus" : activity.type === "payment" ? "CreditCard" : activity.type === "project" ? "FolderPlus" : "FileText"} 
                        size={18} 
                        className="text-primary" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Target" size={20} />
                Быстрые действия
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate('subscription')}>
                <Icon name="Crown" size={18} className="mr-2" />
                Управление подпиской
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => onNavigate('admin')}>
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки системы
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Icon name="Download" size={18} className="mr-2" />
                Скачать отчёт
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Icon name="BarChart3" size={18} className="mr-2" />
                Аналитика
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Package" size={20} />
              Использование ресурсов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">API запросы</span>
                  <span className="text-sm text-muted-foreground">7,500 / 10,000</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Хранилище</span>
                  <span className="text-sm text-muted-foreground">8.1 GB / 12 GB</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Пропускная способность</span>
                  <span className="text-sm text-muted-foreground">234 GB / 500 GB</span>
                </div>
                <Progress value={47} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
