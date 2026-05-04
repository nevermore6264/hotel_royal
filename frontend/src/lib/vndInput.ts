/** Lấy chuỗi chỉ gồm chữ số từ ô nhập tiền (cho phép dán "1.850.000", "1,850,000"…). */
export function digitsOnlyMoney(s: string): string {
  return s.replace(/\D/g, "");
}

/** Chuỗi đang gõ → số nguyên VND; rỗng hoặc không hợp lệ → NaN. */
export function parseVndIntegerInput(s: string): number {
  const d = digitsOnlyMoney(s);
  if (!d) return NaN;
  const n = Number(d);
  return Number.isFinite(n) ? n : NaN;
}

/** Hiển thị trong ô nhập: phân tách hàng nghìn bằng dấu chấm (vi-VN). */
export function formatVndIntegerForInput(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  return Math.trunc(n).toLocaleString("vi-VN");
}
