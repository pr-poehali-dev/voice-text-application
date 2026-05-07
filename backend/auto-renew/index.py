import json
import os
import psycopg2
import requests
from datetime import datetime, timedelta

WALLET_FUNCTION_URL = "https://functions.poehali.dev/8a886097-3bd9-4d94-8c19-d19ca3f3acbd"

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def load_plans(conn) -> dict:
    """Загружает тарифы из БД. Возвращает dict {plan_id: {price, name, duration_days}}."""
    cur = conn.cursor()
    cur.execute("SELECT id, name, price, duration_days FROM plans WHERE id != 'free'")
    rows = cur.fetchall()
    cur.close()
    return {row[0]: {'name': row[1], 'price': row[2], 'duration_days': row[3]} for row in rows}


def charge_wallet(email: str, amount: float, plan: str) -> dict:
    resp = requests.post(
        WALLET_FUNCTION_URL,
        params={"action": "deduct"},
        json={"email": email, "amount": amount, "description": f"Автопродление тарифа {plan}"},
        headers={"X-Api-Key": os.environ.get("MAXISOFTZAB_API_KEY", ""), "Content-Type": "application/json"},
        timeout=10
    )
    data = resp.json()
    if not data.get("success"):
        raise ValueError(data.get("error", "Ошибка списания"))
    return {"new_balance": float(data.get("balance", 0))}


def handler(event: dict, context) -> dict:
    """
    CRON-функция автоматического продления тарифов.
    Запускается ежедневно. Находит пользователей у которых:
    - auto_renew = true
    - plan_expires_at <= NOW() (тариф истёк или истекает сегодня)
    - plan != 'free'
    Списывает деньги с кошелька и продлевает тариф на 30 дней.
    """
    now = datetime.now()
    print(f"[auto-renew] Запуск: {now.isoformat()}")

    conn = get_db()
    cur = conn.cursor()

    plans = load_plans(conn)
    plan_ids = list(plans.keys())

    cur.execute("""
        SELECT id, email, plan, plan_expires_at
        FROM users
        WHERE auto_renew = TRUE
          AND plan != 'free'
          AND plan = ANY(%s)
          AND (plan_expires_at IS NULL OR plan_expires_at <= NOW() + INTERVAL '1 day')
    """, (plan_ids,))
    users = cur.fetchall()
    print(f"[auto-renew] Найдено пользователей для продления: {len(users)}")

    results = {"success": [], "failed": []}

    for user_id, email, plan, expires_at in users:
        plan_data = plans.get(plan)
        if not plan_data:
            print(f"[auto-renew] Неизвестный план {plan} для user_id={user_id}, пропускаю")
            continue

        amount = plan_data['price']
        duration_days = plan_data['duration_days']
        print(f"[auto-renew] Продляю user_id={user_id} email={email} plan={plan} amount={amount}")
        try:
            charge_wallet(email, amount, plan_data['name'])
            new_expires = now + timedelta(days=duration_days)
            cur.execute("""
                UPDATE users
                SET plan_expires_at = %s,
                    characters_used = 0,
                    usage_reset_date = CURRENT_DATE
                WHERE id = %s
            """, (new_expires, user_id))
            conn.commit()
            print(f"[auto-renew] Успешно продлён user_id={user_id} до {new_expires.date()}")
            results["success"].append({"user_id": user_id, "email": email, "plan": plan, "expires_at": new_expires.isoformat()})
        except Exception as e:
            conn.rollback()
            print(f"[auto-renew] Ошибка для user_id={user_id}: {e}")
            cur.execute("""
                UPDATE users SET auto_renew = FALSE WHERE id = %s
            """, (user_id,))
            conn.commit()
            results["failed"].append({"user_id": user_id, "email": email, "error": str(e)})

    cur.close()
    conn.close()

    print(f"[auto-renew] Итого: успешно={len(results['success'])} ошибок={len(results['failed'])}")
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "ok": True,
            "processed": len(users),
            "success": len(results["success"]),
            "failed": len(results["failed"]),
            "details": results
        }, ensure_ascii=False)
    }