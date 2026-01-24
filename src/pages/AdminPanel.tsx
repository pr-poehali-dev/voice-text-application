import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
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

const AdminPanel = ({ user, onNavigate, onLogout }: { user: User; onNavigate: (page: string) => void; onLogout: () => void }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPlan, setNewPlan] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
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
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
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

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.role !== 'blocked').length;
  const totalGenerations = users.reduce((sum, u) => sum + u.total_generations, 0);

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
                  <p className="text-sm text-muted-foreground mb-1">Всего озвучек</p>
                  <p className="text-2xl font-bold">{totalGenerations.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Заблокировано</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.role === 'blocked').length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Ban" size={24} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Управление пользователями
            </CardTitle>
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
    </div>
  );
};

export default AdminPanel;
