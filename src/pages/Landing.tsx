import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Landing = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { t } = useLanguage();
  const [showSamples, setShowSamples] = useState(false);
  const [selectedSampleLang, setSelectedSampleLang] = useState("ru");
  const [isPlaying, setIsPlaying] = useState(false);
  
  const voiceSamples = [
    { lang: "ru", flag: "🇷🇺", name: "Русский", voice: "Алёна", text: "Добро пожаловать в VoiceAI - профессиональная озвучка текста нейросетью" },
    { lang: "en", flag: "🇬🇧", name: "English", voice: "Jane", text: "Welcome to VoiceAI - professional text-to-speech powered by neural networks" },
    { lang: "es", flag: "🇪🇸", name: "Español", voice: "María", text: "Bienvenido a VoiceAI - conversión profesional de texto a voz con redes neuronales" },
    { lang: "fr", flag: "🇫🇷", name: "Français", voice: "Amélie", text: "Bienvenue sur VoiceAI - synthèse vocale professionnelle par réseaux neuronaux" },
    { lang: "de", flag: "🇩🇪", name: "Deutsch", voice: "Lea", text: "Willkommen bei VoiceAI - professionelle Text-zu-Sprache mit neuronalen Netzen" },
    { lang: "it", flag: "🇮🇹", name: "Italiano", voice: "Sofia", text: "Benvenuto su VoiceAI - sintesi vocale professionale con reti neurali" },
    { lang: "pt", flag: "🇵🇹", name: "Português", voice: "Ana", text: "Bem-vindo ao VoiceAI - conversão profissional de texto em fala com redes neurais" },
    { lang: "zh", flag: "🇨🇳", name: "中文", voice: "Li", text: "欢迎使用VoiceAI - 由神经网络驱动的专业文本转语音" },
    { lang: "ja", flag: "🇯🇵", name: "日本語", voice: "Yuki", text: "VoiceAIへようこそ - ニューラルネットワークによるプロフェッショナルな音声合成" },
    { lang: "ko", flag: "🇰🇷", name: "한국어", voice: "Minjee", text: "VoiceAI에 오신 것을 환영합니다 - 신경망 기반 전문 텍스트 음성 변환" },
    { lang: "ar", flag: "🇸🇦", name: "العربية", voice: "Fatima", text: "مرحبا بك في VoiceAI - تحويل نص احترافي إلى كلام بالشبكات العصبية" },
    { lang: "hi", flag: "🇮🇳", name: "हिन्दी", voice: "Priya", text: "VoiceAI में आपका स्वागत है - तंत्रिका नेटवर्क द्वारा संचालित पेशेवर पाठ-से-भाषण" },
    { lang: "tr", flag: "🇹🇷", name: "Türkçe", voice: "Aylin", text: "VoiceAI'ye hoş geldiniz - sinir ağları ile profesyonel metinden sese dönüşüm" },
    { lang: "pl", flag: "🇵🇱", name: "Polski", voice: "Anna", text: "Witamy w VoiceAI - profesjonalna synteza mowy oparta na sieciach neuronowych" },
    { lang: "kk", flag: "🇰🇿", name: "Қазақша", voice: "Айнұр", text: "VoiceAI-ге қош келдіңіз - нейрондық желілермен қуатталған кәсіби мәтінді дауысқа айналдыру" },
  ];
  
  const currentSample = voiceSamples.find(s => s.lang === selectedSampleLang) || voiceSamples[0];
  
  const handlePlaySample = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentSample.text);
      utterance.lang = selectedSampleLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const langVoices = voices.filter(voice => voice.lang.startsWith(selectedSampleLang));
      if (langVoices.length > 0) {
        utterance.voice = langVoices[0];
      }
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const features = [
    {
      icon: "Mic2",
      title: t("feature.realistic_voices.title"),
      description: t("feature.realistic_voices.desc")
    },
    {
      icon: "Settings2",
      title: t("feature.flexible_settings.title"),
      description: t("feature.flexible_settings.desc")
    },
    {
      icon: "Download",
      title: t("feature.all_formats.title"),
      description: t("feature.all_formats.desc")
    },
    {
      icon: "Zap",
      title: t("feature.fast_simple.title"),
      description: t("feature.fast_simple.desc")
    },
    {
      icon: "FileText",
      title: t("feature.project_history.title"),
      description: t("feature.project_history.desc")
    },
    {
      icon: "CreditCard",
      title: t("feature.flexible_payment.title"),
      description: t("feature.flexible_payment.desc")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Volume2" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">{t("app.name")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => onNavigate('auth')}>{t("nav.login")}</Button>
            <Button onClick={() => onNavigate('auth')}>{t("nav.start_free")}</Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          {t("hero.title")}<br />
          <span className="text-primary">{t("hero.title_accent")}</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" onClick={() => onNavigate('auth')} className="h-12 px-8 text-lg">
            <Icon name="Mic" size={20} className="mr-2" />
            {t("hero.try_free")}
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg" onClick={() => setShowSamples(true)}>
            <Icon name="Play" size={20} className="mr-2" />
            {t("hero.listen_samples")}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">{t("stats.voices")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">{t("stats.users")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100K+</div>
            <div className="text-sm text-muted-foreground">{t("stats.voiceovers")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">15</div>
            <div className="text-sm text-muted-foreground">{t("stats.languages")}</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">{t("features.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name={feature.icon} size={24} className="text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Тарифы</h2>
          <p className="text-lg text-muted-foreground">Выберите подходящий план</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">Бесплатный</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽0</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-6" onClick={() => onNavigate('auth')}>
                Начать
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>5,000 символов/мес</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>10 базовых голосов</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>MP3 формат</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">Базовый</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽490</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-6" onClick={() => onNavigate('auth')}>
                Выбрать
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>50,000 символов/мес</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>30 голосов</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>MP3, WAV, OGG</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Базовые настройки</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-xl scale-105 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Популярный
            </div>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">Профи</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽1,490</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full mb-6" onClick={() => onNavigate('auth')}>
                Выбрать
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>300,000 символов/мес</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>50+ премиум голосов</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Все форматы</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Полные настройки</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Приоритет</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">Безлимит</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽4,990</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-6" onClick={() => onNavigate('auth')}>
                Выбрать
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Без ограничений</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Все голоса</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>Все форматы</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>API доступ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={16} className="text-primary" />
                  <span>24/7 поддержка</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 VoiceAI. Все права защищены.</p>
        </div>
      </footer>

      <Dialog open={showSamples} onOpenChange={setShowSamples}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t("hero.listen_samples")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Выберите язык</label>
              <Select value={selectedSampleLang} onValueChange={setSelectedSampleLang}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {voiceSamples.map((sample) => (
                    <SelectItem key={sample.lang} value={sample.lang}>
                      <span className="flex items-center gap-2">
                        <span>{sample.flag}</span>
                        <span>{sample.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{currentSample.flag}</div>
                    <div>
                      <div className="font-semibold text-lg">{currentSample.name}</div>
                      <div className="text-sm text-muted-foreground">Голос: {currentSample.voice}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-foreground/80 italic">"{currentSample.text}"</p>
                  </div>

                  <Button 
                    onClick={handlePlaySample} 
                    disabled={isPlaying}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isPlaying ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Воспроизведение...
                      </>
                    ) : (
                      <>
                        <Icon name="Play" size={20} className="mr-2" />
                        Прослушать пример
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-center text-muted-foreground">
                    Примеры демонстрируют качество озвучки на разных языках
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;