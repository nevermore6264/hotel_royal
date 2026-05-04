export function tenTrangThaiDatPhong(ma?: string): string {
  const m: Record<string, string> = {
    CHO_DUYET: "Chờ duyệt",
    DA_XAC_NHAN: "Đã xác nhận",
    DA_NHAN_PHONG: "Đã nhận phòng",
    DA_TRA_PHONG: "Đã trả phòng",
    DA_HUY: "Đã hủy",
  };
  return ma ? m[ma] ?? ma : "—";
}

export function tenTrangThaiThanhToan(ma?: string): string {
  const m: Record<string, string> = {
    CHUA_THANH_TOAN: "Chưa thanh toán",
    DAT_COC: "Đã đặt cọc",
    THANH_TOAN_MOT_PHAN: "Thanh toán một phần",
    DA_THANH_TOAN: "Đã thanh toán",
    THAT_BAI: "Thất bại",
    DA_HOAN_TIEN: "Đã hoàn tiền",
    HOAN_TIEN_MOT_PHAN: "Hoàn tiền một phần",
  };
  return ma ? m[ma] ?? ma : "—";
}

export function tenTrangThaiChiTietPhong(ma?: string): string {
  const m: Record<string, string> = {
    DANG_GIU: "Đang giữ",
    DA_XAC_NHAN: "Đã xác nhận",
    DA_HUY: "Đã hủy",
    DA_NHAN_PHONG: "Đã nhận phòng",
    DA_TRA_PHONG: "Đã trả phòng",
  };
  return ma ? m[ma] ?? ma : "—";
}

export function classBadgeDatPhong(ma?: string): string {
  switch (ma) {
    case "CHO_DUYET":
      return "badge badge--state-warn";
    case "DA_XAC_NHAN":
      return "badge badge--state-info";
    case "DA_NHAN_PHONG":
      return "badge badge--state-ok";
    case "DA_TRA_PHONG":
      return "badge badge--state-muted";
    case "DA_HUY":
      return "badge badge--state-bad";
    default:
      return "badge";
  }
}

export function classBadgeThanhToan(ma?: string): string {
  switch (ma) {
    case "DA_THANH_TOAN":
      return "badge badge--state-ok";
    case "CHUA_THANH_TOAN":
      return "badge badge--state-warn";
    case "THAT_BAI":
      return "badge badge--state-bad";
    case "DA_HOAN_TIEN":
    case "HOAN_TIEN_MOT_PHAN":
      return "badge badge--state-muted";
    default:
      return "badge badge--state-info";
  }
}
