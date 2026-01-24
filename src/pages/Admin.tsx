import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const users = [
    { id: 1, name: "Иван Иванов", email: "ivan@company.com", plan: "Профессиональный", status: "active", joined: "15.01.2025" },
    { id: 2, name: "Мария Петрова", email: "maria@startup.com", plan: "Стартовый", status: "active", joined: "10.01.2025" },
    { id: 3, name: "Алексей Сидоров", email: "alex@corp.com", plan: "Корпоративный", status: "active", joined: "05.01.2025" },
    { id: 4, name: "Елена Кузнецова", email: "elena@business.com", plan: "Профессиональный", status: "trial", joined: "20.01.2025" },
    { id: 5, name: "Дмитрий Смирнов", email: "dmitry@tech.com", plan: "Стартовый", status: "paused", joined: "01.01.2025" },
  ];

  const systemStats = [
    { label: "Всего пользователей", value: "1,234", icon: "Users", color: "text-blue-600" },
    { label: "Активные подписки", value: "987", icon: "CheckCircle2", color: "text-green-600" },
    { label: "Доход за месяц", value: "₽2.4M", icon: "DollarSign", color: "text-purple-600" },
    { label: "Среднее использование", value: "67%", icon: "Activity", color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-sidebar-foreground hover:bg-sidebar-accent">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SaaS Platform</span>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Icon name="Shield" size={14} className="mr-1" />
            Администратор
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Управление пользователями и системой</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${stat.color}/10 flex items-center justify-center`}>
                    <Icon name={stat.icon} size={24} className={stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Просмотр и управление всеми пользователями платформы</CardDescription>
              </div>
              <Button>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить пользователя
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Поиск по имени или email..." className="pl-10" />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>План</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "active" ? "default" : user.status === "trial" ? "secondary" : "outline"}
                          className={
                            user.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : user.status === "trial"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {user.status === "active" ? "Активен" : user.status === "trial" ? "Тестовый" : "Приостановлен"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Системные настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Database" size={18} className="mr-2" />
                Управление базой данных
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Mail" size={18} className="mr-2" />
                Настройки email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Bell" size={18} className="mr-2" />
                Уведомления
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Key" size={18} className="mr-2" />
                API ключи
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Отчёты и логи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт данных
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="BarChart3" size={18} className="mr-2" />
                Аналитика использования
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="AlertCircle" size={18} className="mr-2" />
                Системные логи
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Activity" size={18} className="mr-2" />
                Мониторинг производительности
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
