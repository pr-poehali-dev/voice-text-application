import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PLANS_URL = "https://functions.poehali.dev/03f02e87-060b-4f7e-9d8f-df3ee8ea4b32";

interface Plan {
  id: string;
  name: string;
  price: number;
  characters_limit: number;
  max_chars_per_request: number;
  duration_days: number;
  is_popular: boolean;
  is_active: boolean;
  features: string[];
  updated_at: string | null;
}

const planColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  unlimited: "bg-yellow-100 text-yellow-700",
};

const AdminPlansEditor = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const { toast } = useToast();

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ADMIN_PLANS_URL);
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить тарифы", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setDraft({ ...plan, features: [...plan.features] });
    setNewFeature("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const res = await fetch(ADMIN_PLANS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        toast({ title: "Сохранено", description: `Тариф «${draft.name}» обновлён` });
        setEditingId(null);
        setDraft(null);
        fetchPlans();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    if (!draft || !newFeature.trim()) return;
    setDraft({ ...draft, features: [...draft.features, newFeature.trim()] });
    setNewFeature("");
  };

  const removeFeature = (idx: number) => {
    if (!draft) return;
    setDraft({ ...draft, features: draft.features.filter((_, i) => i !== idx) });
  };

  const formatLimit = (limit: number) =>
    limit === -1 ? "Безлимит" : limit.toLocaleString("ru");

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Загрузка тарифов...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">Изменения сразу отображаются на странице выбора тарифа для пользователей</p>
        <Button variant="outline" size="sm" onClick={fetchPlans}>
          <Icon name="RefreshCw" size={14} className="mr-1.5" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          const data = isEditing && draft ? draft : plan;

          return (
            <Card key={plan.id} className={`relative ${!data.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={planColors[plan.id] || "bg-gray-100 text-gray-700"}>
                      {data.name}
                    </Badge>
                    {data.is_popular && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">Популярный</Badge>
                    )}
                    {!data.is_active && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Скрыт</Badge>
                    )}
                  </div>
                  {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => startEdit(plan)}>
                      <Icon name="Edit" size={15} className="mr-1" />
                      Изменить
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isSaving}>
                        Отмена
                      </Button>
                      <Button size="sm" onClick={saveEdit} disabled={isSaving}>
                        {isSaving ? "Сохранение..." : "Сохранить"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {isEditing && draft ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Название</Label>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Цена (₽/мес)</Label>
                        <Input
                          type="number"
                          value={draft.price}
                          onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                          className="h-8 mt-1"
                          disabled={plan.id === "free"}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Символов в месяц (-1 = ∞)</Label>
                        <Input
                          type="number"
                          value={draft.characters_limit}
                          onChange={(e) => setDraft({ ...draft, characters_limit: Number(e.target.value) })}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Макс. символов за запрос</Label>
                        <Input
                          type="number"
                          value={draft.max_chars_per_request}
                          onChange={(e) => setDraft({ ...draft, max_chars_per_request: Number(e.target.value) })}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Длительность (дней)</Label>
                        <Input
                          type="number"
                          value={draft.duration_days}
                          onChange={(e) => setDraft({ ...draft, duration_days: Number(e.target.value) })}
                          className="h-8 mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={draft.is_popular}
                          onCheckedChange={(v) => setDraft({ ...draft, is_popular: v })}
                        />
                        <Label className="text-xs">Популярный</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={draft.is_active}
                          onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                        />
                        <Label className="text-xs">Показывать пользователям</Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Возможности тарифа</Label>
                      <div className="space-y-1.5 mb-2">
                        {draft.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1">
                            <span className="text-sm flex-1">{f}</span>
                            <button
                              onClick={() => removeFeature(i)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Icon name="X" size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Новая возможность..."
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addFeature()}
                          className="h-8 text-sm"
                        />
                        <Button variant="outline" size="sm" onClick={addFeature}>
                          <Icon name="Plus" size={14} />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-lg font-bold">{plan.price === 0 ? "0 ₽" : `${plan.price.toLocaleString("ru")} ₽`}</p>
                        <p className="text-xs text-muted-foreground">в месяц</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-lg font-bold">{formatLimit(plan.characters_limit)}</p>
                        <p className="text-xs text-muted-foreground">символов/мес</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-lg font-bold">{plan.max_chars_per_request.toLocaleString("ru")}</p>
                        <p className="text-xs text-muted-foreground">макс/запрос</p>
                      </div>
                    </div>

                    <ul className="space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="Check" size={13} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {plan.updated_at && (
                      <p className="text-xs text-muted-foreground">
                        Обновлён: {new Date(plan.updated_at).toLocaleDateString("ru")}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPlansEditor;
