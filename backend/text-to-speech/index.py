import json
import os
import requests
import uuid
import boto3
import re
import psycopg2
from datetime import datetime
from io import BytesIO

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
        voice_input = body.get('voice', 'alena')
        speed = body.get('speed', 1.0)
        format_type = body.get('format', 'mp3')
        user_id = body.get('userId')
        
        # Маппинг имён голосов на реальные идентификаторы Yandex API
        voice_map = {
            # Премиум голоса
            'dasha': 'dasha',
            'julia': 'julia',
            'lera': 'lera',
            'alexander': 'alexander',
            # Бесплатные голоса
            'alena': 'alena',
            'filipp': 'filipp',
            'ermil': 'ermil',
            'jane': 'jane',
            'omazh': 'omazh',
            'zahar': 'zahar',
            'john': 'john',
            'jane-en': 'jane',
            'madirus': 'madirus',
            'lea': 'lea',
            'bruno': 'bruno',
            'amira': 'amira',
            'nigora': 'nigora',
            'madi': 'madi',
            'aylin': 'aylin'
        }
        
        voice = voice_map.get(voice_input, voice_input)
        
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
                'body': json.dumps({'error': 'Текст слишком длинный (максимум 5000 символов). Разбейте на несколько частей.'}),
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
        
        # Разбиваем текст на части по 1000 символов по границам предложений
        def split_text(text, max_chars=1000):
            sentences = re.split(r'(?<=[.!?])\s+', text)
            chunks = []
            current_chunk = ''
            
            for sentence in sentences:
                if len(current_chunk) + len(sentence) <= max_chars:
                    current_chunk += sentence + ' '
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence + ' '
            
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            return chunks
        
        text_chunks = split_text(text, max_chars=500)
        audio_chunks = []
        
        # Синтезируем каждую часть
        for chunk in text_chunks:
            data = {
                'text': chunk,
                'voice': voice,
                'speed': str(speed),
                'format': format_map.get(format_type, 'mp3'),
                'sampleRateHertz': '48000',
                'folderId': folder_id
            }
            
            response = requests.post(url, headers=headers, data=data, timeout=10)
            
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
            
            audio_chunks.append(response.content)
        
        # Склеиваем аудио части (для MP3 просто конкатенация)
        audio_data = b''.join(audio_chunks)
        
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
        
        # Примерная длительность аудио: 150 слов в минуту = 2.5 слова в секунду
        word_count = len(text.split())
        audio_duration = int((word_count / 2.5) / speed)
        
        # Сохраняем проект и обновляем статистику
        limit_was_reset = False
        if user_id:
            try:
                dsn = os.environ.get('DATABASE_URL')
                if not dsn:
                    raise Exception('DATABASE_URL не настроен')
                
                # Добавляем схему в строку подключения
                schema_name = os.environ.get('MAIN_DB_SCHEMA', 'public')
                dsn_with_schema = f"{dsn} options='-c search_path={schema_name}'"
                
                conn = psycopg2.connect(dsn_with_schema)
                cur = conn.cursor()
                
                # Проверяем и сбрасываем лимит если начался новый месяц
                cur.execute("""
                    SELECT usage_reset_date, characters_used
                    FROM users
                    WHERE id = %s
                """, (user_id,))
                    
                    user_data = cur.fetchone()
                    if user_data:
                        last_reset = user_data[0]
                        current_date = datetime.now().date()
                        
                        # Если прошел месяц с последнего сброса, сбрасываем счетчик
                        if last_reset:
                            from datetime import date
                            # Проверяем, что текущий месяц больше месяца последнего сброса
                            if current_date.month != last_reset.month or current_date.year != last_reset.year:
                                cur.execute("""
                                    UPDATE users
                                    SET characters_used = 0, usage_reset_date = CURRENT_DATE
                                    WHERE id = %s
                                """, (user_id,))
                                limit_was_reset = True
                    
                    # Генерируем название проекта из первых слов текста
                    title_words = text.split()[:5]
                    title = ' '.join(title_words) + ('...' if len(text.split()) > 5 else '')
                    
                    # Сохраняем проект
                    cur.execute("""
                        INSERT INTO projects (user_id, title, text, audio_url, voice, speed, format, character_count, audio_duration)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (user_id, title, text, cdn_url, voice, speed, format_type, len(text), audio_duration))
                    
                    # Обновляем статистику пользователя
                    cur.execute("""
                        INSERT INTO user_stats (user_id, total_generations, total_characters, total_projects, total_audio_duration)
                        VALUES (%s, 1, %s, 1, %s)
                        ON CONFLICT (user_id) DO UPDATE SET
                            total_generations = user_stats.total_generations + 1,
                            total_characters = user_stats.total_characters + %s,
                            total_projects = user_stats.total_projects + 1,
                            total_audio_duration = user_stats.total_audio_duration + %s
                    """, (user_id, len(text), audio_duration, len(text), audio_duration))
                    
                    # Обновляем использованные символы пользователя
                    cur.execute("""
                        UPDATE users 
                        SET characters_used = characters_used + %s
                        WHERE id = %s
                    """, (len(text), user_id))
                    
                    conn.commit()
                    cur.close()
                    conn.close()
            except Exception as db_error:
                print(f'Database error: {db_error}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': f'Ошибка сохранения: {str(db_error)}. Пожалуйста, обратитесь к администратору.'
                    }),
                    'isBase64Encoded': False
                }
        
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
                'voice': voice,
                'audio_duration': audio_duration,
                'limit_reset': limit_was_reset
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