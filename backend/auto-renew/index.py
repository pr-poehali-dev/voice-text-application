import json
import os
import psycopg2
import requests
from datetime import datetime, timedelta

WALLET_FUNCTION_URL = "https://functions.poehali.dev/8a886097-3bd9-4d94-8c19-d19ca3f3acbd"

PLAN_PRICES = {
    'basic': 490,
    'pro': 1990,
    'unlimited': 4990
}

PLAN_NAMES = {
    'basic': 'Базовый',
    'pro': 'Профи',
    'unlimited': 'Безлимит'
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


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

    cur.execute("""
        SELECT id, email, plan, plan_expires_at
        FROM users
        WHERE auto_renew = TRUE
          AND plan != 'free'
          AND plan IN ('basic', 'pro', 'unlimited')
          AND (plan_expires_at IS NULL OR plan_expires_at <= NOW() + INTERVAL '1 day')
    """)
    users = cur.fetchall()
    print(f"[auto-renew] Найдено пользователей для продления: {len(users)}")

    results = {"success": [], "failed": []}

    for user_id, email, plan, expires_at in users:
        amount = PLAN_PRICES.get(plan)
        if not amount:
            print(f"[auto-renew] Неизвестный план {plan} для user_id={user_id}, пропускаю")
            continue

        print(f"[auto-renew] Продляю user_id={user_id} email={email} plan={plan} amount={amount}")
        try:
            charge_wallet(email, amount, PLAN_NAMES.get(plan, plan))
            new_expires = now + timedelta(days=30)
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
