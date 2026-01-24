import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Profile = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
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
          <div className="w-24"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Настройки профиля</h1>
          <p className="text-muted-foreground">Управление данными аккаунта и настройками</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  ИИ
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg mb-1">Иван Иванов</h3>
              <p className="text-sm text-muted-foreground mb-3">ivan@company.com</p>
              <Badge className="mb-4">
                <Icon name="Crown" size={14} className="mr-1" />
                Профессиональный
              </Badge>
              <Button variant="outline" className="w-full">
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить фото
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>Обновите данные вашего профиля</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input id="firstName" defaultValue="Иван" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input id="lastName" defaultValue="Иванов" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="ivan@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input id="phone" type="tel" defaultValue="+7 (999) 123-45-67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <Input id="company" defaultValue="ООО «Технологии»" />
                </div>
                <Button className="w-full md:w-auto">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>Управление паролем и безопасностью аккаунта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button variant="secondary">
                  <Icon name="Lock" size={16} className="mr-2" />
                  Изменить пароль
                </Button>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Двухфакторная аутентификация</p>
                      <p className="text-sm text-muted-foreground">Дополнительная защита аккаунта</p>
                    </div>
                    <Button variant="outline">Настроить</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Активные сеансы</p>
                      <p className="text-sm text-muted-foreground">3 устройства подключены</p>
                    </div>
                    <Button variant="outline">Управление</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Подписка</CardTitle>
                <CardDescription>Управление тарифным планом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-lg">Профессиональный</p>
                      <p className="text-sm text-muted-foreground">₽2,990 / месяц</p>
                      <p className="text-xs text-muted-foreground mt-1">Следующее списание: 15 февраля 2026</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Активна
                    </Badge>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => onNavigate('subscription')} className="flex-1">
                      <Icon name="Sparkles" size={16} className="mr-2" />
                      Улучшить план
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Icon name="CreditCard" size={16} className="mr-2" />
                      Способ оплаты
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
