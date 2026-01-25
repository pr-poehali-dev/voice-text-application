import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """
    API для получения и управления статистикой пользователя.
    Возвращает статистику и последние проекты пользователя.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        query_params = event.get('queryStringParameters') or {}
        user_id = query_params.get('userId')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'userId is required'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                'isBase64Encoded': False
            }
        
        # Добавляем схему в строку подключения
        schema_name = os.environ.get('MAIN_DB_SCHEMA', 'public')
        dsn_with_schema = f"{dsn} options='-c search_path={schema_name}'"
        
        conn = psycopg2.connect(dsn_with_schema)
        cur = conn.cursor()
        
        # Получаем информацию о пользователе и его использовании
        cur.execute("""
            SELECT plan, characters_used, avatar_url, usage_reset_date
            FROM users
            WHERE id = %s
        """, (int(user_id),))
        
        user_row = cur.fetchone()
        
        # Если пользователь не найден, создаем базовую запись
        if not user_row:
            user_plan = 'free'
            characters_used = 0
            avatar_url = None
        else:
            user_plan = user_row[0] if user_row[0] else 'free'
            characters_used = user_row[1] if user_row[1] else 0
            avatar_url = user_row[2]
            last_reset = user_row[3]
            
            # Проверяем, нужно ли сбросить счетчик (если начался новый месяц)
            from datetime import datetime
            current_date = datetime.now().date()
            
            if last_reset:
                # Если текущий месяц отличается от месяца последнего сброса
                if current_date.month != last_reset.month or current_date.year != last_reset.year:
                    # Сбрасываем счетчик использованных символов
                    cur.execute("""
                        UPDATE users
                        SET characters_used = 0, usage_reset_date = CURRENT_DATE
                        WHERE id = %s
                    """, (int(user_id),))
                    conn.commit()
                    characters_used = 0
        
        # Получаем статистику пользователя
        cur.execute("""
            SELECT total_generations, total_characters, total_projects, total_audio_duration
            FROM user_stats
            WHERE user_id = %s
        """, (user_id,))
        
        stats_row = cur.fetchone()
        
        if not stats_row:
            # Создаем запись статистики если её нет
            cur.execute("""
                INSERT INTO user_stats (user_id, total_generations, total_characters, total_projects, total_audio_duration)
                VALUES (%s, 0, 0, 0, 0)
                RETURNING total_generations, total_characters, total_projects, total_audio_duration
            """, (user_id,))
            stats_row = cur.fetchone()
            conn.commit()
        
        # Лимиты по тарифам
        plan_limits = {
            'free': 5000,
            'basic': 50000,
            'pro': 300000,
            'unlimited': -1  # -1 означает безлимит
        }
        
        character_limit = plan_limits.get(user_plan, 5000)
        characters_remaining = character_limit - characters_used if character_limit > 0 else -1
        
        stats = {
            'total_generations': stats_row[0],
            'total_characters': stats_row[1],
            'total_projects': stats_row[2],
            'total_audio_duration': stats_row[3],
            'characters_used': characters_used,
            'character_limit': character_limit,
            'characters_remaining': characters_remaining,
            'avatar_url': avatar_url
        }
        
        # Получаем последние 10 проектов
        cur.execute("""
            SELECT id, name, text, audio_url, voice_name, speed, format, character_count, duration, created_at
            FROM projects
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 10
        """, (user_id,))
        
        projects_rows = cur.fetchall()
        projects = []
        
        for row in projects_rows:
            projects.append({
                'id': row[0],
                'title': row[1],
                'text': row[2],
                'audio_url': row[3],
                'voice': row[4],
                'speed': float(row[5]) if row[5] else 1.0,
                'format': row[6],
                'character_count': row[7],
                'audio_duration': row[8],
                'created_at': row[9].isoformat() if row[9] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'stats': stats,
                'projects': projects
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'Internal error: {str(e)}'
            }),
            'isBase64Encoded': False
        }