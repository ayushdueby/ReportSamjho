import { useState } from 'react';

const FREE_LIMIT = 3;
const STORAGE_COUNT = 'rs_usage_count';
const STORAGE_PAID  = 'rs_paid';

export default function useUsageTracker() {
  const [count, setCount] = useState(() => {
    const v = localStorage.getItem(STORAGE_COUNT);
    return v ? parseInt(v, 10) : 0;
  });

  const [paid, setPaid] = useState(() => localStorage.getItem(STORAGE_PAID) === 'true');

  const canAnalyse  = paid || count < FREE_LIMIT;
  const remaining   = paid ? null : Math.max(0, FREE_LIMIT - count);
  const isLimitHit  = !paid && count >= FREE_LIMIT;

  const recordUsage = () => {
    const next = count + 1;
    setCount(next);
    localStorage.setItem(STORAGE_COUNT, String(next));
  };

  const markPaid = () => {
    setPaid(true);
    localStorage.setItem(STORAGE_PAID, 'true');
  };

  return { count, paid, canAnalyse, remaining, isLimitHit, recordUsage, markPaid };
}
