export function soDienThoaiTelHref(
  raw: string | undefined | null,
): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  const compact = t.replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(compact)) return null;
  return `tel:${compact}`;
}

function chuSoQuocTeKhongDau(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  let s = t.replace(/[\s().-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (!/^[0-9]{8,15}$/.test(s)) return null;
  if (s.startsWith("0")) s = `84${s.slice(1)}`;
  return s;
}

export function soDienThoaiZaloMeHref(
  raw: string | undefined | null,
): string | null {
  const s = chuSoQuocTeKhongDau(raw);
  if (!s || !s.startsWith("84")) return null;
  if (!/^84\d{9}$/.test(s)) return null;
  return `https://zalo.me/${s}`;
}
