import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    CRUD API для управления тарифными планами. Только для администраторов.
    GET - список всех тарифов
    PUT - обновить тариф
    """
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': '', 'isBase64Encoded': False}

    dsn = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(f"{dsn} options='-c search_path={schema}'")
    cur = conn.cursor()

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        cur.execute("""
            SELECT id, name, price, characters_limit, max_chars_per_request,
                   duration_days, is_popular, is_active, features, updated_at
            FROM plans ORDER BY price ASC
        """)
        rows = cur.fetchall()
        plans = []
        for row in rows:
            plans.append({
                'id': row[0],
                'name': row[1],
                'price': row[2],
                'characters_limit': row[3],
                'max_chars_per_request': row[4],
                'duration_days': row[5],
                'is_popular': row[6],
                'is_active': row[7],
                'features': row[8] if row[8] else [],
                'updated_at': row[9].isoformat() if row[9] else None
            })
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'plans': plans}), 'isBase64Encoded': False}

    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        plan_id = body.get('id')
        if not plan_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'id is required'}), 'isBase64Encoded': False}

        fields = []
        values = []

        for field in ['name', 'price', 'characters_limit', 'max_chars_per_request', 'duration_days', 'is_popular', 'is_active']:
            if field in body:
                fields.append(f"{field} = %s")
                values.append(body[field])

        if 'features' in body:
            fields.append("features = %s")
            values.append(json.dumps(body['features'], ensure_ascii=False))

        if not fields:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'No fields to update'}), 'isBase64Encoded': False}

        fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(plan_id)

        cur.execute(f"UPDATE plans SET {', '.join(fields)} WHERE id = %s", values)
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'success': True}), 'isBase64Encoded': False}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'}), 'isBase64Encoded': False}
