import json
import os
import psycopg2
from datetime import datetime, timedelta


def handler(event: dict, context) -> dict:
    """
    Webhook от ЮKassa: при успешной оплате активирует тариф пользователю в БД.
    POST / — обработка уведомления от ЮKassa
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
        return {'statusCode': 405, 'body': json.dumps({'error': 'Method not allowed'})}

    body = event.get('body', '{}')
    notification = json.loads(body)

    event_type = notification.get('event')
    payment_object = notification.get('object', {})

    payment_id = payment_object.get('id')
    status = payment_object.get('status')
    paid = payment_object.get('paid', False)
    amount = payment_object.get('amount', {}).get('value')
    metadata = payment_object.get('metadata', {})

    print(f"[webhook] event={event_type} payment_id={payment_id} paid={paid} metadata={metadata}")

    if event_type == 'payment.succeeded' and paid:
        user_id = metadata.get('user_id')
        user_email = metadata.get('user_email')
        plan_db_id = metadata.get('plan_db_id')

        print(f"[webhook] Активирую тариф: user_id={user_id} email={user_email} plan={plan_db_id} amount={amount}")

        if user_id and plan_db_id:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            try:
                new_expires = (datetime.utcnow() + timedelta(days=30)).isoformat()
                cur.execute(
                    "UPDATE users SET plan = %s, plan_expires_at = %s WHERE id = %s",
                    (plan_db_id, new_expires, int(user_id))
                )
                conn.commit()
                print(f"[webhook] Тариф {plan_db_id} активирован для user_id={user_id}, expires={new_expires}")
            except Exception as e:
                conn.rollback()
                print(f"[webhook] Ошибка обновления тарифа: {e}")
            finally:
                cur.close()
                conn.close()
        else:
            print(f"[webhook] Не хватает метаданных: user_id={user_id} plan_db_id={plan_db_id}")

    elif event_type == 'payment.canceled':
        print(f"[webhook] Платёж отменён: {payment_id}")

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'status': 'ok'})
    }