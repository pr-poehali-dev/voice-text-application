import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

const Pricing = ({ user, onNavigate }: { user: User; onNavigate: (page: string) => void }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const plans = [
    {
      id: 'free',
      name: 'Бесплатный',
      planKey: 'free',
      price: 0,
      period: '',
      description: 'Для знакомства с сервисом',
      features: [
        '5,000 символов в месяц',
        'Базовые голоса',
        'MP3 формат',
        'Базовая поддержка'
      ],
      color: 'bg-gray-100 text-gray-700',
      buttonText: 'Текущий тариф',
      popular: false
    },
    {
      id: 'basic',
      name: 'Базовый',
      planKey: 'starter',
      price: 490,
      period: 'месяц',
      description: 'Для небольших проектов',
      features: [
        '50,000 символов в месяц',
        'Все базовые голоса',
        'MP3, WAV, OGG форматы',
        'Приоритетная поддержка',
        'История проектов'
      ],
      color: 'bg-blue-100 text-blue-700',
      buttonText: 'Выбрать',
      popular: false
    },
    {
      id: 'pro',
      name: 'Профи',
      planKey: 'professional',
      price: 1990,
      period: 'месяц',
      description: 'Для профессионалов',
      features: [
        '300,000 символов в месяц',
        'Все голоса + премиум',
        'Все форматы',
        'Быстрая поддержка 24/7',
        'API доступ',
        'Без водяных знаков'
      ],
      color: 'bg-purple-100 text-purple-700',
      buttonText: 'Выбрать',
      popular: true
    },
    {
      id: 'unlimited',
      name: 'Безлимит',
      planKey: 'business',
      price: 4990,
      period: 'месяц',
      description: 'Для крупного бизнеса',
      features: [
        'До 8,000 символов за запрос',
        'Все голоса + эксклюзивные',
        'Все форматы',
        'Персональный менеджер',
        'Полный API доступ',
        'Кастомные голоса'
      ],
      color: 'bg-yellow-100 text-yellow-700',
      buttonText: 'Связаться',
      popular: false
    }
  ];

  const handleSelectPlan = async (planId: string, planKey: string, price: number) => {
    if (planId === user.plan || planId === 'free') {
      return;
    }

    setIsProcessing(planId);

    try {
      const response = await fetch(
        "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8/charge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.id.toString(),
          },
          body: JSON.stringify({ plan: planKey }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успешно!",
          description: `Тариф "${plans.find(p => p.id === planId)?.name}" успешно оплачен. Списано ${price} ₽`,
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        if (data.error?.includes("Недостаточно средств")) {
          toast({
            title: "Недостаточно средств",
            description: `Пополните баланс. Требуется: ${price} ₽, доступно: ${data.balance || 0} ₽`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Ошибка",
            description: data.error || "Не удалось оплатить тариф",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось оплатить тариф",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
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
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Выберите тариф</h1>
          <p className="text-lg text-muted-foreground">
            Начните бесплатно, улучшите когда будете готовы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl' : ''} hover:shadow-lg transition-all`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Популярный
                </Badge>
              )}
              
              <CardHeader>
                <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium mb-3 ${plan.color}`}>
                  {plan.name}
                </div>
                <CardTitle className="text-3xl font-bold">
                  {plan.price === 0 ? 'Бесплатно' : `₽${plan.price}`}
                  {plan.period && <span className="text-base font-normal text-muted-foreground">/{plan.period}</span>}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-4"
                  variant={plan.id === user.plan ? 'outline' : 'default'}
                  disabled={plan.id === user.plan || isProcessing === plan.id}
                  onClick={() => handleSelectPlan(plan.id, plan.planKey, plan.price)}
                >
                  {isProcessing === plan.id ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : plan.id === user.plan ? (
                    'Текущий тариф'
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">Часто задаваемые вопросы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="HelpCircle" size={20} className="text-primary" />
                  Можно ли сменить тариф?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Да, вы можете повысить или понизить тариф в любой момент. Изменения вступят в силу с начала следующего периода.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="HelpCircle" size={20} className="text-primary" />
                  Как работает оплата?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Оплата производится ежемесячно автоматически. Вы можете отменить подписку в любой момент без дополнительных комиссий.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="HelpCircle" size={20} className="text-primary" />
                  Что если превышу лимит?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                При превышении лимита вы получите уведомление с предложением улучшить тариф. Генерация будет временно приостановлена.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="HelpCircle" size={20} className="text-primary" />
                  Есть ли скидки?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Мы предлагаем скидки при годовой оплате (2 месяца в подарок) и специальные тарифы для образовательных учреждений.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;