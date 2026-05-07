import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { User } from "./Index";

const PAYMENT_URL = "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8";

const Pricing = ({ user, onNavigate }: { user: User; onNavigate: (page: string) => void }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; planKey: string; price: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isPayingByCard, setIsPayingByCard] = useState(false);
  const { toast } = useToast();

  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const resp = await fetch(`${PAYMENT_URL}?action=wallet`, {
        headers: { "X-User-Id": user.id.toString(), "X-User-Email": user.email },
      });
      const data = await resp.json();
      if (resp.ok) setWalletBalance(data.wallet?.balance ?? 0);
    } catch {
      setWalletBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (selectedPlan) fetchBalance();
  }, [selectedPlan]);

  const handlePayFromWallet = async () => {
    if (!selectedPlan) return;
    setIsProcessing(selectedPlan.id);
    try {
      const response = await fetch(`${PAYMENT_URL}?action=charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id.toString(),
          "X-User-Email": user.email,
        },
        body: JSON.stringify({ plan: selectedPlan.planKey }),
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedPlan(null);
        toast({ title: "Успешно!", description: `Тариф "${selectedPlan.name}" оплачен. Списано ${selectedPlan.price} ₽` });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось оплатить тариф", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось оплатить тариф", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };
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
      price: 500,
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
      price: 5000,
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
      price: 15000,
      period: 'месяц',
      description: 'Для крупного бизнеса',
      features: [
        'Безлимитные символы в месяц',
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

  const handleSelectPlan = (planId: string, planName: string, planKey: string, price: number) => {
    if (planId === user.plan || planId === 'free') return;
    setSelectedPlan({ id: planId, name: planName, planKey, price });
  };

  const handlePayByCard = async () => {
    if (!selectedPlan) return;
    setIsPayingByCard(true);
    try {
      const returnUrl = window.location.href;
      const response = await fetch(`${PAYMENT_URL}?action=create_payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id.toString(),
          "X-User-Email": user.email,
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          plan: selectedPlan.planKey,
          plan_name: `Тариф «${selectedPlan.name}»`,
          return_url: returnUrl,
        }),
      });
      const data = await response.json();
      if (response.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось создать платёж", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось создать платёж", variant: "destructive" });
    } finally {
      setIsPayingByCard(false);
    }
  };

  return (
    <>
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
                  disabled={plan.id === user.plan}
                  onClick={() => handleSelectPlan(plan.id, plan.name, plan.planKey, plan.price)}
                >
                  {plan.id === user.plan ? 'Текущий тариф' : plan.buttonText}
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

    {/* Диалог выбора способа оплаты */}
    <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Оплата тарифа «{selectedPlan?.name}»</DialogTitle>
          <DialogDescription>Выберите удобный способ оплаты</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Кошелёк */}
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Icon name="Wallet" size={18} className="text-primary" />
                Общий кошелёк
              </div>
              <div className="text-sm text-muted-foreground">
                {isLoadingBalance ? (
                  <Icon name="Loader2" size={14} className="animate-spin" />
                ) : walletBalance !== null ? (
                  <span className={walletBalance >= (selectedPlan?.price ?? 0) ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                    {walletBalance.toFixed(2)} ₽
                  </span>
                ) : '—'}
              </div>
            </div>

            {walletBalance !== null && walletBalance < (selectedPlan?.price ?? 0) && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} />
                Не хватает {((selectedPlan?.price ?? 0) - walletBalance).toFixed(2)} ₽ — пополните на maxisoftzab.ru
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={isProcessing !== null || isLoadingBalance || walletBalance === null || walletBalance < (selectedPlan?.price ?? 0)}
                onClick={handlePayFromWallet}
              >
                {isProcessing ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Обработка...</>
                ) : (
                  <>Оплатить {selectedPlan?.price} ₽</>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBalance}
                disabled={isLoadingBalance}
                title="Обновить баланс"
              >
                <Icon name="RefreshCw" size={14} className={isLoadingBalance ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          {/* Оплата картой */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <Icon name="CreditCard" size={18} className="text-primary" />
              Банковская карта
            </div>
            <p className="text-xs text-muted-foreground">Visa, Mastercard, МИР — через ЮKassa. После оплаты тариф активируется автоматически.</p>
            <Button
              variant="outline"
              className="w-full"
              disabled={isPayingByCard}
              onClick={handlePayByCard}
            >
              {isPayingByCard ? (
                <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Перенаправление...</>
              ) : (
                <><Icon name="CreditCard" size={16} className="mr-2" />Оплатить {selectedPlan?.price} ₽ картой</>
              )}
            </Button>
          </div>

          {/* Пополнить кошелёк */}
          <a href="https://maxisoftzab.ru" target="_blank" rel="noopener noreferrer" className="block">
            <div className="rounded-xl border p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <Icon name="PlusCircle" size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Пополнить кошелёк</p>
                  <p className="text-xs text-muted-foreground">Перейти на maxisoftzab.ru</p>
                </div>
              </div>
              <Icon name="ExternalLink" size={16} className="text-muted-foreground" />
            </div>
          </a>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Pricing;