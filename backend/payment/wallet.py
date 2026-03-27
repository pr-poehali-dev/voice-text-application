"""Модуль для работы с общим кошельком через API maxisoftzab.ru"""
import os
import requests

WALLET_FUNCTION_URL = "https://functions.poehali.dev/8a886097-3bd9-4d94-8c19-d19ca3f3acbd"


def _headers() -> dict:
    return {
        "X-Api-Key": os.environ.get("MAXISOFTZAB_API_KEY", ""),
        "Content-Type": "application/json"
    }


def get_balance(email: str) -> dict:
    """Получает баланс кошелька пользователя по email"""
    resp = requests.get(
        WALLET_FUNCTION_URL,
        params={"action": "balance", "email": email},
        headers=_headers(),
        timeout=10
    )
    resp.raise_for_status()
    data = resp.json()
    return {
        "balance": float(data.get("balance", 0)),
        "currency": "RUB"
    }


def charge_balance(email: str, amount: float, plan: str) -> dict:
    """Списывает средства с общего кошелька за тариф"""
    resp = requests.post(
        WALLET_FUNCTION_URL,
        params={"action": "deduct"},
        json={
            "email": email,
            "amount": amount,
            "description": f"Тариф {plan}"
        },
        headers=_headers(),
        timeout=10
    )
    data = resp.json()

    if not data.get("success"):
        raise ValueError(data.get("error", "Ошибка списания средств"))

    return {
        "new_balance": float(data.get("balance", 0)),
        "amount_charged": amount
    }
