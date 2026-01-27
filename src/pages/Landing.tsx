import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Landing = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { t } = useLanguage();
  
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
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
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
    </div>
  );
};

export default Landing;