import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "./Index";

const Auth = ({ onLogin, onNavigate }: { onLogin: (user: User) => void; onNavigate: (page: string) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (loginEmail === 'admin@voiceai.ru' && loginPassword === 'admin123') {
      const adminUser: User = {
        id: 1,
        email: 'admin@voiceai.ru',
        name: 'Администратор',
        role: 'admin',
        plan: 'unlimited',
        balance: 0
      };
      
      toast({
        title: t("auth.welcome_toast"),
        description: t("auth.welcome_admin")
      });
      
      setTimeout(() => {
        onLogin(adminUser);
        setIsLoading(false);
      }, 500);
      return;
    }

    setTimeout(() => {
      const mockUser: User = {
        id: 2,
        email: loginEmail,
        name: loginEmail.split('@')[0],
        role: 'user',
        plan: 'free',
        balance: 0
      };

      toast({
        title: t("auth.welcome_toast"),
        description: t("auth.welcome_success")
      });

      onLogin(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const newUser: User = {
        id: Date.now(),
        email: registerEmail,
        name: registerName,
        role: 'user',
        plan: 'free',
        balance: 0
      };

      toast({
        title: t("auth.register_success"),
        description: t("auth.register_welcome")
      });

      onLogin(newUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Icon name="Volume2" size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("app.name")}</h1>
          <p className="text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('landing')}
              className="absolute top-4 right-4"
            >
              <Icon name="X" size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">{t("auth.email")}</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder={t("auth.email_placeholder")}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="loginPassword">{t("auth.password")}</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={() => {
                          toast({
                            title: t("auth.forgot_title"),
                            description: t("auth.forgot_in_dev")
                          });
                        }}
                      >
                        {t("auth.forgot_password")}
                      </Button>
                    </div>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        {t("auth.login_progress")}
                      </>
                    ) : (
                      <>
                        <Icon name="LogIn" size={18} className="mr-2" />
                        {t("auth.login_button")}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registerName">{t("auth.name")}</Label>
                    <Input
                      id="registerName"
                      type="text"
                      placeholder={t("auth.name_placeholder")}
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">{t("auth.email")}</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder={t("auth.email_placeholder")}
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">{t("auth.password")}</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        {t("auth.register_progress")}
                      </>
                    ) : (
                      <>
                        <Icon name="UserPlus" size={18} className="mr-2" />
                        {t("auth.register_button")}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => onNavigate('landing')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            {t("auth.back_to_home")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;