import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const AdminStudio2 = () => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  const startRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setRecognizedText(prev => (prev + ' ' + finalTranscript).trim());
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        return;
      }
      if (event.error !== 'aborted') {
        toast({ title: 'Ошибка', description: 'Произошла ошибка при распознавании', variant: 'destructive' });
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          setTimeout(() => {
            if (shouldRestartRef.current) recognition.start();
          }, 300);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleToggle = () => {
    if (isListening) {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({ title: 'Остановлено', description: 'Распознавание речи остановлено' });
    } else {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({ title: 'Не поддерживается', description: 'Ваш браузер не поддерживает распознавание речи', variant: 'destructive' });
        return;
      }
      shouldRestartRef.current = true;
      startRecognition();
      toast({ title: 'Слушаю...', description: 'Начните говорить' });
    }
  };

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
              onClick={handleToggle}
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