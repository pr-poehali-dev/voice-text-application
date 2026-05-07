import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  plan: string;
  characters_used: number;
  created_at: string;
  total_generations: number;
  plan_expires_at: string | null;
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

interface AdminUsersTableProps {
  users: AdminUser[];
  stats: AdminStats | null;
  isLoading: boolean;
  onNavigate: (page: string) => void;
  onRefresh: () => void;
  onRefreshStats: () => void;
  currentUserId?: number;
  onUpdateCurrentUser?: (fields: Partial<{ plan: string; role: string }>) => void;
}

const ADMIN_USERS_URL = 'https://functions.poehali.dev/fc8cc205-a9e9-4f9d-b4f3-5921b5c6743d';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const AdminUsersTable = ({ users, stats, isLoading, onNavigate, onRefresh, onRefreshStats, currentUserId, onUpdateCurrentUser }: AdminUsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlan, setNewPlan] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [changingPlanUserId, setChangingPlanUserId] = useState<number | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPlan, setNewUserPlan] = useState('free');
  const { toast } = useToast();

  const handleEditUser = (u: AdminUser) => {
    setSelectedUser(u);
    setNewPlan(u.plan);
    setNewRole(u.role);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      const updates: Partial<{ plan: string; role: string }> = {};
      if (newPlan !== selectedUser.plan) {
        await fetch(ADMIN_USERS_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUser.id, action: 'update_plan', plan: newPlan })
        });
        updates.plan = newPlan;
      }
      if (newRole !== selectedUser.role) {
        await fetch(ADMIN_USERS_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUser.id, action: 'update_role', role: newRole })
        });
        updates.role = newRole;
      }
      if (selectedUser.id === currentUserId && Object.keys(updates).length > 0) {
        onUpdateCurrentUser?.(updates);
      }
      toast({ title: "Успешно", description: "Данные пользователя обновлены" });
      setShowEditDialog(false);
      onRefresh();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось обновить пользователя", variant: "destructive" });
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      const action = selectedUser.role === 'blocked' ? 'unblock' : 'block';
      await fetch(ADMIN_USERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, action })
      });
      toast({ title: "Успешно", description: action === 'block' ? "Пользователь заблокирован" : "Пользователь разблокирован" });
      setShowBlockDialog(false);
      onRefresh();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось изменить статус пользователя", variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await fetch(`${ADMIN_USERS_URL}?userId=${selectedUser.id}`, { method: 'DELETE' });
      toast({ title: "Успешно", description: "Пользователь удален" });
      setShowDeleteDialog(false);
      onRefresh();
      onRefreshStats();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить пользователя", variant: "destructive" });
    }
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast({ title: "Ошибка", description: "Заполните все поля", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(ADMIN_USERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, password: newUserPassword, plan: newUserPlan, role: 'user' })
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Успешно", description: "Пользователь создан" });
        setShowAddDialog(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserPlan('free');
        onRefresh();
        onRefreshStats();
      } else {
        throw new Error(data.error || 'Ошибка создания');
      }
    } catch (error) {
      toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Не удалось создать пользователя", variant: "destructive" });
    }
  };

  return (
    <>
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
                        <div className="flex flex-col gap-0.5">
                        <Select
                          value={u.plan}
                          onValueChange={async (plan) => {
                            setChangingPlanUserId(u.id);
                            try {
                              await fetch(ADMIN_USERS_URL, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: u.id, action: 'update_plan', plan })
                              });
                              toast({ title: "Тариф обновлён", description: `${u.name} → ${planNames[plan as keyof typeof planNames]}` });
                              if (u.id === currentUserId) onUpdateCurrentUser?.({ plan });
                              onRefresh();
                            } catch {
                              toast({ title: "Ошибка", description: "Не удалось сменить тариф", variant: "destructive" });
                            } finally {
                              setChangingPlanUserId(null);
                            }
                          }}
                        >
                          <SelectTrigger className={`w-32 h-7 text-xs border-0 px-2 font-medium ${planBadgeColors[u.plan as keyof typeof planBadgeColors]} ${changingPlanUserId === u.id ? 'opacity-50' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Бесплатный</SelectItem>
                            <SelectItem value="basic">Базовый</SelectItem>
                            <SelectItem value="pro">Профи</SelectItem>
                            <SelectItem value="unlimited">Безлимит</SelectItem>
                          </SelectContent>
                        </Select>
                        {u.plan_expires_at && u.plan !== 'free' && (
                          <span className="text-xs text-muted-foreground">
                            до {new Date(u.plan_expires_at).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </span>
                        )}
                        </div>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)} title="Редактировать">
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedUser(u); setShowBlockDialog(true); }}
                            title={u.role === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                          >
                            <Icon name={u.role === 'blocked' ? 'Unlock' : 'Lock'} size={16} />
                          </Button>
                          {u.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedUser(u); setShowDeleteDialog(true); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Системные настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('settings')}>
              <Icon name="Key" size={18} className="mr-2" />
              API ключи
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('pricing')}>
              <Icon name="CreditCard" size={18} className="mr-2" />
              Управление тарифами
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => window.location.reload()}>
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

      {/* Диалог редактирования */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Изменение тарифа и роли для {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тарифный план</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Отмена</Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог блокировки */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.role === 'blocked' ? 'Разблокировать' : 'Заблокировать'} пользователя</DialogTitle>
            <DialogDescription>
              {selectedUser?.role === 'blocked'
                ? `Вы уверены, что хотите разблокировать ${selectedUser?.name}? Пользователь снова сможет пользоваться сервисом.`
                : `Вы уверены, что хотите заблокировать ${selectedUser?.name}? Пользователь не сможет войти в систему.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Отмена</Button>
            <Button variant={selectedUser?.role === 'blocked' ? 'default' : 'destructive'} onClick={handleBlockUser}>
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
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить нового пользователя</DialogTitle>
            <DialogDescription>Создание учетной записи для нового пользователя</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Имя</Label>
              <Input id="new-name" type="text" placeholder="Введите имя" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" placeholder="email@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Пароль</Label>
              <Input id="new-password" type="password" placeholder="Минимум 6 символов" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-plan">Тарифный план</Label>
              <Select value={newUserPlan} onValueChange={setNewUserPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Отмена</Button>
            <Button onClick={handleAddUser}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsersTable;