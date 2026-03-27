import { useState, useEffect } from "react";
import type { User } from "@/pages/Index";

const PAYMENT_URL = "https://functions.poehali.dev/a1399ab9-d55c-4f0b-8429-284aec5aa2c8";
const PAID_PLANS = ['basic', 'pro', 'unlimited'];
const GRACE_PERIOD_DAYS = 1;

export interface PlanStatus {
  planExpiresAt: string | null;
  daysLeft: number | null;
  isExpired: boolean;
  isBlocked: boolean;
  isWarning: boolean;
}

export function usePlanStatus(user: User | null): PlanStatus {
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !PAID_PLANS.includes(user.plan) || user.isDemo) return;
    fetch(`${PAYMENT_URL}?action=subscription`, {
      headers: { 'X-User-Id': String(user.id), 'X-User-Email': user.email }
    })
      .then(r => r.json())
      .then(data => {
        if (!data.error && data.plan_expires_at) {
          setPlanExpiresAt(data.plan_expires_at);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  if (!user || !PAID_PLANS.includes(user.plan) || user.isDemo) {
    return { planExpiresAt: null, daysLeft: null, isExpired: false, isBlocked: false, isWarning: false };
  }

  const daysLeft = planExpiresAt
    ? Math.ceil((new Date(planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isBlocked = daysLeft !== null && daysLeft < -GRACE_PERIOD_DAYS;
  const isWarning = daysLeft !== null && daysLeft <= 7 && !isBlocked;

  return { planExpiresAt, daysLeft, isExpired, isBlocked, isWarning };
}
