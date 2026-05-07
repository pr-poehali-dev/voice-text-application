import json
import os
import uuid  # noqa
import requests
import psycopg2
from datetime import datetime, timedelta
from wallet import get_balance, charge_balance


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


# Маппинг plan_db_id -> planKey (обратный)
PLAN_ID_TO_KEY = {
    'basic': 'starter',
    'pro': 'professional',
    'unlimited': 'business'
}

# Маппинг planKey -> plan_id в БД
PLAN_KEY_TO_ID = {
    'starter': 'basic',
    'professional': 'pro',
    'business': 'unlimited'
}

def get_plan_from_db(conn, plan_id: str) -> dict:
    """Получить данные тарифа из таблицы plans по plan_id (basic/pro/unlimited)."""
    cur = conn.cursor()
    cur.execute("SELECT id, name, price, duration_days FROM plans WHERE id = %s", (plan_id,))
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {'id': row[0], 'name': row[1], 'price': row[2], 'duration_days': row[3]}

def get_plan_by_key(conn, plan_key: str) -> dict:
    """Получить данные тарифа из БД по planKey (starter/professional/business)."""
    plan_id = PLAN_KEY_TO_ID.get(plan_key)
    if not plan_id:
        return None
    return get_plan_from_db(conn, plan_id)

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-User-Email'
}

def ok(data: dict) -> dict:
    return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', **CORS_HEADERS}, 'body': json.dumps(data, ensure_ascii=False)}

def err(msg: str, code: int = 400) -> dict:
    return {'statusCode': code, 'headers': {'Content-Type': 'application/json', **CORS_HEADERS}, 'body': json.dumps({'error': msg})}


