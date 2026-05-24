import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import api from "../api/client";
import { apiErrorMessage } from "../lib/apiError";

export type DongKetQuaExcel = {
  soDongExcel: number;
  thanhCong: boolean;
  loi: string | null;
  idDatPhong?: number | null;
  hoTenDong?: string | null;
  lienHeDong?: string | null;
  yeuCauPhongNgayDong?: string | null;
  soPhongDaGan?: string | null;
  goiYLoaiPhong?: string | null;
};

export type KetQuaNhapExcel = {
  tongHang: number;
  soThanhCong: number;
  soThatBai: number;
  datTheoNhom?: boolean;
  idDatPhongNhom?: number | null;
  thongDiepTong?: string | null;
  goiYChung?: string | null;
  chiTiet: DongKetQuaExcel[];
};

type Props = {
  variant: "khach" | "leTan";
  cheDoThanhToanPayOs?: "TOAN_BO" | "DAT_COC";
  onSauKhiNhapLeTan?: () => void;
};

async function taiXuongMau(variant: Props["variant"]) {
  const path =
    variant === "leTan" ? "/dat-phong/mau-excel-le-tan" : "/dat-phong/mau-excel-khach";
  const res = await api.get(path, { responseType: "blob" });
  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    variant === "leTan" ? "mau-dat-phong-le-tan.xlsx" : "mau-dat-phong-khach.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function BangDatPhongExcel({
  variant,
  cheDoThanhToanPayOs = "TOAN_BO",
  onSauKhiNhapLeTan,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [baoLoi, setBaoLoi] = useState("");
  const [ketQua, setKetQua] = useState<KetQuaNhapExcel | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const taiMau = async () => {
    setBaoLoi("");
    setBusy(true);
    try {
      await taiXuongMau(variant);
    } catch (e) {
      setBaoLoi(apiErrorMessage(e, "Không tải được file mẫu."));
    } finally {
      setBusy(false);
    }
  };

  const guiTep = async (f: File) => {
    setBaoLoi("");
    setKetQua(null);
    setBusy(true);
    const fd = new FormData();
    fd.append("tep", f);
    const url =
      variant === "leTan" ? "/dat-phong/nhap-excel-le-tan" : "/dat-phong/nhap-excel-khach";
    try {
      const res = await api.post<KetQuaNhapExcel>(url, fd);
      setKetQua(res.data);
      if (variant === "leTan" && res.data.soThanhCong > 0) onSauKhiNhapLeTan?.();
    } catch (e) {
      setBaoLoi(apiErrorMessage(e, "Không xử lý được file."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const moPayOsDonNhom = async (idDatPhong: number) => {
    setBaoLoi("");
    setBusy(true);
    try {
      const payRes = await api.post<{ duongThanhToan: string }>("/thanh-toan/tao-url", {
        idDatPhong,
        urlTroVe: `${window.location.origin}/dat-phong/thanh-cong?idDatPhong=${idDatPhong}`,
        urlHuy: `${window.location.origin}/dat-phong`,
        cheDoThanhToan: cheDoThanhToanPayOs,
      });
      window.location.assign(payRes.data.duongThanhToan);
    } catch (e) {
      setBaoLoi(apiErrorMessage(e, "Không tạo được link thanh toán."));
      setBusy(false);
    }
  };

  const laLeTan = variant === "leTan";
  const thanhCongNhom =
    ketQua != null && ketQua.soThanhCong > 0 && ketQua.soThatBai === 0;
  const thatBaiNhom =
    ketQua != null && ketQua.soThatBai > 0 && ketQua.soThanhCong === 0;

  return (
    <section className="card booking-excel-lo mb-section">
      <h2 className="booking-section__title">
        <span className="booking-excel-lo__step-ico" aria-hidden>
          <FileSpreadsheet size={18} />
        </span>
        Đặt nhiều phòng (nhóm)
      </h2>
      <p className="text-muted text-sm booking-excel-lo__lead">
        {laLeTan ? (
          <>
            Mỗi dòng = một phòng (tối đa <strong>100</strong> dòng).{" "}
            <strong>Toàn bộ file phải hợp lệ</strong> mới tạo đơn — thiếu một phòng thì{" "}
            <strong>không lưu đơn nào</strong>. Ngày nhận/trả có thể trùng (một đêm). Để trống
            số phòng và ghi loại phòng để hệ thống chọn phòng trống (mỗi dòng một phòng khác
            nhau nếu cùng loại).
          </>
        ) : (
          <>
            Đặt nhóm qua Excel: <strong>cùng ngày nhận và trả</strong> trên mọi dòng, tối đa{" "}
            <strong>100</strong> phòng trong một đơn. Nếu không đủ phòng, hệ thống{" "}
            <strong>không tạo đơn</strong> và gợi ý loại phòng còn trống để bạn chỉnh file. Sau
            khi thành công, <strong>thanh toán một lần</strong> (đủ hoặc cọc theo lựa chọn bên
            phải).
          </>
        )}
      </p>
      <div className="booking-excel-lo__actions">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={() => void taiMau()}
        >
          <Download className="btn-ico" aria-hidden />
          Tải file mẫu (.xlsx)
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="visually-hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void guiTep(f);
          }}
        />
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="btn-ico booking-excel-lo__spin" aria-hidden />
          ) : (
            <Upload className="btn-ico" aria-hidden />
          )}
          Tải file lên &amp; kiểm tra
        </button>
      </div>
      {baoLoi ? <p className="form-error booking-excel-lo__err">{baoLoi}</p> : null}
      {ketQua && (
        <div className="booking-excel-lo__ketqua">
          {thanhCongNhom ? (
            <div className="booking-excel-lo__banner booking-excel-lo__banner--ok" role="status">
              <CheckCircle2 className="btn-ico" aria-hidden />
              <div>
                <strong>Đã giữ phòng cho cả nhóm ({ketQua.soThanhCong} phòng).</strong>
                {ketQua.datTheoNhom && ketQua.idDatPhongNhom != null ? (
                  <p className="text-sm" style={{ margin: "0.35rem 0 0" }}>
                    Mã đơn nhóm: <strong>#{ketQua.idDatPhongNhom}</strong> — thanh toán một lần
                    bên dưới hoặc xem trong{" "}
                    <Link to="/don-cua-toi">Đơn của tôi</Link>.
                  </p>
                ) : laLeTan ? (
                  <p className="text-sm" style={{ margin: "0.35rem 0 0" }}>
                    Các đơn ở trạng thái chờ duyệt — xác nhận trong danh sách phía dưới.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {thatBaiNhom ? (
            <div
              className="booking-excel-lo__banner booking-excel-lo__banner--warn"
              role="alert"
            >
              <AlertCircle className="btn-ico" aria-hidden />
              <div>
                <strong>Chưa đặt được — không có đơn nào được tạo</strong>
                <p className="text-sm" style={{ margin: "0.5rem 0 0", lineHeight: 1.5 }}>
                  {ketQua.thongDiepTong ||
                    "Vui lòng xem chi tiết từng dòng, chỉnh file (loại phòng / ngày) rồi tải lại."}
                </p>
                {ketQua.goiYChung ? (
                  <p
                    className="booking-excel-lo__goi-y text-sm"
                    style={{ margin: "0.65rem 0 0" }}
                  >
                    <span className="booking-excel-lo__goi-y-label">Gợi ý phòng còn trống: </span>
                    {ketQua.goiYChung}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {!thatBaiNhom && !thanhCongNhom && ketQua.tongHang > 0 ? (
            <p className="text-sm" style={{ marginBottom: "0.75rem" }}>
              Đã xử lý <strong>{ketQua.tongHang}</strong> dòng:{" "}
              <span style={{ color: "var(--success)" }}>{ketQua.soThanhCong} thành công</span>
              {ketQua.soThatBai > 0 ? (
                <>
                  , <span style={{ color: "var(--danger)" }}>{ketQua.soThatBai} cần chỉnh</span>
                </>
              ) : null}
              .
            </p>
          ) : null}

          {ketQua.datTheoNhom && ketQua.idDatPhongNhom != null && !laLeTan ? (
            <div className="booking-excel-lo__pay-nhom">
              <button
                type="button"
                className="btn btn-lg"
                disabled={busy}
                onClick={() => void moPayOsDonNhom(ketQua.idDatPhongNhom!)}
              >
                {busy ? (
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                ) : (
                  <CreditCard className="btn-ico" aria-hidden />
                )}
                Thanh toán đơn nhóm (PayOS)
              </button>
              <p className="text-muted text-sm" style={{ margin: "0.5rem 0 0" }}>
                {cheDoThanhToanPayOs === "DAT_COC"
                  ? "Thanh toán đặt cọc theo lựa chọn bên phải."
                  : "Thanh toán toàn bộ đơn nhóm một lần."}
              </p>
            </div>
          ) : null}

          <details
            className="booking-excel-lo__details"
            open={thatBaiNhom || (thanhCongNhom && laLeTan)}
          >
            <summary className="text-sm">Chi tiết từng dòng trong file</summary>
            <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Dòng</th>
                    <th>Họ tên</th>
                    <th>Liên hệ</th>
                    <th>Yêu cầu</th>
                    <th>Phòng gán</th>
                    <th>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {ketQua.chiTiet.map((d, i) => (
                    <tr key={`${d.soDongExcel}-${i}`}>
                      <td>{d.soDongExcel}</td>
                      <td>{d.hoTenDong ?? "—"}</td>
                      <td className="booking-excel-lo__wrap">{d.lienHeDong ?? "—"}</td>
                      <td className="booking-excel-lo__wrap">
                        {d.yeuCauPhongNgayDong ?? "—"}
                      </td>
                      <td>{d.thanhCong && d.soPhongDaGan ? d.soPhongDaGan : "—"}</td>
                      <td className="booking-excel-lo__wrap">
                        {d.thanhCong ? (
                          ketQua.datTheoNhom && ketQua.idDatPhongNhom != null ? (
                            <span className="text-muted text-sm">
                              Đơn nhóm #{ketQua.idDatPhongNhom}
                            </span>
                          ) : d.idDatPhong != null ? (
                            <span>Đơn #{d.idDatPhong}</span>
                          ) : (
                            "OK"
                          )
                        ) : (
                          <>
                            <span className="booking-excel-lo__ketqua-loi">{d.loi || "—"}</span>
                            {d.goiYLoaiPhong ? (
                              <p
                                className="booking-excel-lo__goi-y text-sm"
                                style={{ margin: "0.35rem 0 0" }}
                              >
                                {d.goiYLoaiPhong}
                              </p>
                            ) : null}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
