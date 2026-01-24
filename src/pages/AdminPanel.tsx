import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Icon from "@/components/ui/icon";
import type { User } from "./Index";

const AdminPanel = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const systemStats = [
    { label: "Всего пользователей", value: "1,234", icon: "Users", color: "text-blue-600" },
    { label: "Активных сегодня", value: "487", icon: "Activity", color: "text-green-600" },
    { label: "Озвучек за сутки", value: "2,156", icon: "Volume2", color: "text-purple-600" },
    { label: "Доход за месяц", value: "₽487,500", icon: "DollarSign", color: "text-orange-600" },
  ];

  const users = [
    { id: 1, name: "Иван Петров", email: "ivan@mail.ru", plan: "pro", status: "active", registered: "15.01.2025", usage: 45000 },
    { id: 2, name: "Мария Сидорова", email: "maria@gmail.com", plan: "basic", status: "active", registered: "12.01.2025", usage: 12000 },
    { id: 3, name: "Алексей Смирнов", email: "alex@yandex.ru", plan: "unlimited", status: "active", registered: "08.01.2025", usage: 350000 },
    { id: 4, name: "Елена Кузнецова", email: "elena@mail.ru", plan: "free", status: "active", registered: "20.01.2025", usage: 3200 },
    { id: 5, name: "Дмитрий Волков", email: "dmitry@gmail.com", plan: "pro", status: "paused", registered: "05.01.2025", usage: 89000 },
  ];

  const planBadgeColors = {
    free: "bg-gray-100 text-gray-700",
    basic: "bg-blue-100 text-blue-700",
    pro: "bg-purple-100 text-purple-700",
    unlimited: "bg-yellow-100 text-yellow-700"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
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
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                Управление пользователями
              </CardTitle>
              <Button>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить пользователя
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Тариф</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Использование</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={planBadgeColors[u.plan as keyof typeof planBadgeColors]}>
                          {u.plan === 'free' ? 'Бесплатный' : u.plan === 'basic' ? 'Базовый' : u.plan === 'pro' ? 'Профи' : 'Безлимит'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.status === "active" ? "default" : "outline"}
                          className={u.status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}
                        >
                          {u.status === "active" ? "Активен" : "Приостановлен"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{u.usage.toLocaleString()} символов</span>
                      </TableCell>
                      <TableCell>{u.registered}</TableCell>
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
                <Icon name="Mic2" size={18} className="mr-2" />
                Настройка голосов
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icon name="CreditCard" size={18} className="mr-2" />
                Управление тарифами
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
                <Icon name="BarChart3" size={20} />
                Быстрая статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Конверсия free → paid</span>
                <span className="text-lg font-bold text-primary">24%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Средний чек</span>
                <span className="text-lg font-bold text-primary">₽1,840</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Отток пользователей</span>
                <span className="text-lg font-bold text-primary">3.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
