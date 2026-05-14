import axios from "axios";

function loiTuPhanHoi(err: unknown): string | null {
  const loi = (err as { response?: { data?: { loi?: string } } })?.response
    ?.data?.loi;
  if (typeof loi === "string" && loi.trim()) return loi.trim();
  return null;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const tuApi = loiTuPhanHoi(err);
  if (tuApi) return tuApi;

  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const fb = (fallback ?? "").trim() || "Đã xảy ra lỗi.";
    if (status === 401) {
      return "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập.";
    }
    if (status === 403) {
      return `${fb} Bạn không đủ quyền hoặc phiên đăng nhập không hợp lệ — hãy thử đăng nhập lại bằng tài khoản phù hợp.`;
    }
    if (status === 404) {
      return `${fb} Không tìm thấy dữ liệu trên máy chủ.`;
    }
    if (status != null && status >= 500) {
      return `${fb} Máy chủ đang gặp sự cố, vui lòng thử lại sau.`;
    }
    if (!err.response) {
      return `${fb} Không kết nối được máy chủ.`;
    }
  }

  if (err instanceof Error && err.message.trim()) {
    const msg = err.message.trim();
    if (
      msg.startsWith("Request failed with status code") ||
      msg === "Network Error"
    ) {
      return (fallback ?? "").trim() || "Đã xảy ra lỗi.";
    }
    return msg;
  }
  return (fallback ?? "").trim() || "Đã xảy ra lỗi.";
}
