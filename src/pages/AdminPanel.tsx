import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import WalletWidget from "@/components/WalletWidget";
import NotificationBell from "@/components/NotificationBell";
import type { User } from "./Index";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  plan: string;
  characters_used: number;
  created_at: string;
  total_generations: number;
}

interface AdminStats {
  total_users: number;
  active_users: number;
  users_today: number;
  generations_today: number;
  total_generations: number;
  total_characters: number;
  total_audio_hours: number;
  top_users: Array<{id: number; name: string; email: string; generations: number; characters: number}>;
  plan_stats: Record<string, number>;
  activity: Array<{date: string; count: number}>;
}

const AdminPanel = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlan, setNewPlan] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPlan, setNewUserPlan] = useState('free');
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/d8226be4-73c4-4b3c-b3af-423231e920d7');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleEditUser = (selectedUser: AdminUser) => {
    setSelectedUser(selectedUser);
    setNewPlan(selectedUser.plan);
    setNewRole(selectedUser.role);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      // Обновляем план
      if (newPlan !== selectedUser.plan) {
        await fetch('https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUser.id,
            action: 'update_plan',
            plan: newPlan
          })
        });
      }

      // Обновляем роль
      if (newRole !== selectedUser.role) {
        await fetch('https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUser.id,
            action: 'update_role',
            role: newRole
          })
        });
      }

      toast({
        title: "Успешно",
        description: "Данные пользователя обновлены"
      });

      setShowEditDialog(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      const action = selectedUser.role === 'blocked' ? 'unblock' : 'block';
      
      await fetch('https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: action
        })
      });

      toast({
        title: "Успешно",
        description: action === 'block' ? "Пользователь заблокирован" : "Пользователь разблокирован"
      });

      setShowBlockDialog(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус пользователя",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await fetch(`https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d?userId=${selectedUser.id}`, {
        method: 'DELETE'
      });

      toast({
        title: "Успешно",
        description: "Пользователь удален"
      });

      setShowDeleteDialog(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          plan: newUserPlan,
          role: 'user'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пользователь создан"
        });

        setShowAddDialog(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserPlan('free');
        fetchUsers();
        fetchStats();
      } else {
        throw new Error(data.error || 'Ошибка создания');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать пользователя",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const planBadgeColors = {
    free: "bg-gray-100 text-gray-700",
    basic: "bg-blue-100 text-blue-700",
    pro: "bg-purple-100 text-purple-700",
    unlimited: "bg-yellow-100 text-yellow-700"
  };

  const planNames = {
    free: 'Бесплатный',
    basic: 'Базовый',
    pro: 'Профи',
    unlimited: 'Безлимит'
  };

  const totalUsers = stats?.total_users || users.length;
  const activeUsers = stats?.active_users || users.filter(u => u.role !== 'blocked').length;
  const totalGenerations = stats?.total_generations || users.reduce((sum, u) => sum + u.total_generations, 0);
  const generationsToday = stats?.generations_today || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Volume2" size={24} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VoiceAI</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Icon name="Shield" size={14} className="mr-1" />
              Администратор
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <WalletWidget user={user} />
            <NotificationBell user={user} />
            <Button variant="ghost" size="sm" onClick={() => onNavigate('studio')}>
              <Icon name="Mic2" size={18} className="mr-2" />
              Студия
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
              <Icon name="LayoutDashboard" size={18} className="mr-2" />
              Кабинет
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Управление пользователями и системой VoiceAI</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="users">
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="studio2">
              <Icon name="Mic" size={16} className="mr-2" />
              Студия №2
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Всего пользователей</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Активных</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Activity" size={24} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Озвучек за сутки</p>
                  <p className="text-2xl font-bold">{generationsToday.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Volume2" size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Всего озвучек</p>
                  <p className="text-2xl font-bold">{totalGenerations.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                Управление пользователями
              </CardTitle>
              <Button onClick={() => setShowAddDialog(true)}>
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить пользователя
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Тариф</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Использование</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={planBadgeColors[u.plan as keyof typeof planBadgeColors]}>
                            {planNames[u.plan as keyof typeof planNames]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "blocked" ? "destructive" : u.role === "admin" ? "default" : "outline"}
                            className={
                              u.role === "blocked" ? "bg-red-100 text-red-700 border-red-200" : 
                              u.role === "admin" ? "bg-orange-100 text-orange-700 border-orange-200" :
                              "bg-green-100 text-green-700 border-green-200"
                            }
                          >
                            {u.role === "blocked" ? "Заблокирован" : u.role === "admin" ? "Админ" : "Активен"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-sm">{u.characters_used.toLocaleString()} символов</span>
                            <p className="text-xs text-muted-foreground">{u.total_generations} озвучек</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(u.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(u)}
                              title="Редактировать"
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u);
                                setShowBlockDialog(true);
                              }}
                              title={u.role === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                            >
                              <Icon name={u.role === 'blocked' ? 'Unlock' : 'Lock'} size={16} />
                            </Button>
                            {u.role !== 'admin' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowDeleteDialog(true);
                                }}
                                title="Удалить"
                              >
                                <Icon name="Trash2" size={16} className="text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Системные настройки и топ пользователей */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={20} />
                Системные настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('settings')}
              >
                <Icon name="Key" size={18} className="mr-2" />
                API ключи
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('pricing')}
              >
                <Icon name="CreditCard" size={18} className="mr-2" />
                Управление тарифами
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.reload()}
              >
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Обновить данные
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Топ пользователей
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.top_users && stats.top_users.length > 0 ? (
                <div className="space-y-3">
                  {stats.top_users.map((topUser, index) => (
                    <div key={topUser.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{topUser.name}</p>
                          <p className="text-xs text-muted-foreground">{topUser.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{topUser.characters.toLocaleString()} симв.</p>
                        <p className="text-xs text-muted-foreground">{topUser.generations} озвучек</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Users" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет данных</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="studio2">
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
                          toast({
                            title: 'Остановлено',
                            description: 'Распознавание речи остановлено'
                          });
                        } else {
                          if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                            toast({
                              title: 'Не поддерживается',
                              description: 'Ваш браузер не поддерживает распознавание речи',
                              variant: 'destructive'
                            });
                            return;
                          }

                          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          const recognition = new SpeechRecognition();
                          
                          recognition.lang = 'ru-RU';
                          recognition.continuous = true;
                          recognition.interimResults = true;

                          recognition.onstart = () => {
                            setIsListening(true);
                            toast({
                              title: 'Слушаю...',
                              description: 'Начните говорить'
                            });
                          };

                          recognition.onresult = (event: any) => {
                            let finalTranscript = '';
                            let interimTranscript = '';

                            for (let i = event.resultIndex; i < event.results.length; i++) {
                              const transcript = event.results[i][0].transcript;
                              if (event.results[i].isFinal) {
                                finalTranscript += transcript + ' ';
                              } else {
                                interimTranscript += transcript;
                              }
                            }

                            if (finalTranscript) {
                              setRecognizedText(prev => (prev + ' ' + finalTranscript).trim());
                            }
                          };

                          recognition.onerror = (event: any) => {
                            setIsListening(false);
                            toast({
                              title: 'Ошибка',
                              description: 'Произошла ошибка при распознавании',
                              variant: 'destructive'
                            });
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
                              toast({
                                title: 'Скопировано',
                                description: 'Текст скопирован в буфер обмена'
                              });
                            }}
                          >
                            <Icon name="Copy" size={16} className="mr-2" />
                            Копировать
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRecognizedText('')}
                          >
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Диалог редактирования */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Изменение тарифа и роли для {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тарифный план</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Бесплатный</SelectItem>
                  <SelectItem value="basic">Базовый</SelectItem>
                  <SelectItem value="pro">Профи</SelectItem>
                  <SelectItem value="unlimited">Безлимит</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Роль</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог блокировки */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.role === 'blocked' ? 'Разблокировать' : 'Заблокировать'} пользователя
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.role === 'blocked' 
                ? `Вы уверены, что хотите разблокировать ${selectedUser?.name}? Пользователь снова сможет пользоваться сервисом.`
                : `Вы уверены, что хотите заблокировать ${selectedUser?.name}? Пользователь не сможет войти в систему.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant={selectedUser?.role === 'blocked' ? 'default' : 'destructive'}
              onClick={handleBlockUser}
            >
              {selectedUser?.role === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить пользователя</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить {selectedUser?.name}? Это действие необратимо. Все данные пользователя будут удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления пользователя */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить нового пользователя</DialogTitle>
            <DialogDescription>
              Создание учетной записи для нового пользователя
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Имя</Label>
              <Input
                id="new-name"
                type="text"
                placeholder="Введите имя"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="email@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Пароль</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Минимум 6 символов"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-plan">Тарифный план</Label>
              <Select value={newUserPlan} onValueChange={setNewUserPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Бесплатный</SelectItem>
                  <SelectItem value="basic">Базовый</SelectItem>
                  <SelectItem value="pro">Профи</SelectItem>
                  <SelectItem value="unlimited">Безлимит</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddUser}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;