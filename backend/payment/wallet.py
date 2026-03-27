"""Модуль для работы с общим кошельком через API maxisoftzab.ru"""
import os
import requests

WALLET_BASE_URL = "https://maxisoftzab.ru/api/wallet"


def _headers() -> dict:
    return {
        "X-API-Key": os.environ.get("MAXISOFTZAB_API_KEY", ""),
        "Content-Type": "application/json"
    }


def get_balance(email: str) -> dict:
    """Получает баланс кошелька пользователя по email"""
    resp = requests.get(
        f"{WALLET_BASE_URL}/balance",
        params={"email": email},
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
        f"{WALLET_BASE_URL}/charge",
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
