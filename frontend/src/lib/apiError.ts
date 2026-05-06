export function apiErrorMessage(err: unknown, fallback: string): string {
  const fromApi = (err as { response?: { data?: { error?: string } } })?.response
    ?.data?.error;
  if (typeof fromApi === "string" && fromApi.trim()) return fromApi.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return fallback;
}
