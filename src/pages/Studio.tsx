import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  language: string;
  premium: boolean;
  description: string;
}

const Studio = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("alena");
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [format, setFormat] = useState("mp3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const voices: Voice[] = [
    { id: "alena", name: "Алёна", gender: "female", language: "ru", premium: false, description: "Приятный женский голос" },
    { id: "filipp", name: "Филипп", gender: "male", language: "ru", premium: false, description: "Уверенный мужской голос" },
    { id: "ermil", name: "Ермил", gender: "male", language: "ru", premium: false, description: "Спокойный мужской голос" },
    { id: "jane", name: "Джейн", gender: "female", language: "ru", premium: false, description: "Энергичный женский голос" },
    { id: "omazh", name: "Омаж", gender: "female", language: "ru", premium: false, description: "Мягкий женский голос" },
    { id: "zahar", name: "Захар", gender: "male", language: "ru", premium: false, description: "Дружелюбный мужской голос" },
    { id: "dasha", name: "Даша", gender: "female", language: "ru", premium: true, description: "Профессиональный диктор" },
    { id: "julia", name: "Юлия", gender: "female", language: "ru", premium: true, description: "Элегантный женский голос" },
    { id: "lera", name: "Лера", gender: "female", language: "ru", premium: true, description: "Молодежный женский голос" },
    { id: "masha", name: "Маша", gender: "female", language: "ru", premium: true, description: "Теплый женский голос" },
    { id: "marina", name: "Марина", gender: "female", language: "ru", premium: true, description: "Бизнес-тон женский" },
    { id: "alexander", name: "Александр", gender: "male", language: "ru", premium: true, description: "Глубокий мужской голос" },
    { id: "kirill", name: "Кирилл", gender: "male", language: "ru", premium: true, description: "Харизматичный мужской" },
    { id: "anton", name: "Антон", gender: "male", language: "ru", premium: true, description: "Мужской голос-диктор" },
  ];

  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const maxCharacters = {
    free: 5000,
    basic: 50000,
    pro: 300000,
    unlimited: Infinity
  }[user.plan];

  const canGenerate = characterCount > 0 && characterCount <= maxCharacters;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Ошибка",
        description: `Превышен лимит символов для тарифа ${user.plan}`,
        variant: "destructive"
      });
      return;
    }

    const selectedVoiceData = voices.find(v => v.id === selectedVoice);
    if (selectedVoiceData?.premium && user.plan === 'free') {
      toast({
        title: "Премиум голос",
        description: "Этот голос доступен только на платных тарифах",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const response = await fetch('https://functions.poehali.dev/8d288713-243e-43b4-9efe-f5e77747a468', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed: speed[0],
          pitch: pitch[0],
          format,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok && data.audio_url) {
        setAudioUrl(data.audio_url);
        toast({
          title: "Готово!",
          description: "Аудио успешно создано"
        });
      } else {
        throw new Error(data.error || 'Ошибка генерации');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать аудио",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (downloadFormat: string) => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice_${Date.now()}.${downloadFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Скачивание",
      description: `Файл ${downloadFormat.toUpperCase()} загружается...`
    });
  };

  const planColors = {
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
            <Badge className={planColors[user.plan]}>
              {user.plan === 'free' ? 'Бесплатный' : user.plan === 'basic' ? 'Базовый' : user.plan === 'pro' ? 'Профи' : 'Безлимит'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="LayoutDashboard" size={18} className="mr-2" />
              Кабинет
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Текст для озвучки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Введите текст для озвучки..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] text-base"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Символов: {characterCount} / {maxCharacters === Infinity ? '∞' : maxCharacters}</span>
                  <span>Слов: {wordCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Mic2" size={20} />
                  Выбор голоса
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="male">Мужские</TabsTrigger>
                    <TabsTrigger value="female">Женские</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {voices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          disabled={voice.premium && user.plan === 'free'}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedVoice === voice.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${voice.premium && user.plan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Icon name={voice.gender === 'male' ? 'User' : 'UserCircle'} size={20} className="text-primary" />
                            {voice.premium && <Badge variant="outline" className="text-xs">PRO</Badge>}
                          </div>
                          <div className="font-semibold text-sm">{voice.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{voice.description}</div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="male" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {voices.filter(v => v.gender === 'male').map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          disabled={voice.premium && user.plan === 'free'}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedVoice === voice.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${voice.premium && user.plan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Icon name="User" size={20} className="text-primary" />
                            {voice.premium && <Badge variant="outline" className="text-xs">PRO</Badge>}
                          </div>
                          <div className="font-semibold text-sm">{voice.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{voice.description}</div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="female" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {voices.filter(v => v.gender === 'female').map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          disabled={voice.premium && user.plan === 'free'}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedVoice === voice.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${voice.premium && user.plan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Icon name="UserCircle" size={20} className="text-primary" />
                            {voice.premium && <Badge variant="outline" className="text-xs">PRO</Badge>}
                          </div>
                          <div className="font-semibold text-sm">{voice.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{voice.description}</div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {audioUrl && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Volume2" size={20} />
                    Результат
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <audio controls className="w-full" src={audioUrl}>
                    Ваш браузер не поддерживает аудио
                  </audio>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleDownload('mp3')}>
                      <Icon name="Download" size={16} className="mr-2" />
                      MP3
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload('wav')}>
                      <Icon name="Download" size={16} className="mr-2" />
                      WAV
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload('ogg')}>
                      <Icon name="Download" size={16} className="mr-2" />
                      OGG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings2" size={20} />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Скорость речи: {speed[0].toFixed(1)}x</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    disabled={user.plan === 'free'}
                  />
                  {user.plan === 'free' && (
                    <p className="text-xs text-muted-foreground">Доступно на платных тарифах</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Высота тона: {pitch[0].toFixed(1)}x</Label>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    disabled={user.plan === 'free'}
                  />
                  {user.plan === 'free' && (
                    <p className="text-xs text-muted-foreground">Доступно на платных тарифах</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Формат аудио</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav" disabled={user.plan === 'free'}>WAV {user.plan === 'free' && '(Pro)'}</SelectItem>
                      <SelectItem value="ogg" disabled={user.plan === 'free'}>OGG {user.plan === 'free' && '(Pro)'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Создаём...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={18} className="mr-2" />
                      Озвучить текст
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Crown" size={20} />
                  Ваш тариф
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-3 rounded-lg ${planColors[user.plan]}`}>
                  <div className="font-semibold">
                    {user.plan === 'free' ? 'Бесплатный' : user.plan === 'basic' ? 'Базовый' : user.plan === 'pro' ? 'Профи' : 'Безлимит'}
                  </div>
                  <div className="text-sm mt-1">
                    {maxCharacters === Infinity ? 'Без ограничений' : `${maxCharacters.toLocaleString()} символов/мес`}
                  </div>
                </div>
                {user.plan === 'free' && (
                  <Button variant="outline" className="w-full" onClick={() => onNavigate('dashboard')}>
                    <Icon name="ArrowUp" size={16} className="mr-2" />
                    Улучшить тариф
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;