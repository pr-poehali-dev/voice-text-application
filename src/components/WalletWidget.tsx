import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import type { User } from "@/pages/Index";

interface Wallet {
  balance: number;
  currency: string;
}

interface WalletWidgetProps {
  user: User;
}

const WalletWidget = ({ user }: WalletWidgetProps) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const response = await fetch(
        "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8/wallet",
        {
          method: "GET",
          headers: {
            "X-User-Id": user.id.toString(),
            "X-User-Email": user.email,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user.email]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Icon name="Wallet" size={18} className="text-gray-500" />
        <span className="text-sm text-gray-500">Загрузка...</span>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon name="Wallet" size={18} />
          <span className="font-semibold">{wallet?.balance.toFixed(2) ?? "0.00"} ₽</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Wallet" size={24} />
            Кошелёк
          </DialogTitle>
          <DialogDescription>
            Общий баланс для всех ваших сервисов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Доступный баланс</div>
            <div className="text-4xl font-bold">
              {wallet?.balance.toFixed(2) ?? "0.00"} ₽
            </div>
          </div>

          <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Icon name="Info" size={16} />
              Как пополнить баланс?
            </div>
            <p>Пополнение баланса доступно на сайте <strong>maxisoftzab.ru</strong>. Баланс общий — пополнили там, тратите здесь.</p>
            <a
              href="https://maxisoftzab.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
            >
              Перейти к пополнению
              <Icon name="ExternalLink" size={14} />
            </a>
          </div>

          <Button variant="outline" className="w-full" onClick={fetchWallet}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить баланс
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletWidget;
