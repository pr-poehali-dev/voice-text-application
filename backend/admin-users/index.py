import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """
    API для управления пользователями администратором.
    Получение списка пользователей, обновление статуса, блокировка.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
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
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # GET - получить список всех пользователей
        if method == 'GET':
            cur.execute("""
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.role, 
                    u.plan, 
                    u.characters_used,
                    u.created_at,
                    COALESCE(us.total_generations, 0) as total_generations
                FROM users u
                LEFT JOIN user_stats us ON u.id = us.user_id
                ORDER BY u.created_at DESC
            """)
            
            users_rows = cur.fetchall()
            users = []
            
            for row in users_rows:
                users.append({
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'role': row[3],
                    'plan': row[4],
                    'characters_used': row[5],
                    'created_at': row[6].isoformat() if row[6] else None,
                    'total_generations': row[7]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'users': users}),
                'isBase64Encoded': False
            }
        
        # PUT - обновить пользователя (план, роль, блокировка)
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId')
            action = body.get('action')  # 'update_plan', 'update_role', 'block', 'unblock'
            
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
            
            if action == 'update_plan':
                new_plan = body.get('plan')
                if new_plan not in ['free', 'basic', 'pro', 'unlimited']:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Invalid plan'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    UPDATE users
                    SET plan = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (new_plan, int(user_id)))
                
            elif action == 'update_role':
                new_role = body.get('role')
                if new_role not in ['user', 'admin']:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Invalid role'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    UPDATE users
                    SET role = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (new_role, int(user_id)))
                
            elif action == 'block':
                # Блокируем пользователя (устанавливаем роль blocked)
                cur.execute("""
                    UPDATE users
                    SET role = 'blocked', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (int(user_id),))
                
            elif action == 'unblock':
                # Разблокируем пользователя (возвращаем роль user)
                cur.execute("""
                    UPDATE users
                    SET role = 'user', updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s AND role = 'blocked'
                """, (int(user_id),))
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'User updated'}),
                'isBase64Encoded': False
            }
        
        # DELETE - удалить пользователя
        elif method == 'DELETE':
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
            
            # Удаляем связанные данные
            cur.execute("DELETE FROM projects WHERE user_id = %s", (int(user_id),))
            cur.execute("DELETE FROM user_stats WHERE user_id = %s", (int(user_id),))
            cur.execute("DELETE FROM users WHERE id = %s", (int(user_id),))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'User deleted'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
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
