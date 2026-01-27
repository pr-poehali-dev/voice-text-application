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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/pages/Index";

interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  plan: string | null;
  status: string;
  payment_id: string | null;
  created_at: string;
}

interface WalletWidgetProps {
  user: User;
}

const WalletWidget = ({ user }: WalletWidgetProps) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const { toast } = useToast();

  const fetchWallet = async () => {
    try {
      const response = await fetch(
        "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8/wallet",
        {
          method: "GET",
          headers: {
            "X-User-Id": user.id.toString(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user.id]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму пополнения",
        variant: "destructive",
      });
      return;
    }

    setIsDepositing(true);

    try {
      const response = await fetch(
        "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8/deposit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.id.toString(),
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Баланс пополнен на ${amount} ₽`,
        });
        setDepositAmount("");
        fetchWallet();
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка",
          description: error.error || "Не удалось пополнить баланс",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось пополнить баланс",
        variant: "destructive",
      });
    } finally {
      setIsDepositing(false);
    }
  };

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
          <span className="font-semibold">{wallet?.balance.toFixed(2) || "0.00"} ₽</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Wallet" size={24} />
            Кошелек
          </DialogTitle>
          <DialogDescription>
            Управляйте балансом и просматривайте историю операций
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Доступный баланс</div>
            <div className="text-4xl font-bold">
              {wallet?.balance.toFixed(2)} ₽
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="amount">Пополнить баланс</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="Сумма"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="1"
              />
              <Button onClick={handleDeposit} disabled={isDepositing}>
                {isDepositing ? (
                  <Icon name="Loader2" size={18} className="animate-spin" />
                ) : (
                  <>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Пополнить
                  </>
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(amount.toString())}
                >
                  {amount} ₽
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>История операций</Label>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  История пуста
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Icon
                          name={transaction.amount > 0 ? "ArrowDown" : "ArrowUp"}
                          size={16}
                          className={
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {transaction.type === "deposit"
                            ? "Пополнение"
                            : transaction.plan
                            ? `Оплата тарифа ${transaction.plan}`
                            : "Списание"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString("ru-RU")}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount.toFixed(2)} ₽
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletWidget;
