"""Модуль для работы с кошельками пользователей"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os


def get_db_connection():
    """Создает подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def get_or_create_wallet(user_id: int) -> dict:
    """Получает или создает кошелек пользователя"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT id, user_id, balance, currency, created_at, updated_at
            FROM wallets
            WHERE user_id = %s
        """, (user_id,))
        
        wallet = cur.fetchone()
        
        if not wallet:
            cur.execute("""
                INSERT INTO wallets (user_id, balance, currency)
                VALUES (%s, 0.00, 'RUB')
                RETURNING id, user_id, balance, currency, created_at, updated_at
            """, (user_id,))
            wallet = cur.fetchone()
            conn.commit()
        
        return {
            'id': wallet['id'],
            'user_id': wallet['user_id'],
            'balance': float(wallet['balance']),
            'currency': wallet['currency'],
            'created_at': wallet['created_at'].isoformat(),
            'updated_at': wallet['updated_at'].isoformat()
        }
    finally:
        cur.close()
        conn.close()


def add_balance(user_id: int, amount: float, transaction_type: str = 'deposit', plan: str = None) -> dict:
    """Добавляет средства на баланс пользователя"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем существование кошелька
        cur.execute("SELECT id FROM wallets WHERE user_id = %s", (user_id,))
        wallet = cur.fetchone()
        
        if not wallet:
            cur.execute("""
                INSERT INTO wallets (user_id, balance, currency)
                VALUES (%s, 0.00, 'RUB')
            """, (user_id,))
        
        # Создаем транзакцию
        cur.execute("""
            INSERT INTO transactions (user_id, amount, type, plan, status)
            VALUES (%s, %s, %s, %s, 'completed')
            RETURNING id
        """, (user_id, amount, transaction_type, plan))
        
        transaction_id = cur.fetchone()['id']
        
        # Обновляем баланс
        cur.execute("""
            UPDATE wallets
            SET balance = balance + %s, updated_at = NOW()
            WHERE user_id = %s
            RETURNING balance
        """, (amount, user_id))
        
        new_balance = cur.fetchone()['balance']
        conn.commit()
        
        return {
            'transaction_id': transaction_id,
            'new_balance': float(new_balance)
        }
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def charge_balance(user_id: int, amount: float, plan: str) -> dict:
    """Списывает средства с баланса пользователя за тариф"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Проверяем баланс
        cur.execute("SELECT balance FROM wallets WHERE user_id = %s", (user_id,))
        wallet = cur.fetchone()
        
        if not wallet:
            # Создаем кошелек с нулевым балансом
            cur.execute("""
                INSERT INTO wallets (user_id, balance, currency)
                VALUES (%s, 0.00, 'RUB')
            """, (user_id,))
            conn.commit()
            raise ValueError(f'Недостаточно средств. Требуется: {amount}, доступно: 0')
        
        balance = float(wallet['balance'])
        
        if balance < amount:
            raise ValueError(f'Недостаточно средств. Требуется: {amount}, доступно: {balance}')
        
        # Создаем транзакцию списания
        cur.execute("""
            INSERT INTO transactions (user_id, amount, type, plan, status)
            VALUES (%s, %s, 'charge', %s, 'completed')
            RETURNING id
        """, (user_id, -amount, plan))
        
        transaction_id = cur.fetchone()['id']
        
        # Списываем средства
        cur.execute("""
            UPDATE wallets
            SET balance = balance - %s, updated_at = NOW()
            WHERE user_id = %s
            RETURNING balance
        """, (amount, user_id))
        
        new_balance = cur.fetchone()['balance']
        conn.commit()
        
        return {
            'transaction_id': transaction_id,
            'new_balance': float(new_balance),
            'amount_charged': amount
        }
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()


def get_transactions(user_id: int, limit: int = 10) -> list:
    """Получает историю транзакций пользователя"""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT id, amount, type, plan, status, payment_id, created_at
            FROM transactions
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """, (user_id, limit))
        
        transactions = cur.fetchall()
        
        return [
            {
                'id': t['id'],
                'amount': float(t['amount']),
                'type': t['type'],
                'plan': t['plan'],
                'status': t['status'],
                'payment_id': t['payment_id'],
                'created_at': t['created_at'].isoformat()
            } for t in transactions
        ]
    finally:
        cur.close()
        conn.close()
