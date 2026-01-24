import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const Landing = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const features = [
    {
      icon: "Zap",
      title: "Быстрый старт",
      description: "Начните работу за 5 минут. Простая настройка и интуитивный интерфейс."
    },
    {
      icon: "Shield",
      title: "Безопасность",
      description: "Корпоративная защита данных с шифрованием и резервным копированием."
    },
    {
      icon: "BarChart3",
      title: "Аналитика",
      description: "Детальные отчёты и метрики для принятия бизнес-решений."
    },
    {
      icon: "Users",
      title: "Командная работа",
      description: "Совместная работа команды с гибким управлением доступом."
    },
    {
      icon: "Smartphone",
      title: "Мобильность",
      description: "Работайте откуда угодно — адаптивный дизайн для всех устройств."
    },
    {
      icon: "Headphones",
      title: "Поддержка 24/7",
      description: "Профессиональная техподдержка всегда готова помочь вам."
    }
  ];

  const stats = [
    { value: "10K+", label: "Активных пользователей" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "50+", label: "Стран по миру" },
    { value: "4.9/5", label: "Рейтинг клиентов" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SaaS Platform</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Возможности</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Тарифы</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">О нас</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onNavigate('auth')}>Войти</Button>
            <Button onClick={() => onNavigate('auth')}>Начать бесплатно</Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 px-4 py-1.5">
          <Icon name="Sparkles" size={14} className="mr-1" />
          Новое поколение бизнес-платформ
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Управляйте бизнесом<br />
          <span className="text-primary">эффективнее на 300%</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Профессиональная SaaS-платформа для автоматизации бизнес-процессов, аналитики и управления командой
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" onClick={() => onNavigate('auth')} className="h-12 px-8 text-lg">
            <Icon name="Rocket" size={20} className="mr-2" />
            Начать бесплатно
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
            <Icon name="Play" size={20} className="mr-2" />
            Смотреть демо
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Всё что нужно для роста</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Комплексное решение для управления вашим бизнесом с современными инструментами
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
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Прозрачные цены</h2>
          <p className="text-lg text-muted-foreground">
            Выберите план который подходит вашему бизнесу
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Стартовый</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽990</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-6" onClick={() => onNavigate('subscription')}>
                Выбрать план
              </Button>
              <ul className="space-y-3">
                {["До 5 пользователей", "10 GB хранилища", "Базовая поддержка"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-xl scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                <Icon name="Star" size={14} className="mr-1" />
                Популярный
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Профессиональный</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽2,990</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full mb-6" onClick={() => onNavigate('subscription')}>
                Начать сейчас
              </Button>
              <ul className="space-y-3">
                {["До 25 пользователей", "100 GB хранилища", "Приоритетная поддержка", "Расширенный API"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Корпоративный</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₽9,990</span>
                <span className="text-muted-foreground"> / мес</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full mb-6" onClick={() => onNavigate('subscription')}>
                Связаться
              </Button>
              <ul className="space-y-3">
                {["Неограниченно", "1 TB хранилища", "Персональный менеджер", "SLA 99.9%"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon name="Check" size={18} className="text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Готовы начать?</h2>
          <p className="text-xl mb-10 opacity-90">
            Присоединяйтесь к тысячам компаний, которые уже используют нашу платформу
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate('auth')} className="h-12 px-8 text-lg">
            <Icon name="ArrowRight" size={20} className="mr-2" />
            Попробовать бесплатно
          </Button>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={24} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SaaS Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 SaaS Platform. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
