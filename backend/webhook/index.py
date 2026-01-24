import json
import os
import hmac
import hashlib

def handler(event: dict, context) -> dict:
    """
    Webhook для получения уведомлений от ЮKassa о статусе платежей
    
    POST /webhook - обработка уведомления от ЮKassa
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = event.get('body', '{}')
        notification = json.loads(body)
        
        event_type = notification.get('event')
        payment_object = notification.get('object', {})
        
        payment_id = payment_object.get('id')
        status = payment_object.get('status')
        paid = payment_object.get('paid', False)
        amount = payment_object.get('amount', {}).get('value')
        metadata = payment_object.get('metadata', {})
        
        if event_type == 'payment.succeeded' and paid:
            plan_name = metadata.get('plan_name', 'Неизвестный план')
            
            print(f'Успешный платёж: {payment_id}')
            print(f'План: {plan_name}')
            print(f'Сумма: {amount} RUB')
            print(f'Метаданные: {metadata}')
        
        elif event_type == 'payment.canceled':
            print(f'Платёж отменён: {payment_id}')
        
        elif event_type == 'payment.waiting_for_capture':
            print(f'Платёж ожидает подтверждения: {payment_id}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'ok'})
        }
        
    except Exception as e:
        print(f'Ошибка обработки webhook: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
