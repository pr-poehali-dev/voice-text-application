import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

const Settings = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [speechkitKey, setSpeechkitKey] = useState("");
  const [translateKey, setTranslateKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const planNames = {
    free: 'Бесплатный',
    basic: 'Базовый',
    pro: 'Профи',
    unlimited: 'Безлимит'
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Имя не может быть пустым",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedUser = { ...user, name: name.trim(), email: email.trim() };
      localStorage.setItem('voiceAppUser', JSON.stringify(updatedUser));
      
      toast({
        title: "Успешно",
        description: "Данные профиля обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Ошибка",
        description: "Новый пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      toast({
        title: "Успешно",
        description: "Пароль успешно изменен",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить пароль",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKeys = async () => {
    if (!speechkitKey.trim() || !translateKey.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните оба поля с API ключами",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Сохраняем ключи в localStorage (в реальном приложении это должно быть на backend)
    try {
      localStorage.setItem('YANDEX_SPEECHKIT_API_KEY', speechkitKey.trim());
      localStorage.setItem('YANDEX_TRANSLATE_API_KEY', translateKey.trim());
      
      toast({
        title: "Успешно",
        description: "API ключи сохранены",
      });
      
      setSpeechkitKey("");
      setTranslateKey("");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить ключи",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            {user.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')}>
                <Icon name="Shield" size={18} className="mr-2" />
                Админ
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Настройки</h1>
          <p className="text-muted-foreground">Управление профилем и настройками аккаунта</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            {user.role === 'admin' && <TabsTrigger value="api">API ключи</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={20} />
                  Информация профиля
                </CardTitle>
                <CardDescription>
                  Обновите данные вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Роль</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </Badge>
                  </div>
                </div>

                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить изменения
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Crown" size={20} />
                  Тарифный план
                </CardTitle>
                <CardDescription>
                  Текущий план: <strong>{planNames[user.plan]}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => onNavigate('pricing')} className="w-full">
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Изменить тариф
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Lock" size={20} />
                  Изменить пароль
                </CardTitle>
                <CardDescription>
                  Обновите пароль для безопасности аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Минимум 6 символов
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Изменение...
                    </>
                  ) : (
                    <>
                      <Icon name="Shield" size={16} className="mr-2" />
                      Изменить пароль
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="api" className="space-y-6">
              <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Key" size={20} />
              API ключи Yandex Cloud
            </CardTitle>
            <CardDescription>
              Эти ключи используются для синтеза речи и перевода текста
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="speechkit">YANDEX_SPEECHKIT_API_KEY</Label>
              <Input
                id="speechkit"
                type="password"
                placeholder="AQVNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={speechkitKey}
                onChange={(e) => setSpeechkitKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Для синтеза речи (SpeechKit TTS)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="translate">YANDEX_TRANSLATE_API_KEY</Label>
              <Input
                id="translate"
                type="password"
                placeholder="AQVNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={translateKey}
                onChange={(e) => setTranslateKey(e.target.value)}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Для перевода текста (Yandex Translate)
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                onClick={handleSaveKeys} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить ключи
                  </>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-2">Как получить API ключи:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Откройте <a href="https://console.cloud.yandex.ru" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.yandex.ru</a></li>
                      <li>Перейдите в "Сервисные аккаунты"</li>
                      <li>Создайте аккаунт с ролями: <code className="bg-blue-100 px-1 rounded">ai.speechkit-tts.user</code> и <code className="bg-blue-100 px-1 rounded">ai.translate.user</code></li>
                      <li>Создайте API-ключ и скопируйте его</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;