function pad2(v: number): string {
  return String(v).padStart(2, "0");
}

function parseNgay(raw?: string): Date | null {
  if (!raw) return null;
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m = raw.match(isoDateOnly);
  if (m) {
    const [, y, mo, d] = m;
    return new Date(Number(y), Number(mo) - 1, Number(d));
  }
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatNgayVN(raw?: string): string {
  const dt = parseNgay(raw);
  if (!dt) return raw || "—";
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

export function formatNgayGioVN(raw?: string): string {
  const dt = parseNgay(raw);
  if (!dt) return raw || "—";
  return `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

