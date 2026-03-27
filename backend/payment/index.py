import json
import os
import uuid
import requests
from datetime import datetime
from wallet import get_balance, charge_balance

PLAN_PRICES = {
    'starter': 490,
    'professional': 1990,
    'business': 4990
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
    API для работы с общим кошельком (maxisoftzab.ru) и платежами

    GET  /payment/wallet  — получить баланс по email
    POST /payment/charge  — списать за тариф
    POST /payment         — создать платёж через ЮKassa
    GET  /payment?payment_id=xxx — проверить статус платежа
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers', {})
    user_email = headers.get('X-User-Email') or headers.get('x-user-email')
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')

    # Получить баланс: GET ?action=wallet  или  GET /wallet
    if method == 'GET' and (action == 'wallet' or '/wallet' in path):
        if not user_email:
            return err('Не передан email пользователя', 401)
        try:
            wallet = get_balance(user_email)
            return ok({'wallet': wallet})
        except Exception as e:
            return err(str(e), 500)

    # Списать за тариф: POST ?action=charge  или  POST /charge
    if method == 'POST' and (action == 'charge' or '/charge' in path):
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

    # Работа с ЮKassa
    shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY')

    if not shop_id or not secret_key:
        return err('ЮKassa не настроена. Добавьте ключи в настройки проекта', 500)

    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            amount = body.get('amount')
            plan_name = body.get('plan_name', 'Подписка')
            return_url = body.get('return_url', 'https://example.com')

            if not amount:
                return err('Не указана сумма платежа')

            idempotence_key = str(uuid.uuid4())
            payment_data = {
                "amount": {"value": str(amount), "currency": "RUB"},
                "confirmation": {"type": "redirect", "return_url": return_url},
                "capture": True,
                "description": plan_name,
                "metadata": {"plan_name": plan_name, "created_at": datetime.now().isoformat()}
            }

            response = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payment_data,
                auth=(shop_id, secret_key),
                headers={'Idempotence-Key': idempotence_key, 'Content-Type': 'application/json'}
            )

            if response.status_code == 200:
                payment = response.json()
                return ok({
                    'payment_id': payment['id'],
                    'status': payment['status'],
                    'confirmation_url': payment['confirmation']['confirmation_url'],
                    'amount': payment['amount']['value']
                })
            else:
                return err(f"Ошибка создания платежа: {response.text}", response.status_code)

        except Exception as e:
            return err(str(e), 500)

    if method == 'GET':
        payment_id = event.get('queryStringParameters', {}).get('payment_id')
        if not payment_id:
            return err('Не указан payment_id')
        try:
            response = requests.get(
                f'https://api.yookassa.ru/v3/payments/{payment_id}',
                auth=(shop_id, secret_key)
            )
            if response.status_code == 200:
                payment = response.json()
                return ok({
                    'payment_id': payment['id'],
                    'status': payment['status'],
                    'amount': payment['amount']['value']
                })
            else:
                return err(f"Ошибка получения платежа: {response.text}", response.status_code)
        except Exception as e:
            return err(str(e), 500)

    return err('Метод не поддерживается', 405)