import json
import os
import requests
import uuid
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Синтез речи из текста через Yandex SpeechKit.
    Преобразует текст в аудио, сохраняет в S3 и возвращает ссылку.
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
        text = body.get('text', '').strip()
        voice = body.get('voice', 'alena')
        speed = body.get('speed', 1.0)
        format_type = body.get('format', 'mp3')
        user_id = body.get('userId')
        
        if not text:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Текст не может быть пустым'}),
                'isBase64Encoded': False
            }
        
        if len(text) > 5000:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Текст слишком длинный (максимум 5000 символов)'}),
                'isBase64Encoded': False
            }
        
        api_key = os.environ.get('YANDEX_SPEECHKIT_API_KEY')
        folder_id = os.environ.get('YANDEX_FOLDER_ID')
        
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API ключ Yandex SpeechKit не настроен'}),
                'isBase64Encoded': False
            }
        
        if not folder_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'YANDEX_FOLDER_ID не настроен'}),
                'isBase64Encoded': False
            }
        
        url = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'
        headers = {
            'Authorization': f'Api-Key {api_key}'
        }
        
        format_map = {
            'mp3': 'mp3',
            'wav': 'lpcm',
            'ogg': 'oggopus'
        }
        
        data = {
            'text': text,
            'voice': voice,
            'speed': str(speed),
            'format': format_map.get(format_type, 'mp3'),
            'sampleRateHertz': '48000',
            'folderId': folder_id
        }
        
        response = requests.post(url, headers=headers, data=data, timeout=30)
        
        if response.status_code != 200:
            error_text = response.text
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Ошибка Yandex API: {error_text}'
                }),
                'isBase64Encoded': False
            }
        
        audio_data = response.content
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_key = f'voice/{user_id or "anonymous"}/{timestamp}_{file_id}.{format_type}'
        
        content_types = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg'
        }
        
        s3.put_object(
            Bucket='files',
            Key=file_key,
            Body=audio_data,
            ContentType=content_types.get(format_type, 'audio/mpeg')
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'audio_url': cdn_url,
                'format': format_type,
                'character_count': len(text),
                'voice': voice
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
                'error': f'Внутренняя ошибка: {str(e)}'
            }),
            'isBase64Encoded': False
        }