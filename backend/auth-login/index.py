import json
import os
import psycopg2
import bcrypt

def handler(event: dict, context) -> dict:
    """
    Авторизация и регистрация пользователей.
    POST /login — вход, POST /register — регистрация.
    Возвращает данные пользователя из БД включая plan и role.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        if action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            cur.execute("SELECT id, name, email, role, plan, password_hash, balance FROM users WHERE email = %s", (email,))
            row = cur.fetchone()

            if not row:
                return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            user_id, name, user_email, role, plan, password_hash, balance = row

            if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            if role == 'blocked':
                return {'statusCode': 403, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Аккаунт заблокирован'})}

            cur.execute("SELECT avatar_url FROM users WHERE id = %s", (user_id,))
            avatar_row = cur.fetchone()
            avatar_url = avatar_row[0] if avatar_row else None

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user_id,
                        'name': name,
                        'email': user_email,
                        'role': role,
                        'plan': plan,
                        'balance': float(balance) if balance else 0,
                        'avatarUrl': avatar_url
                    }
                })
            }

        elif action == 'register':
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not name or not email or not password:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Заполните все поля'})}

            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Пользователь с таким email уже существует'})}

            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            cur.execute(
                "INSERT INTO users (name, email, password_hash, role, plan, balance) VALUES (%s, %s, %s, 'user', 'free', 0) RETURNING id",
                (name, email, password_hash)
            )
            new_id = cur.fetchone()[0]
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': new_id,
                        'name': name,
                        'email': email,
                        'role': 'user',
                        'plan': 'free',
                        'balance': 0,
                        'avatarUrl': None
                    }
                })
            }

        else:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        cur.close()
        conn.close()
