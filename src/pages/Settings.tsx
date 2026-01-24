import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

const Settings = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [speechkitKey, setSpeechkitKey] = useState("");
  const [translateKey, setTranslateKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Настройки API</h1>
          <p className="text-muted-foreground">Добавьте свои API ключи Яндекс для работы сервиса</p>
        </div>

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
      </div>
    </div>
  );
};

export default Settings;
