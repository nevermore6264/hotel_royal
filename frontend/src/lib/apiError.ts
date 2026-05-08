export function apiErrorMessage(err: unknown, fallback: string): string {
  const fromApi = (err as { response?: { data?: { loi?: string } } })?.response
    ?.data?.loi;
  if (typeof fromApi === "string" && fromApi.trim()) return fromApi.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return fallback;
}
