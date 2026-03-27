import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const AdminStudio2 = () => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Mic" size={20} />
          Студия №2: Распознавание речи
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Нажмите на микрофон и начните говорить. Текст будет распознаваться в реальном времени.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className="w-32 h-32 rounded-full"
              onClick={() => {
                if (isListening) {
                  setIsListening(false);
                  toast({ title: 'Остановлено', description: 'Распознавание речи остановлено' });
                } else {
                  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    toast({ title: 'Не поддерживается', description: 'Ваш браузер не поддерживает распознавание речи', variant: 'destructive' });
                    return;
                  }

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  const recognition = new SpeechRecognition();

                  recognition.lang = 'ru-RU';
                  recognition.continuous = true;
                  recognition.interimResults = true;

                  recognition.onstart = () => {
                    setIsListening(true);
                    toast({ title: 'Слушаю...', description: 'Начните говорить' });
                  };

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                      const transcript = event.results[i][0].transcript;
                      if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                      }
                    }
                    if (finalTranscript) {
                      setRecognizedText(prev => (prev + ' ' + finalTranscript).trim());
                    }
                  };

                  recognition.onerror = () => {
                    setIsListening(false);
                    toast({ title: 'Ошибка', description: 'Произошла ошибка при распознавании', variant: 'destructive' });
                  };

                  recognition.onend = () => {
                    setIsListening(false);
                  };

                  recognition.start();
                }
              }}
            >
              <Icon
                name={isListening ? "MicOff" : "Mic"}
                size={48}
                className={isListening ? "animate-pulse" : ""}
              />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium">
              {isListening ? '🔴 Идёт запись...' : 'Нажмите на микрофон чтобы начать'}
            </p>
          </div>

          {recognizedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Распознанный текст</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(recognizedText);
                      toast({ title: 'Скопировано', description: 'Текст скопирован в буфер обмена' });
                    }}
                  >
                    <Icon name="Copy" size={16} className="mr-2" />
                    Копировать
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRecognizedText('')}>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Очистить
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg min-h-32">
                <p className="text-sm whitespace-pre-wrap">{recognizedText}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="FileText" size={14} />
                Символов: {recognizedText.length} • Слов: {recognizedText.trim().split(/\s+/).filter(Boolean).length}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStudio2;