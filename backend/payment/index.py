import json
import os
import uuid  # noqa
import requests
from datetime import datetime
from wallet import get_balance, charge_balance

PLAN_PRICES = {
    'starter': 490,
    'professional': 1990,
    'business': 4990
}

# Маппинг planKey -> plan_id в БД
PLAN_KEY_TO_ID = {
    'starter': 'basic',
    'professional': 'pro',
    'business': 'unlimited'
}

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
    API для работы с кошельком и платежами ЮKassa.

    GET  ?action=wallet          — получить баланс по email
    POST ?action=charge          — списать за тариф из кошелька
    POST ?action=create_payment  — создать платёж через ЮKassa (возвращает confirmation_url)
    GET  ?action=check_payment   — проверить статус платежа ЮKassa
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
            plan = body.get('plan')
            if plan not in PLAN_PRICES:
                return err('Неверный тарифный план')
            amount = PLAN_PRICES[plan]
            result = charge_balance(user_email, amount, plan)
            return ok({'success': True, 'plan': plan, **result})
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

            if plan not in PLAN_PRICES:
                return err('Неверный тарифный план')

            amount = PLAN_PRICES[plan]
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

    return err('Неизвестное действие', 400)