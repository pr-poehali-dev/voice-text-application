import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const featureLabels: Record<string, string> = {
  generate: "генерации озвучки",
  translate: "переводов текста",
  download: "скачиваний аудио",
};

interface DemoLimitModalProps {
  open: boolean;
  feature: string;
  onClose: () => void;
  onRegister: () => void;
}

const DemoLimitModal = ({ open, feature, onClose, onRegister }: DemoLimitModalProps) => {
  const featureLabel = featureLabels[feature] || "бесплатных попыток";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="Lock" size={32} className="text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">Демо-режим завершён</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-muted-foreground">
            Вы использовали все <strong>3 бесплатные попытки</strong> {featureLabel}.
          </p>

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Star" size={18} className="text-primary" />
              <span className="font-semibold text-primary">Тариф «Безлимит»</span>
            </div>
            <ul className="text-sm text-left space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
                Неограниченные генерации озвучки
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
                Перевод на 15 языков
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
                50+ профессиональных голосов
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
                Скачивание в MP3, WAV, OGG
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Check" size={14} className="text-green-500 flex-shrink-0" />
                История всех проектов
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={onRegister} className="w-full h-11 text-base font-semibold">
              <Icon name="UserPlus" size={18} className="mr-2" />
              Зарегистрироваться и купить тариф
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full">
              Продолжить смотреть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoLimitModal;
