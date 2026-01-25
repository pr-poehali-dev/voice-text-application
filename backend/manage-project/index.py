import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Управление проектом: переименование и избранное'''
    
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str.strip() == '':
            body_str = '{}'
        
        body = json.loads(body_str)
        project_id = body.get('projectId')
        user_id = body.get('userId')
        action = body.get('action')
        
        if not project_id or not user_id or not action:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'projectId, userId и action обязательны'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Проверить что проект принадлежит пользователю
        cur.execute(
            "SELECT id FROM projects WHERE id = %s AND user_id = %s",
            (project_id, user_id)
        )
        project = cur.fetchone()
        
        if not project:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Проект не найден'})
            }
        
        # Выполнить действие
        if action == 'toggle_favorite':
            is_favorite = body.get('isFavorite')
            if is_favorite is None:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'isFavorite обязательно для toggle_favorite'})
                }
            
            cur.execute(
                "UPDATE projects SET is_favorite = %s WHERE id = %s",
                (is_favorite, project_id)
            )
            conn.commit()
            result = {'success': True, 'is_favorite': is_favorite}
            
        elif action == 'rename':
            new_name = body.get('newName', '').strip()
            if not new_name:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'newName обязательно для rename'})
                }
            
            if len(new_name) > 200:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Название слишком длинное (макс 200 символов)'})
                }
            
            cur.execute(
                "UPDATE projects SET name = %s WHERE id = %s",
                (new_name, project_id)
            )
            conn.commit()
            result = {'success': True, 'new_name': new_name}
            
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Неизвестное действие. Допустимые: toggle_favorite, rename'})
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
