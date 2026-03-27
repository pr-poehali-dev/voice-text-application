import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { PlanStatus } from "@/hooks/usePlanStatus";

interface PlanBannerProps {
  planStatus: PlanStatus;
  onNavigate: (page: string) => void;
}

const PlanBanner = ({ planStatus, onNavigate }: PlanBannerProps) => {
  const { daysLeft, isExpired, isBlocked, isWarning } = planStatus;

  if (!isWarning && !isExpired && !isBlocked) return null;

  const getDaysLabel = (days: number) => {
    if (days <= 0) return "Истёк";
    if (days === 1) return "1 день";
    if (days < 5) return `${days} дня`;
    return `${days} дней`;
  };

  if (isBlocked) {
    return (
      <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="LockKeyhole" size={16} />
          <span className="text-sm font-medium">
            Тарифный план истёк. Страницы и действия временно заблокированы — оплатите тариф для восстановления доступа.
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onNavigate('pricing')}
          className="shrink-0"
        >
          <Icon name="CreditCard" size={14} className="mr-1.5" />
          Оплатить тариф
        </Button>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="TriangleAlert" size={16} />
          <span className="text-sm font-medium">
            Тарифный план истёк. Осталось 1 день до блокировки аккаунта.
          </span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onNavigate('pricing')}
          className="shrink-0"
        >
          <Icon name="RefreshCw" size={14} className="mr-1.5" />
          Продлить сейчас
        </Button>
      </div>
    );
  }

  // isWarning (1–7 дней)
  return (
    <div className={`px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap ${daysLeft !== null && daysLeft <= 3 ? 'bg-orange-100 border-b border-orange-200' : 'bg-yellow-50 border-b border-yellow-200'}`}>
      <div className="flex items-center gap-2">
        <Icon name="Clock" size={15} className={daysLeft !== null && daysLeft <= 3 ? 'text-orange-600' : 'text-yellow-700'} />
        <span className={`text-sm ${daysLeft !== null && daysLeft <= 3 ? 'text-orange-700 font-medium' : 'text-yellow-800'}`}>
          До окончания тарифного плана осталось: <strong>{daysLeft !== null ? getDaysLabel(daysLeft) : '—'}</strong>
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onNavigate('pricing')}
        className="shrink-0 h-7 text-xs"
      >
        Продлить
      </Button>
    </div>
  );
};

export default PlanBanner;
