import { useState, useRef } from "react";
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
import WalletWidget from "@/components/WalletWidget";
import NotificationBell from "@/components/NotificationBell";
import type { User, DemoUsage } from "./Index";

const TRANSLATE_URL = 'https://functions.poehali.dev/21cfebb4-0617-4d35-bb9a-b99cd72e3912';
const DETECT_URL = 'https://functions.poehali.dev/cb5de8a5-e4ad-442d-b628-4eb0278f2abc';

interface DemoProps {
  demoUsage: DemoUsage;
  demoLimit: number;
  onDemoAction: (feature: keyof DemoUsage) => boolean;
}

interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  language: string;
  languageName: string;
  premium: boolean;
  description: string;
}

const LANGUAGES = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "kk", name: "Қазақша", flag: "🇰🇿" },
];

const VOICES: Voice[] = [
    { id: "alena", name: "Алёна", gender: "female", language: "ru", languageName: "Русский", premium: false, description: "Приятный женский голос" },
    { id: "filipp", name: "Филипп", gender: "male", language: "ru", languageName: "Русский", premium: false, description: "Уверенный мужской голос" },
    { id: "ermil", name: "Ермил", gender: "male", language: "ru", languageName: "Русский", premium: false, description: "Спокойный мужской голос" },
    { id: "jane", name: "Джейн", gender: "female", language: "ru", languageName: "Русский", premium: false, description: "Энергичный женский голос" },
    { id: "omazh", name: "Омаж", gender: "female", language: "ru", languageName: "Русский", premium: false, description: "Мягкий женский голос" },
    { id: "zahar", name: "Захар", gender: "male", language: "ru", languageName: "Русский", premium: false, description: "Дружелюбный мужской голос" },
    { id: "marina", name: "Марина", gender: "female", language: "ru", languageName: "Русский", premium: false, description: "Теплый женский голос" },
    { id: "alexander", name: "Александр", gender: "male", language: "ru", languageName: "Русский", premium: false, description: "Глубокий мужской голос" },
    { id: "alena_premium", name: "Алёна Premium", gender: "female", language: "ru", languageName: "Русский", premium: false, description: "Нейронный женский голос" },
    { id: "filipp_premium", name: "Филипп Premium", gender: "male", language: "ru", languageName: "Русский", premium: false, description: "Нейронный мужской голос" },
    
    { id: "john", name: "John", gender: "male", language: "en", languageName: "English", premium: false, description: "Clear American voice" },
    { id: "jane-en", name: "Jane", gender: "female", language: "en", languageName: "English", premium: false, description: "Professional female voice" },
    { id: "madirus", name: "Madirus", gender: "male", language: "en", languageName: "English", premium: false, description: "Deep male voice" },
    { id: "emma", name: "Emma", gender: "female", language: "en", languageName: "English", premium: false, description: "British female voice" },
    { id: "oliver", name: "Oliver", gender: "male", language: "en", languageName: "English", premium: false, description: "British male voice" },
    
    { id: "lea", name: "Lea", gender: "female", language: "de", languageName: "Deutsch", premium: false, description: "Freundliche deutsche Stimme" },
    { id: "bruno", name: "Bruno", gender: "male", language: "de", languageName: "Deutsch", premium: false, description: "Klare männliche Stimme" },
    { id: "hannah", name: "Hannah", gender: "female", language: "de", languageName: "Deutsch", premium: false, description: "Warme weibliche Stimme" },
    { id: "felix", name: "Felix", gender: "male", language: "de", languageName: "Deutsch", premium: false, description: "Energische männliche Stimme" },
    
    { id: "maria", name: "María", gender: "female", language: "es", languageName: "Español", premium: false, description: "Voz femenina española" },
    { id: "carlos", name: "Carlos", gender: "male", language: "es", languageName: "Español", premium: false, description: "Voz masculina española" },
    { id: "lucia", name: "Lucía", gender: "female", language: "es", languageName: "Español", premium: false, description: "Voz latina femenina" },
    { id: "diego", name: "Diego", gender: "male", language: "es", languageName: "Español", premium: false, description: "Voz latina masculina" },
    
    { id: "amelie", name: "Amélie", gender: "female", language: "fr", languageName: "Français", premium: false, description: "Voix féminine française" },
    { id: "pierre", name: "Pierre", gender: "male", language: "fr", languageName: "Français", premium: false, description: "Voix masculine française" },
    { id: "camille", name: "Camille", gender: "female", language: "fr", languageName: "Français", premium: false, description: "Voix douce féminine" },
    { id: "louis", name: "Louis", gender: "male", language: "fr", languageName: "Français", premium: false, description: "Voix élégante masculine" },
    
    { id: "sofia", name: "Sofia", gender: "female", language: "it", languageName: "Italiano", premium: false, description: "Voce femminile italiana" },
    { id: "marco", name: "Marco", gender: "male", language: "it", languageName: "Italiano", premium: false, description: "Voce maschile italiana" },
    { id: "giulia", name: "Giulia", gender: "female", language: "it", languageName: "Italiano", premium: false, description: "Voce melodiosa femminile" },
    { id: "lorenzo", name: "Lorenzo", gender: "male", language: "it", languageName: "Italiano", premium: false, description: "Voce profonda maschile" },
    
    { id: "ana", name: "Ana", gender: "female", language: "pt", languageName: "Português", premium: false, description: "Voz feminina portuguesa" },
    { id: "joao", name: "João", gender: "male", language: "pt", languageName: "Português", premium: false, description: "Voz masculina portuguesa" },
    { id: "beatriz", name: "Beatriz", gender: "female", language: "pt", languageName: "Português", premium: false, description: "Voz brasileira feminina" },
    { id: "ricardo", name: "Ricardo", gender: "male", language: "pt", languageName: "Português", premium: false, description: "Voz brasileira masculina" },
    
    { id: "li", name: "Li", gender: "female", language: "zh", languageName: "中文", premium: false, description: "中文女声" },
    { id: "wang", name: "Wang", gender: "male", language: "zh", languageName: "中文", premium: false, description: "中文男声" },
    { id: "mei", name: "Mei", gender: "female", language: "zh", languageName: "中文", premium: false, description: "温柔女声" },
    { id: "chen", name: "Chen", gender: "male", language: "zh", languageName: "中文", premium: false, description: "沉稳男声" },
    
    { id: "yuki", name: "Yuki", gender: "female", language: "ja", languageName: "日本語", premium: false, description: "日本語女性音声" },
    { id: "takeshi", name: "Takeshi", gender: "male", language: "ja", languageName: "日本語", premium: false, description: "日本語男性音声" },
    { id: "sakura", name: "Sakura", gender: "female", language: "ja", languageName: "日本語", premium: false, description: "優しい女性音声" },
    { id: "kenji", name: "Kenji", gender: "male", language: "ja", languageName: "日本語", premium: false, description: "力強い男性音声" },
    
    { id: "minjee", name: "Minjee", gender: "female", language: "ko", languageName: "한국어", premium: false, description: "한국어 여성 음성" },
    { id: "jihoon", name: "Jihoon", gender: "male", language: "ko", languageName: "한국어", premium: false, description: "한국어 남성 음성" },
    { id: "soyeon", name: "Soyeon", gender: "female", language: "ko", languageName: "한국어", premium: false, description: "부드러운 여성 음성" },
    { id: "minho", name: "Minho", gender: "male", language: "ko", languageName: "한국어", premium: false, description: "깊은 남성 음성" },
    
    { id: "fatima", name: "Fatima", gender: "female", language: "ar", languageName: "العربية", premium: false, description: "صوت أنثوي عربي" },
    { id: "omar", name: "Omar", gender: "male", language: "ar", languageName: "العربية", premium: false, description: "صوت ذكوري عربي" },
    { id: "layla", name: "Layla", gender: "female", language: "ar", languageName: "العربية", premium: false, description: "صوت نسائي ناعم" },
    { id: "hassan", name: "Hassan", gender: "male", language: "ar", languageName: "العربية", premium: false, description: "صوت رجولي قوي" },
    
    { id: "priya", name: "Priya", gender: "female", language: "hi", languageName: "हिन्दी", premium: false, description: "हिंदी महिला आवाज" },
    { id: "arjun", name: "Arjun", gender: "male", language: "hi", languageName: "हिन्दी", premium: false, description: "हिंदी पुरुष आवाज" },
    { id: "anjali", name: "Anjali", gender: "female", language: "hi", languageName: "हिन्दी", premium: false, description: "मधुर महिला आवाज" },
    { id: "raj", name: "Raj", gender: "male", language: "hi", languageName: "हिन्दी", premium: false, description: "गहरी पुरुष आवाज" },
    
    { id: "aylin", name: "Aylin", gender: "female", language: "tr", languageName: "Türkçe", premium: false, description: "Türk kadın sesi" },
    { id: "mehmet", name: "Mehmet", gender: "male", language: "tr", languageName: "Türkçe", premium: false, description: "Türk erkek sesi" },
    { id: "zeynep", name: "Zeynep", gender: "female", language: "tr", languageName: "Türkçe", premium: false, description: "Yumuşak kadın sesi" },
    { id: "emre", name: "Emre", gender: "male", language: "tr", languageName: "Türkçe", premium: false, description: "Güçlü erkek sesi" },
    
    { id: "anna", name: "Anna", gender: "female", language: "pl", languageName: "Polski", premium: false, description: "Polski głos kobiecy" },
    { id: "jan", name: "Jan", gender: "male", language: "pl", languageName: "Polski", premium: false, description: "Polski głos męski" },
    { id: "zofia", name: "Zofia", gender: "female", language: "pl", languageName: "Polski", premium: false, description: "Ciepły głos kobiecy" },
    { id: "piotr", name: "Piotr", gender: "male", language: "pl", languageName: "Polski", premium: false, description: "Silny głos męski" },
    
    { id: "ainur", name: "Айнұр", gender: "female", language: "kk", languageName: "Қазақша", premium: false, description: "Қазақ әйел дауысы" },
    { id: "madi", name: "Мәди", gender: "male", language: "kk", languageName: "Қазақша", premium: false, description: "Қазақ ер дауысы" },
    { id: "aigerim", name: "Айгерім", gender: "female", language: "kk", languageName: "Қазақша", premium: false, description: "Жұмсақ әйел дауысы" },
  { id: "arman", name: "Арман", gender: "male", language: "kk", languageName: "Қазақша", premium: false, description: "Күшті ер дауысы" },
];

