import json
import os
import requests

def handler(event: dict, context) -> dict:
    """
    Перевод текста через Yandex Translate API.
    Поддерживает автоопределение языка, обычный и технический перевод с глоссарием.
    Технический режим использует специализированные термины для документации по охране труда.
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
        target_language = body.get('targetLanguage', 'en')
        source_language = body.get('sourceLanguage', 'auto')
        is_technical = body.get('technical', False)  # Флаг технического перевода
        
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
        
        url = 'https://translate.api.cloud.yandex.net/translate/v2/translate'
        headers = {
            'Authorization': f'Api-Key {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'texts': [text],
            'targetLanguageCode': target_language,
            'format': 'PLAIN_TEXT'
        }
        
        if source_language != 'auto':
            payload['sourceLanguageCode'] = source_language
        
        # Если включен технический режим, применяем глоссарий терминов
        if is_technical:
            glossary_pairs = get_technical_glossary(target_language)
            if glossary_pairs:
                payload['glossaryConfig'] = {
                    'glossaryData': {
                        'glossaryPairs': glossary_pairs
                    }
                }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
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
        
        if 'translations' not in result or not result['translations']:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Не удалось получить перевод'}),
                'isBase64Encoded': False
            }
        
        translation = result['translations'][0]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'translated_text': translation['text'],
                'detected_language': translation.get('detectedLanguageCode', source_language),
                'target_language': target_language,
                'translation_type': 'technical' if is_technical else 'standard'
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


def get_technical_glossary(target_language: str) -> list:
    """
    Возвращает глоссарий технических терминов для заданного языка.
    Термины охраны труда, технологических процессов и производственных инструкций.
    """
    glossaries = {
        'en': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'personal protective equipment (PPE)'},
            {'sourceText': 'СИЗ', 'translatedText': 'PPE'},
            {'sourceText': 'охрана труда', 'translatedText': 'occupational safety'},
            {'sourceText': 'техника безопасности', 'translatedText': 'safety regulations'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'operating instruction'},
            {'sourceText': 'технологический процесс', 'translatedText': 'technological process'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'emergency stop'},
            {'sourceText': 'предохранительное устройство', 'translatedText': 'safety device'},
            {'sourceText': 'защитное заземление', 'translatedText': 'protective grounding'},
            {'sourceText': 'огнетушитель', 'translatedText': 'fire extinguisher'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'emergency exit'},
            {'sourceText': 'производственная травма', 'translatedText': 'occupational injury'},
            {'sourceText': 'вредные производственные факторы', 'translatedText': 'occupational hazards'},
            {'sourceText': 'предельно допустимая концентрация', 'translatedText': 'maximum allowable concentration (MAC)'},
            {'sourceText': 'ПДК', 'translatedText': 'MAC'},
            {'sourceText': 'спецодежда', 'translatedText': 'work clothing'},
            {'sourceText': 'респиратор', 'translatedText': 'respirator'},
            {'sourceText': 'защитные очки', 'translatedText': 'safety goggles'},
            {'sourceText': 'каска', 'translatedText': 'hard hat'},
            {'sourceText': 'наряд-допуск', 'translatedText': 'work permit'},
            {'sourceText': 'инструктаж по технике безопасности', 'translatedText': 'safety briefing'},
            {'sourceText': 'знаки безопасности', 'translatedText': 'safety signs'},
            {'sourceText': 'первая помощь', 'translatedText': 'first aid'},
            {'sourceText': 'несчастный случай', 'translatedText': 'accident'},
            {'sourceText': 'профессиональное заболевание', 'translatedText': 'occupational disease'},
            {'sourceText': 'рабочее место', 'translatedText': 'workplace'},
            {'sourceText': 'условия труда', 'translatedText': 'working conditions'},
            {'sourceText': 'режим труда и отдыха', 'translatedText': 'work and rest schedule'}
        ],
        'de': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'persönliche Schutzausrüstung (PSA)'},
            {'sourceText': 'СИЗ', 'translatedText': 'PSA'},
            {'sourceText': 'охрана труда', 'translatedText': 'Arbeitsschutz'},
            {'sourceText': 'техника безопасности', 'translatedText': 'Sicherheitsvorschriften'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'Betriebsanweisung'},
            {'sourceText': 'технологический процесс', 'translatedText': 'technologischer Prozess'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'Not-Aus'},
            {'sourceText': 'предохранительное устройство', 'translatedText': 'Schutzeinrichtung'},
            {'sourceText': 'защитное заземление', 'translatedText': 'Schutzerdung'},
            {'sourceText': 'огнетушитель', 'translatedText': 'Feuerlöscher'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'Notausgang'},
            {'sourceText': 'производственная травма', 'translatedText': 'Arbeitsunfall'},
            {'sourceText': 'спецодежда', 'translatedText': 'Arbeitskleidung'},
            {'sourceText': 'респиратор', 'translatedText': 'Atemschutzgerät'},
            {'sourceText': 'защитные очки', 'translatedText': 'Schutzbrille'},
            {'sourceText': 'каска', 'translatedText': 'Schutzhelm'},
            {'sourceText': 'наряд-допуск', 'translatedText': 'Arbeitserlaubnis'},
            {'sourceText': 'первая помощь', 'translatedText': 'Erste Hilfe'},
            {'sourceText': 'рабочее место', 'translatedText': 'Arbeitsplatz'}
        ],
        'fr': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'équipement de protection individuelle (EPI)'},
            {'sourceText': 'СИЗ', 'translatedText': 'EPI'},
            {'sourceText': 'охрана труда', 'translatedText': 'sécurité au travail'},
            {'sourceText': 'техника безопасности', 'translatedText': 'consignes de sécurité'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'instruction de travail'},
            {'sourceText': 'технологический процесс', 'translatedText': 'procédé technologique'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'arrêt d\'urgence'},
            {'sourceText': 'предохранительное устройство', 'translatedText': 'dispositif de sécurité'},
            {'sourceText': 'защитное заземление', 'translatedText': 'mise à la terre de protection'},
            {'sourceText': 'огнетушитель', 'translatedText': 'extincteur'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'sortie de secours'},
            {'sourceText': 'спецодежда', 'translatedText': 'vêtements de travail'},
            {'sourceText': 'респиратор', 'translatedText': 'appareil respiratoire'},
            {'sourceText': 'защитные очки', 'translatedText': 'lunettes de protection'},
            {'sourceText': 'каска', 'translatedText': 'casque de protection'},
            {'sourceText': 'первая помощь', 'translatedText': 'premiers secours'}
        ],
        'es': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'equipo de protección individual (EPI)'},
            {'sourceText': 'СИЗ', 'translatedText': 'EPI'},
            {'sourceText': 'охрана труда', 'translatedText': 'seguridad laboral'},
            {'sourceText': 'техника безопасности', 'translatedText': 'normas de seguridad'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'instrucción de trabajo'},
            {'sourceText': 'технологический процесс', 'translatedText': 'proceso tecnológico'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'parada de emergencia'},
            {'sourceText': 'предохранительное устройство', 'translatedText': 'dispositivo de seguridad'},
            {'sourceText': 'защитное заземление', 'translatedText': 'toma de tierra de protección'},
            {'sourceText': 'огнетушитель', 'translatedText': 'extintor'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'salida de emergencia'},
            {'sourceText': 'спецодежда', 'translatedText': 'ropa de trabajo'},
            {'sourceText': 'респиратор', 'translatedText': 'respirador'},
            {'sourceText': 'защитные очки', 'translatedText': 'gafas de seguridad'},
            {'sourceText': 'каска', 'translatedText': 'casco de seguridad'}
        ],
        'zh': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': '个人防护装备 (PPE)'},
            {'sourceText': 'СИЗ', 'translatedText': 'PPE'},
            {'sourceText': 'охрана труда', 'translatedText': '劳动保护'},
            {'sourceText': 'техника безопасности', 'translatedText': '安全技术'},
            {'sourceText': 'производственная инструкция', 'translatedText': '生产指令'},
            {'sourceText': 'технологический процесс', 'translatedText': '工艺流程'},
            {'sourceText': 'аварийная остановка', 'translatedText': '紧急停止'},
            {'sourceText': 'предохранительное устройство', 'translatedText': '保护装置'},
            {'sourceText': 'защитное заземление', 'translatedText': '保护接地'},
            {'sourceText': 'огнетушитель', 'translatedText': '灭火器'},
            {'sourceText': 'эвакуационный выход', 'translatedText': '紧急出口'},
            {'sourceText': 'спецодежда', 'translatedText': '工作服'},
            {'sourceText': 'респиратор', 'translatedText': '呼吸器'},
            {'sourceText': 'защитные очки', 'translatedText': '护目镜'},
            {'sourceText': 'каска', 'translatedText': '安全帽'}
        ],
        'ja': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': '個人用保護具 (PPE)'},
            {'sourceText': 'СИЗ', 'translatedText': 'PPE'},
            {'sourceText': 'охрана труда', 'translatedText': '労働安全'},
            {'sourceText': 'техника безопасности', 'translatedText': '安全規則'},
            {'sourceText': 'производственная инструкция', 'translatedText': '作業指示書'},
            {'sourceText': 'технологический процесс', 'translatedText': '技術プロセス'},
            {'sourceText': 'аварийная остановка', 'translatedText': '緊急停止'},
            {'sourceText': 'огнетушитель', 'translatedText': '消火器'},
            {'sourceText': 'эвакуационный выход', 'translatedText': '非常口'},
            {'sourceText': 'спецодежда', 'translatedText': '作業服'},
            {'sourceText': 'каска', 'translatedText': 'ヘルメット'}
        ],
        'ko': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': '개인 보호 장비 (PPE)'},
            {'sourceText': 'СИЗ', 'translatedText': 'PPE'},
            {'sourceText': 'охрана труда', 'translatedText': '산업 안전'},
            {'sourceText': 'техника безопасности', 'translatedText': '안전 규정'},
            {'sourceText': 'производственная инструкция', 'translatedText': '작업 지침'},
            {'sourceText': 'технологический процесс', 'translatedText': '기술 프로세스'},
            {'sourceText': 'аварийная остановка', 'translatedText': '비상 정지'},
            {'sourceText': 'огнетушитель', 'translatedText': '소화기'},
            {'sourceText': 'эвакуационный выход', 'translatedText': '비상구'}
        ],
        'it': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'dispositivi di protezione individuale (DPI)'},
            {'sourceText': 'СИЗ', 'translatedText': 'DPI'},
            {'sourceText': 'охрана труда', 'translatedText': 'sicurezza sul lavoro'},
            {'sourceText': 'техника безопасности', 'translatedText': 'norme di sicurezza'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'istruzione operativa'},
            {'sourceText': 'технологический процесс', 'translatedText': 'processo tecnologico'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'arresto di emergenza'},
            {'sourceText': 'огнетушитель', 'translatedText': 'estintore'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'uscita di emergenza'}
        ],
        'pt': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'equipamento de proteção individual (EPI)'},
            {'sourceText': 'СИЗ', 'translatedText': 'EPI'},
            {'sourceText': 'охрана труда', 'translatedText': 'segurança do trabalho'},
            {'sourceText': 'техника безопасности', 'translatedText': 'normas de segurança'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'instrução de trabalho'},
            {'sourceText': 'технологический процесс', 'translatedText': 'processo tecnológico'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'parada de emergência'},
            {'sourceText': 'огнетушитель', 'translatedText': 'extintor'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'saída de emergência'}
        ],
        'tr': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'kişisel koruyucu ekipman (KKE)'},
            {'sourceText': 'СИЗ', 'translatedText': 'KKE'},
            {'sourceText': 'охрана труда', 'translatedText': 'iş güvenliği'},
            {'sourceText': 'техника безопасности', 'translatedText': 'güvenlik kuralları'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'çalışma talimatı'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'acil durdurma'},
            {'sourceText': 'огнетушитель', 'translatedText': 'yangın söndürücü'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'acil çıkış'}
        ],
        'pl': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'środki ochrony indywidualnej (ŚOI)'},
            {'sourceText': 'СИЗ', 'translatedText': 'ŚOI'},
            {'sourceText': 'охрана труда', 'translatedText': 'bezpieczeństwo pracy'},
            {'sourceText': 'техника безопасности', 'translatedText': 'zasady bezpieczeństwa'},
            {'sourceText': 'производственная инструкция', 'translatedText': 'instrukcja robocza'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'zatrzymanie awaryjne'},
            {'sourceText': 'огнетушитель', 'translatedText': 'gaśnica'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'wyjście ewakuacyjne'}
        ],
        'ar': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'معدات الحماية الشخصية (PPE)'},
            {'sourceText': 'СИЗ', 'translatedText': 'PPE'},
            {'sourceText': 'охрана труда', 'translatedText': 'السلامة المهنية'},
            {'sourceText': 'техника безопасности', 'translatedText': 'لوائح السلامة'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'إيقاف الطوارئ'},
            {'sourceText': 'огнетушитель', 'translatedText': 'طفاية حريق'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'مخرج الطوارئ'}
        ],
        'kk': [
            {'sourceText': 'средства индивидуальной защиты', 'translatedText': 'жеке қорғану құралдары (ЖҚҚ)'},
            {'sourceText': 'СИЗ', 'translatedText': 'ЖҚҚ'},
            {'sourceText': 'охрана труда', 'translatedText': 'еңбек қорғау'},
            {'sourceText': 'техника безопасности', 'translatedText': 'қауіпсіздік техникасы'},
            {'sourceText': 'аварийная остановка', 'translatedText': 'авариялық тоқтату'},
            {'sourceText': 'огнетушитель', 'translatedText': 'өрт сөндіргіш'},
            {'sourceText': 'эвакуационный выход', 'translatedText': 'эвакуациялық шығу'}
        ]
    }
    
    return glossaries.get(target_language, [])