def handler(event: dict, context) -> dict:
    """
    API для работы с кошельком, платежами ЮKassa и управлением подпиской.

    GET  ?action=wallet          — получить баланс по email
    POST ?action=charge          — списать за тариф из кошелька
    POST ?action=create_payment  — создать платёж через ЮKassa (возвращает confirmation_url)
    GET  ?action=check_payment   — проверить статус платежа ЮKassa
    GET  ?action=subscription    — получить статус тарифа и флаг автопродления
    POST ?action=set_auto_renew  — включить/выключить автопродление
    POST ?action=renew_now       — немедленно продлить тариф с кошелька
    """
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers', {})
    user_email = headers.get('X-User-Email') or headers.get('x-user-email')
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')

    # GET ?action=wallet — баланс кошелька
    if method == 'GET' and action == 'wallet':
        if not user_email:
            return err('Не передан email пользователя', 401)
        try:
            wallet = get_balance(user_email)
            return ok({'wallet': wallet})
        except Exception as e:
            return err(str(e), 500)

    # POST ?action=charge — списать из кошелька
    if method == 'POST' and action == 'charge':
        if not user_email:
            return err('Не передан email пользователя', 401)
        try:
            body = json.loads(event.get('body', '{}'))
            plan_key = body.get('plan')
            conn = get_db()
            plan_data = get_plan_by_key(conn, plan_key)
            conn.close()
            if not plan_data:
                return err('Неверный тарифный план')
            amount = plan_data['price']
            result = charge_balance(user_email, amount, plan_key)
            return ok({'success': True, 'plan': plan_key, **result})
        except ValueError as e:
            return err(str(e))
        except Exception as e:
            return err(str(e), 500)

    # POST ?action=create_payment — создать платёж ЮKassa
    if method == 'POST' and action == 'create_payment':
        if not user_email or not user_id:
            return err('Не передан email или id пользователя', 401)

        shop_id = os.environ.get('YOOKASSA_SHOP_ID')
        secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
        if not shop_id or not secret_key:
            return err('ЮKassa не настроена', 500)

        try:
            body = json.loads(event.get('body', '{}'))
            plan = body.get('plan')
            plan_name = body.get('plan_name', 'Подписка')
            return_url = body.get('return_url', 'https://voiceal.ru')

            conn = get_db()
            plan_data = get_plan_by_key(conn, plan)
            conn.close()
            if not plan_data:
                return err('Неверный тарифный план')

            amount = plan_data['price']
            idempotence_key = str(uuid.uuid4())

            payment_data = {
                "amount": {"value": str(amount) + ".00", "currency": "RUB"},
                "confirmation": {"type": "redirect", "return_url": return_url},
                "capture": True,
                "description": plan_name,
                "receipt": {
                    "customer": {"email": user_email},
                    "items": [{
                        "description": plan_name,
                        "quantity": "1.00",
                        "amount": {"value": str(amount) + ".00", "currency": "RUB"},
                        "vat_code": 1,
                        "payment_mode": "full_payment",
                        "payment_subject": "service"
                    }]
                },
                "metadata": {
                    "user_id": str(user_id),
                    "user_email": user_email,
                    "plan": plan,
                    "plan_db_id": PLAN_KEY_TO_ID.get(plan, plan),
                    "created_at": datetime.now().isoformat()
                }
            }

            resp = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payment_data,
                auth=(shop_id, secret_key),
                headers={'Idempotence-Key': idempotence_key, 'Content-Type': 'application/json'},
                timeout=15
            )

            print(f"[yookassa] create_payment status={resp.status_code} body={resp.text[:300]}")

            if resp.status_code in (200, 201):
                payment = resp.json()
                return ok({
                    'payment_id': payment['id'],
                    'status': payment['status'],
                    'confirmation_url': payment['confirmation']['confirmation_url'],
                    'amount': payment['amount']['value']
                })
            else:
                return err(f"Ошибка создания платежа: {resp.text}", resp.status_code)

        except Exception as e:
            return err(str(e), 500)

    # GET ?action=check_payment — проверить статус платежа
    if method == 'GET' and action == 'check_payment':
        shop_id = os.environ.get('YOOKASSA_SHOP_ID')
        secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
        if not shop_id or not secret_key:
            return err('ЮKassa не настроена', 500)

        payment_id = params.get('payment_id')
        if not payment_id:
            return err('Не указан payment_id')
        try:
            resp = requests.get(
                f'https://api.yookassa.ru/v3/payments/{payment_id}',
                auth=(shop_id, secret_key),
                timeout=10
            )
            if resp.status_code == 200:
                payment = resp.json()
                return ok({
                    'payment_id': payment['id'],
                    'status': payment['status'],
                    'paid': payment.get('paid', False),
                    'amount': payment['amount']['value'],
                    'metadata': payment.get('metadata', {})
                })
            else:
                return err(f"Ошибка: {resp.text}", resp.status_code)
        except Exception as e:
            return err(str(e), 500)

    # GET ?action=subscription — получить статус подписки и auto_renew
    if method == 'GET' and action == 'subscription':
        if not user_id:
            return err('Не передан id пользователя', 401)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT plan, auto_renew, plan_expires_at FROM users WHERE id = %s",
            (int(user_id),)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return err('Пользователь не найден', 404)
        plan, auto_renew, expires_at = row
        plan_key = PLAN_ID_TO_KEY.get(plan, plan)
        return ok({
            'plan': plan,
            'plan_key': plan_key,
            'auto_renew': bool(auto_renew),
            'plan_expires_at': expires_at.isoformat() if expires_at else None
        })

    # POST ?action=set_auto_renew — включить/выключить автопродление
    if method == 'POST' and action == 'set_auto_renew':
        if not user_id:
            return err('Не передан id пользователя', 401)
        body = json.loads(event.get('body', '{}'))
        enabled = bool(body.get('enabled', False))
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "UPDATE users SET auto_renew = %s WHERE id = %s",
            (enabled, int(user_id))
        )
        conn.commit()
        cur.close()
        conn.close()
        return ok({'success': True, 'auto_renew': enabled})

    # POST ?action=renew_now — немедленное списание с кошелька (продление тарифа)
    if method == 'POST' and action == 'renew_now':
        if not user_email or not user_id:
            return err('Не передан email или id пользователя', 401)
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT plan FROM users WHERE id = %s", (int(user_id),))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return err('Пользователь не найден', 404)
        plan_db_id = row[0]
        plan_data = get_plan_from_db(conn, plan_db_id)
        if not plan_data:
            cur.close()
            conn.close()
            return err('У вас нет активного платного тарифа')
        amount = plan_data['price']
        duration_days = plan_data['duration_days']
        try:
            result = charge_balance(user_email, amount, plan_db_id)
        except ValueError as e:
            cur.close()
            conn.close()
            return err(str(e))
        expires_at = datetime.now() + timedelta(days=duration_days)
        cur.execute(
            "UPDATE users SET plan_expires_at = %s, characters_used = 0, usage_reset_date = CURRENT_DATE WHERE id = %s",
            (expires_at, int(user_id))
        )
        conn.commit()
        cur.close()
        conn.close()
        return ok({
            'success': True,
            'plan': plan_db_id,
            'plan_name': plan_data['name'],
            'amount_charged': amount,
            'new_balance': result['new_balance'],
            'plan_expires_at': expires_at.isoformat()
        })

    return err('Неизвестное действие', 400)