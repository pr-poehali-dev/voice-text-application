import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

const PAYMENT_URL = "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8";

const Settings = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [speechkitKey, setSpeechkitKey] = useState("");
  const [translateKey, setTranslateKey] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [autoRenewLoading, setAutoRenewLoading] = useState(false);
  const [renewNowLoading, setRenewNowLoading] = useState(false);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const { toast } = useToast();

  const planNames: Record<string, string> = {
    free: 'Бесплатный',
    basic: 'Базовый',
    pro: 'Профи',
    unlimited: 'Безлимит'
  };

  const PAID_PLANS = ['basic', 'pro', 'unlimited'];

  const getDaysLeft = (expiresAt: string | null): number | null => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getDaysLeft(planExpiresAt);

  useEffect(() => {
    if (!PAID_PLANS.includes(user.plan)) return;
    fetch(`${PAYMENT_URL}?action=subscription`, {
      headers: { 'X-User-Id': String(user.id), 'X-User-Email': user.email }
    })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setAutoRenew(data.auto_renew);
          setPlanExpiresAt(data.plan_expires_at);
        }
      })
      .catch(() => {});
  }, [user.id]);

  const handleToggleAutoRenew = async (enabled: boolean) => {
    setAutoRenewLoading(true);
    try {
      const resp = await fetch(`${PAYMENT_URL}?action=set_auto_renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(user.id), 'X-User-Email': user.email },
        body: JSON.stringify({ enabled })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setAutoRenew(enabled);
      toast({ title: enabled ? 'Автопродление включено' : 'Автопродление отключено' });
    } catch (e) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Не удалось изменить настройку', variant: 'destructive' });
    } finally {
      setAutoRenewLoading(false);
    }
  };

  const handleRenewNow = async () => {
    setRenewNowLoading(true);
    try {
      const resp = await fetch(`${PAYMENT_URL}?action=renew_now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(user.id), 'X-User-Email': user.email }
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setPlanExpiresAt(data.plan_expires_at);
      toast({
        title: 'Тариф продлён',
        description: `Списано ${data.amount_charged}₽. Баланс: ${data.new_balance}₽`
      });
    } catch (e) {
      toast({ title: 'Ошибка продления', description: e instanceof Error ? e.message : 'Недостаточно средств', variant: 'destructive' });
    } finally {
      setRenewNowLoading(false);
    }
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите файл изображения",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5 МБ",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;

          const response = await fetch('https://functions.poehali.dev/e3b68528-1cc7-40ad-ba15-d09bbb44f10d', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              image: base64Image
            })
          });

          const data = await response.json();

          if (response.ok && data.avatar_url) {
            setAvatarUrl(data.avatar_url);
            const updatedUser = { ...user, avatarUrl: data.avatar_url };
            localStorage.setItem('voiceAppUser', JSON.stringify(updatedUser));
            
            toast({
              title: "Успешно",
              description: "Аватар обновлен",
            });
          } else {
            throw new Error(data.error || 'Ошибка загрузки');
          }
        } catch (err) {
          toast({
            title: "Ошибка",
            description: err instanceof Error ? err.message : "Не удалось загрузить аватар",
            variant: "destructive",
          });
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Ошибка",
          description: "Не удалось прочитать файл",
          variant: "destructive",
        });
        setIsUploadingAvatar(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить аватар",
        variant: "destructive",
      });
      setIsUploadingAvatar(false);
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
                <div className="space-y-4">
                  <Label>Аватар</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="User" size={48} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploadingAvatar}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          <>
                            <Icon name="Upload" size={16} className="mr-2" />
                            Загрузить фото
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

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
                  Текущий план: <strong>{planNames[user.plan] || user.plan}</strong>
                  {planExpiresAt && (
                    <span className="ml-2 text-muted-foreground">
                      · до {new Date(planExpiresAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => onNavigate('pricing')} className="w-full">
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Изменить тариф
                </Button>

                {PAID_PLANS.includes(user.plan) && (
                  <div className="border rounded-lg p-4 space-y-4">

                    {/* Счётчик дней */}
                    {planExpiresAt && daysLeft !== null && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Осталось дней</span>
                          <span className={`font-semibold ${daysLeft <= 3 ? 'text-destructive' : daysLeft <= 7 ? 'text-orange-500' : 'text-foreground'}`}>
                            {daysLeft === 0 ? 'Истекает сегодня' : `${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${daysLeft <= 3 ? 'bg-destructive' : daysLeft <= 7 ? 'bg-orange-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          до {new Date(planExpiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}

                    {/* Переключатель автопродления */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Автопродление с кошелька</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Тариф продлится автоматически в день окончания
                        </p>
                      </div>
                      <Switch
                        checked={autoRenew}
                        onCheckedChange={handleToggleAutoRenew}
                        disabled={autoRenewLoading}
                      />
                    </div>

                    {/* Продлить вручную */}
                    <div className="border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleRenewNow}
                        disabled={renewNowLoading}
                      >
                        {renewNowLoading ? (
                          <>
                            <Icon name="Loader2" size={15} className="mr-2 animate-spin" />
                            Списание...
                          </>
                        ) : (
                          <>
                            <Icon name="RefreshCw" size={15} className="mr-2" />
                            Продлить прямо сейчас
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Средства спишутся с кошелька, счётчик символов сбросится
                      </p>
                    </div>
                  </div>
                )}
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
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;