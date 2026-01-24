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
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
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
        
        stats = {
            'total_generations': stats_row[0],
            'total_characters': stats_row[1],
            'total_projects': stats_row[2],
            'total_audio_duration': stats_row[3]
        }
        
        # Получаем последние 10 проектов
        cur.execute("""
            SELECT id, title, text, audio_url, voice, speed, format, character_count, audio_duration, created_at
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
