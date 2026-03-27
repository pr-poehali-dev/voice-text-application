import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface PlanBlockOverlayProps {
  onNavigate: (page: string) => void;
}

const PlanBlockOverlay = ({ onNavigate }: PlanBlockOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <Icon name="LockKeyhole" size={32} className="text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Доступ временно заблокирован</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Тарифный план истёк. Страницы и действия на сайте временно недоступны.
            Оплатите или продлите тариф — и всё заработает в полную силу.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => onNavigate('pricing')} className="w-full" size="lg">
            <Icon name="CreditCard" size={16} className="mr-2" />
            Оплатить тариф
          </Button>
          <Button onClick={() => onNavigate('settings')} variant="outline" className="w-full">
            <Icon name="Settings" size={16} className="mr-2" />
            Перейти в настройки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanBlockOverlay;
