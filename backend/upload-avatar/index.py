import json
import os
import boto3
import base64
import uuid
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    API для загрузки аватара пользователя.
    Загружает изображение в S3 и обновляет avatar_url в базе данных.
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
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
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('userId')
        image_base64 = body.get('image')
        
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
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'image is required'}),
                'isBase64Encoded': False
            }
        
        # Декодируем base64 изображение
        try:
            # Удаляем префикс data:image/...;base64, если есть
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            image_data = base64.b64decode(image_base64)
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Invalid base64 image: {str(e)}'}),
                'isBase64Encoded': False
            }
        
        # Загружаем изображение в S3
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_key = f'avatars/{user_id}/{timestamp}_{file_id}.jpg'
        
        s3.put_object(
            Bucket='files',
            Key=file_key,
            Body=image_data,
            ContentType='image/jpeg'
        )
        
        avatar_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        # Обновляем avatar_url в базе данных
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
        
        try:
            # Добавляем схему в строку подключения
            schema_name = os.environ.get('MAIN_DB_SCHEMA', 'public')
            dsn_with_schema = f"{dsn} options='-c search_path={schema_name}'"
            
            conn = psycopg2.connect(dsn_with_schema)
            cur = conn.cursor()
            
            cur.execute("""
                UPDATE users
                SET avatar_url = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (avatar_url, int(user_id)))
            
            conn.commit()
            cur.close()
            conn.close()
        except Exception as db_error:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Database error: {str(db_error)}'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'avatar_url': avatar_url
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