import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """
    API для получения статистики администратора.
    Возвращает общую статистику системы, активность пользователей.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
        
        # Общее количество пользователей
        cur.execute("SELECT COUNT(*) FROM users")
        total_users = cur.fetchone()[0]
        
        # Активные пользователи (не заблокированные)
        cur.execute("SELECT COUNT(*) FROM users WHERE role != 'blocked'")
        active_users = cur.fetchone()[0]
        
        # Пользователи зарегистрированные сегодня
        cur.execute("""
            SELECT COUNT(*) FROM users 
            WHERE DATE(created_at) = CURRENT_DATE
        """)
        users_today = cur.fetchone()[0]
        
        # Озвучки за сутки
        cur.execute("""
            SELECT COUNT(*) FROM projects 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        """)
        generations_today = cur.fetchone()[0]
        
        # Общее количество озвучек
        cur.execute("SELECT COUNT(*) FROM projects")
        total_generations = cur.fetchone()[0]
        
        # Общее количество символов обработано
        cur.execute("SELECT COALESCE(SUM(character_count), 0) FROM projects")
        total_characters = cur.fetchone()[0]
        
        # Общее время аудио (в секундах)
        cur.execute("SELECT COALESCE(SUM(audio_duration), 0) FROM projects")
        total_audio_seconds = cur.fetchone()[0]
        
        # Топ пользователей по использованию
        cur.execute("""
            SELECT 
                u.id,
                u.name,
                u.email,
                COALESCE(us.total_generations, 0) as generations,
                COALESCE(us.total_characters, 0) as characters
            FROM users u
            LEFT JOIN user_stats us ON u.id = us.user_id
            WHERE u.role != 'blocked'
            ORDER BY us.total_characters DESC
            LIMIT 5
        """)
        
        top_users_rows = cur.fetchall()
        top_users = []
        for row in top_users_rows:
            top_users.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'generations': row[3],
                'characters': row[4]
            })
        
        # Статистика по тарифам
        cur.execute("""
            SELECT plan, COUNT(*) 
            FROM users 
            WHERE role != 'blocked'
            GROUP BY plan
        """)
        
        plan_stats_rows = cur.fetchall()
        plan_stats = {}
        for row in plan_stats_rows:
            plan_stats[row[0]] = row[1]
        
        # Активность за последние 7 дней
        cur.execute("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM projects
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """)
        
        activity_rows = cur.fetchall()
        activity = []
        for row in activity_rows:
            activity.append({
                'date': row[0].isoformat(),
                'count': row[1]
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
                'total_users': total_users,
                'active_users': active_users,
                'users_today': users_today,
                'generations_today': generations_today,
                'total_generations': total_generations,
                'total_characters': total_characters,
                'total_audio_hours': round(total_audio_seconds / 3600, 2),
                'top_users': top_users,
                'plan_stats': plan_stats,
                'activity': activity
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