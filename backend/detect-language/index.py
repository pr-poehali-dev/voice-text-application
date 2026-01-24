import json
import os
import requests

def handler(event: dict, context) -> dict:
    """
    Определение языка текста через Yandex Translate API.
    Возвращает код языка и уровень уверенности.
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
        
        api_key = os.environ.get('YANDEX_TRANSLATE_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API ключ Yandex Translate не настроен'}),
                'isBase64Encoded': False
            }
        
        url = 'https://translate.api.cloud.yandex.net/translate/v2/detectLanguage'
        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'text': text,
            'languageCodeHints': ['ru', 'en', 'de', 'fr', 'es', 'it', 'tr', 'uz', 'kk']
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code != 200:
            error_text = response.text
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Ошибка Yandex Translate API: {error_text}'
                }),
                'isBase64Encoded': False
            }
        
        result = response.json()
        detected_language = result.get('languageCode', 'ru')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'language': detected_language
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
