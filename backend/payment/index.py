import json
import os
import uuid
import requests
from datetime import datetime
from wallet import get_or_create_wallet, add_balance, charge_balance, get_transactions

# Стоимость тарифов в рублях
PLAN_PRICES = {
    'starter': 490,
    'professional': 1990,
    'business': 4990
}

def handler(event: dict, context) -> dict:
    """
    API для работы с платежами и кошельком
    
    GET /payment/wallet - получить баланс кошелька
    POST /payment/deposit - пополнить баланс
    POST /payment/charge - списать за тариф
    POST /payment - создать платёж через ЮKassa
    GET /payment?payment_id=xxx - проверить статус платежа
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }
    
    # Получение user_id из заголовков
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    # Обработка запросов к кошельку
    if '/wallet' in path and method == 'GET':
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не авторизован'})
            }
        
        try:
            user_id = int(user_id)
            wallet = get_or_create_wallet(user_id)
            transactions = get_transactions(user_id, 10)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'wallet': wallet, 'transactions': transactions}, ensure_ascii=False)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    # Пополнение баланса
    if '/deposit' in path and method == 'POST':
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не авторизован'})
            }
        
        try:
            user_id = int(user_id)
            body = json.loads(event.get('body', '{}'))
            amount = body.get('amount')
            
            if not amount or amount <= 0:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверная сумма пополнения'})
                }
            
            result = add_balance(user_id, amount)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, **result}, ensure_ascii=False)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    # Списание за тариф
    if '/charge' in path and method == 'POST':
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не авторизован'})
            }
        
        try:
            user_id = int(user_id)
            body = json.loads(event.get('body', '{}'))
            plan = body.get('plan')
            
            if plan not in PLAN_PRICES:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный тарифный план'})
                }
            
            amount = PLAN_PRICES[plan]
            result = charge_balance(user_id, amount, plan)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'plan': plan, **result}, ensure_ascii=False)
            }
        except ValueError as e:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    # Работа с ЮKassa
    shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'ЮKassa не настроена. Добавьте ключи в настройки проекта'})
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            amount = body.get('amount')
            plan_name = body.get('plan_name', 'Подписка')
            return_url = body.get('return_url', 'https://example.com')
            
            if not amount:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указана сумма платежа'})
                }
            
            idempotence_key = str(uuid.uuid4())
            
            payment_data = {
                "amount": {
                    "value": str(amount),
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": return_url
                },
                "capture": True,
                "description": plan_name,
                "metadata": {
                    "plan_name": plan_name,
                    "created_at": datetime.now().isoformat()
                }
            }
            
            response = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payment_data,
                auth=(shop_id, secret_key),
                headers={
                    'Idempotence-Key': idempotence_key,
                    'Content-Type': 'application/json'
                }
            )
            
            if response.status_code == 200:
                payment = response.json()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'payment_id': payment['id'],
                        'status': payment['status'],
                        'confirmation_url': payment['confirmation']['confirmation_url'],
                        'amount': payment['amount']['value']
                    })
                }
            else:
                return {
                    'statusCode': response.status_code,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Ошибка создания платежа', 'details': response.text})
                }
                
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    if method == 'GET':
        payment_id = event.get('queryStringParameters', {}).get('payment_id')
        
        if not payment_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Не указан payment_id'})
            }
        
        try:
            response = requests.get(
                f'https://api.yookassa.ru/v3/payments/{payment_id}',
                auth=(shop_id, secret_key)
            )
            
            if response.status_code == 200:
                payment = response.json()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'payment_id': payment['id'],
                        'status': payment['status'],
                        'paid': payment['paid'],
                        'amount': payment['amount']['value']
                    })
                }
            else:
                return {
                    'statusCode': response.status_code,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Платёж не найден'})
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }