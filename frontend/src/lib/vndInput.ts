export function digitsOnlyMoney(s: string): string {
  return s.replace(/\D/g, "");
}

export function parseVndIntegerInput(s: string): number {
  const d = digitsOnlyMoney(s);
  if (!d) return NaN;
  const n = Number(d);
  return Number.isFinite(n) ? n : NaN;
}

export function formatVndIntegerForInput(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  return Math.trunc(n).toLocaleString("vi-VN");
}