const Studio = ({ user, onNavigate, onLogout, demoProps }: { user: User; onNavigate: (page: string) => void; onLogout: () => void; demoProps?: DemoProps }) => {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [selectedVoice, setSelectedVoice] = useState<string>("alena");
  const [speed, setSpeed] = useState([1.0]);
  const [format, setFormat] = useState("mp3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTechnicalMode, setIsTechnicalMode] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredVoices = VOICES.filter(v => v.language === selectedLanguage);
  
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const maxCharacters = (user.role === 'admin' || user.plan === 'unlimited')
    ? 8000
    : { free: 5000, basic: 50000, pro: 300000, unlimited: 8000 }[user.plan] ?? 5000;

  const canGenerate = characterCount > 0 && characterCount <= maxCharacters;

  const detectLanguageNow = async (currentText: string) => {
    if (!currentText.trim()) return;
    setIsDetecting(true);
    try {
      const response = await fetch(DETECT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText })
      });
      const data = await response.json();
      if (response.ok && data.language) {
        const detectedLang = data.language;
        if (LANGUAGES.find(l => l.code === detectedLang)) {
          setSelectedLanguage(detectedLang);
          const voicesForLang = VOICES.filter(v => v.language === detectedLang && !v.premium);
          if (voicesForLang.length > 0) setSelectedVoice(voicesForLang[0].id);
          const langName = LANGUAGES.find(l => l.code === detectedLang)?.name || detectedLang;
          toast({ title: "Язык определён", description: `Обнаружен ${langName}` });
        }
      }
    } catch {
      // silent
    } finally {
      setIsDetecting(false);
    }
  };

  const handleDetectLanguage = () => {
    detectLanguageNow(text);
  };

  const handleTranslate = async (targetLang: string) => {
    if (!text.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите текст для перевода",
        variant: "destructive"
      });
      return;
    }

    if (demoProps && !demoProps.onDemoAction('translate')) return;

    setIsTranslating(true);

    try {
      const response = await fetch(TRANSLATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: targetLang,
          sourceLanguage: 'auto',
          technical: isTechnicalMode
        })
      });

      const data = await response.json();

      if (response.ok && data.translated_text) {
        setText(data.translated_text);
        setSelectedLanguage(targetLang);
        
        const voicesForLang = VOICES.filter(v => v.language === targetLang && !v.premium);
        if (voicesForLang.length > 0) {
          setSelectedVoice(voicesForLang[0].id);
        }
        
        toast({
          title: "Перевод готов!",
          description: `Текст переведён на ${LANGUAGES.find(l => l.code === targetLang)?.name}${data.translation_type === 'technical' ? ' (технический режим)' : ''}`
        });
      } else {
        throw new Error(data.error || 'Ошибка перевода');
      }
    } catch (error) {
      const msg = error instanceof Error && error.message !== 'Failed to fetch'
        ? error.message
        : "Не удалось подключиться к серверу перевода. Попробуйте ещё раз.";
      toast({ title: "Ошибка перевода", description: msg, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Ошибка",
        description: `Превышен лимит символов для тарифа ${user.plan}`,
        variant: "destructive"
      });
      return;
    }

    if (demoProps && !demoProps.onDemoAction('generate')) return;

    const selectedVoiceData = VOICES.find(v => v.id === selectedVoice);
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
          format,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok && data.audio_url) {
        setAudioUrl(data.audio_url);
        
        // Проверяем был ли сброс лимита
        if (data.limit_reset) {
          localStorage.setItem('limitResetNotification', 'true');
        }
        
        toast({
          title: "Готово!",
          description: "Аудио успешно создано и сохранено в ваших проектах"
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
    if (demoProps && !demoProps.onDemoAction('download')) return;
    
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
            {!user.isDemo && <WalletWidget user={user} />}
            {!user.isDemo && <NotificationBell user={user} />}
            {!user.isDemo && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
                <Icon name="LayoutDashboard" size={18} className="mr-2" />
                Кабинет
              </Button>
            )}
            {user.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={() => onNavigate('admin')}>
                <Icon name="Shield" size={18} className="mr-2" />
                Админка
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      {demoProps && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Icon name="Zap" size={18} className="text-amber-600 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-800">
                Демо-режим — тариф «Безлимит»:&nbsp;
                <span className="font-bold">
                  {demoProps.demoLimit - demoProps.demoUsage.generate} озвучек,&nbsp;
                  {demoProps.demoLimit - demoProps.demoUsage.translate} переводов,&nbsp;
                  {demoProps.demoLimit - demoProps.demoUsage.download} скачиваний
                </span>
                &nbsp;осталось
              </span>
            </div>
            <Button size="sm" onClick={() => onNavigate('auth')} className="h-8 px-4 text-sm flex-shrink-0">
              <Icon name="UserPlus" size={14} className="mr-1" />
              Купить и зарегистрироваться
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileText" size={20} />
                    Текст для озвучки
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Язык:</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Введите текст для озвучки..."
                  value={text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setText(val);
                    if (val.trim().length > 10) {
                      if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
                      detectTimerRef.current = setTimeout(() => detectLanguageNow(val), 1000);
                    }
                  }}
                  className="min-h-[200px] text-base"
                />
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span>Символов: {characterCount} / {maxCharacters === Infinity ? '∞' : maxCharacters}</span>
                    <span className="ml-4">Слов: {wordCount}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDetectLanguage}
                      disabled={isDetecting || !text.trim()}
                    >
                      {isDetecting ? (
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      ) : (
                        <Icon name="Languages" size={16} className="mr-2" />
                      )}
                      Определить язык
                    </Button>
                    <Button
                      variant={isTechnicalMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (user.plan !== 'unlimited') {
                          toast({
                            title: "Технический перевод",
                            description: "Эта функция доступна только на тарифе Безлимит",
                            variant: "destructive"
                          });
                          return;
                        }
                        setIsTechnicalMode(!isTechnicalMode);
                      }}
                      title="Технический перевод с сохранением терминологии охраны труда (только тариф Безлимит)"
                      disabled={user.plan !== 'unlimited' && !isTechnicalMode}
                    >
                      <Icon name="HardHat" size={16} className="mr-2" />
                      {isTechnicalMode ? "Тех. режим" : "Тех. режим"}
                      {user.plan !== 'unlimited' && <Icon name="Lock" size={14} className="ml-1" />}
                    </Button>
                    <Select onValueChange={handleTranslate} disabled={isTranslating || !text.trim()}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Перевести на..." />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.filter(l => l.code !== selectedLanguage).map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Mic2" size={20} />
                  Выбор голоса ({filteredVoices.length})
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
                      {filteredVoices.map((voice) => (
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
                      {filteredVoices.filter(v => v.gender === 'male').map((voice) => (
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
                      {filteredVoices.filter(v => v.gender === 'female').map((voice) => (
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