import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Subscription = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const plans = [
    {
      name: "Стартовый",
      description: "Для небольших команд",
      price: { monthly: 990, quarterly: 2670, yearly: 9500 },
      features: [
        "До 5 пользователей",
        "10 GB хранилища",
        "Базовая поддержка",
        "API доступ",
        "Ежемесячные отчёты"
      ],
      popular: false,
      color: "border-gray-300"
    },
    {
      name: "Профессиональный",
      description: "Для растущих компаний",
      price: { monthly: 2990, quarterly: 8070, yearly: 28500 },
      features: [
        "До 25 пользователей",
        "100 GB хранилища",
        "Приоритетная поддержка",
        "Расширенный API",
        "Аналитика в реальном времени",
        "Кастомная интеграция",
        "Белый брендинг"
      ],
      popular: true,
      color: "border-primary shadow-lg"
    },
    {
      name: "Корпоративный",
      description: "Для крупного бизнеса",
      price: { monthly: 9990, quarterly: 26970, yearly: 95000 },
      features: [
        "Неограниченно пользователей",
        "1 TB хранилища",
        "Персональный менеджер",
        "SLA 99.9%",
        "Расширенная аналитика",
        "Все интеграции",
        "Белый брендинг",
        "Выделенный сервер"
      ],
      popular: false,
      color: "border-gray-300"
    }
  ];

  const periodLabels = {
    monthly: { label: "Месяц", discount: "" },
    quarterly: { label: "Квартал", discount: "Скидка 10%" },
    yearly: { label: "Год", discount: "Скидка 20%" }
  };

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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Выберите свой тариф</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Гибкие планы подписки для компаний любого размера
          </p>

          <div className="inline-flex items-center gap-2 bg-card rounded-lg p-1 shadow-sm border">
            {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingPeriod === period
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabels[period].label}
                {periodLabels[period].discount && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {periodLabels[period].discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.color} ${plan.popular ? 'scale-105' : ''} transition-all hover:shadow-xl`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Icon name="Star" size={14} className="mr-1" />
                    Популярный
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      ₽{plan.price[billingPeriod].toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      / {billingPeriod === 'monthly' ? 'мес' : billingPeriod === 'quarterly' ? 'квартал' : 'год'}
                    </span>
                  </div>
                  {billingPeriod !== 'monthly' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ₽{Math.round(plan.price[billingPeriod] / (billingPeriod === 'quarterly' ? 3 : 12)).toLocaleString()} / мес
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button className={`w-full mb-6 ${plan.popular ? '' : 'variant-outline'}`} size="lg">
                  {plan.popular ? "Начать сейчас" : "Выбрать план"}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon name="CheckCircle2" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Building2" size={28} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Корпоративное решение</h3>
                <p className="text-muted-foreground">Индивидуальный план для вашей организации</p>
              </div>
            </div>
            <Button size="lg" className="whitespace-nowrap">
              <Icon name="Phone" size={18} className="mr-2" />
              Связаться с отделом продаж
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;
