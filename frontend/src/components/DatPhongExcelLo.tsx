import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
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
};

export type KetQuaNhapExcel = {
  tongHang: number;
  soThanhCong: number;
  soThatBai: number;
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

export default function DatPhongExcelLo({
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
      if (variant === "leTan") onSauKhiNhapLeTan?.();
    } catch (e) {
      setBaoLoi(apiErrorMessage(e, "Không xử lý được file."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const moPayOs = async (idDatPhong: number) => {
    setBaoLoi("");
    setBusy(true);
    try {
      const payRes = await api.post<{ duongThanhToan: string }>("/thanh-toan/tao-url", {
        idDatPhong,
        urlTroVe: `${window.location.origin}/dat-phong/thanh-cong?idDatPhong=${idDatPhong}`,
        urlHuy: `${window.location.origin}/dat-phong`,
        cheDoThanhToan: cheDoThanhToanPayOs,
      });
      window.location.href = payRes.data.duongThanhToan;
    } catch (e) {
      setBaoLoi(apiErrorMessage(e, "Không tạo được link thanh toán."));
      setBusy(false);
    }
  };

  const laLeTan = variant === "leTan";

  return (
    <section className="card booking-excel-lo mb-section">
      <h2 className="booking-section__title">
        <span className="booking-excel-lo__step-ico" aria-hidden>
          <FileSpreadsheet size={18} />
        </span>
        Đặt nhiều phòng bằng Excel
      </h2>
      <p className="text-muted text-sm booking-excel-lo__lead">
        {laLeTan ? (
          <>
            Tải file mẫu, mỗi dòng = một đơn, một phòng (tối đa <strong>100</strong> dòng).{" "}
            <strong>Ngày nhận và ngày trả có thể trùng nhau</strong> (tính một đêm). Có thể để trống{" "}
            <strong>số phòng</strong> và điền <strong>mã hoặc đúng tên loại phòng</strong> ở cột cuối — hệ
            thống chọn <strong>ngẫu nhiên</strong> một phòng trống thuộc loại đó; nhiều dòng cùng ngày và
            cùng loại thì mỗi dòng một phòng (nếu còn). <strong>Mã khách</strong> tùy chọn; nếu trống thì
            tìm/tạo khách theo SĐT hoặc email. Ngày: <code>yyyy-mm-dd</code> hoặc dd/mm/yyyy.
          </>
        ) : (
          <>
            Tải file mẫu, mỗi dòng = một đơn, một phòng (tối đa <strong>100</strong> dòng), gắn với tài khoản
            của bạn. <strong>Ngày nhận và ngày trả có thể trùng nhau</strong> (một đêm). Có thể để trống số
            phòng và điền <strong>mã hoặc tên loại phòng</strong> để hệ thống chọn ngẫu nhiên phòng trống.
            Sau khi import thành công, thanh toán PayOS từng đơn hoặc vào{" "}
            <Link to="/don-cua-toi">Đơn của tôi</Link>.
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
          Tải file lên &amp; xử lý
        </button>
      </div>
      {baoLoi ? <p className="form-error booking-excel-lo__err">{baoLoi}</p> : null}
      {ketQua && (
        <div className="booking-excel-lo__ketqua">
          <p className="text-sm" style={{ marginBottom: "0.75rem" }}>
            Đã xử lý <strong>{ketQua.tongHang}</strong> dòng:{" "}
            <span style={{ color: "var(--success)" }}>{ketQua.soThanhCong} thành công</span>
            {ketQua.soThatBai > 0 ? (
              <>
                , <span style={{ color: "var(--danger)" }}>{ketQua.soThatBai} lỗi</span>
              </>
            ) : null}
            .
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Dòng</th>
                  <th>Họ tên (trong file)</th>
                  <th>Liên hệ</th>
                  <th>Phòng &amp; ngày (trong file)</th>
                  <th>Phòng đã gán</th>
                  <th>Kết quả</th>
                  <th>Chi tiết</th>
                  {variant === "khach" ? <th>Thanh toán</th> : null}
                </tr>
              </thead>
              <tbody>
                {ketQua.chiTiet.map((d, i) => (
                  <tr key={`${d.soDongExcel}-${i}`}>
                    <td>{d.soDongExcel}</td>
                    <td>{d.hoTenDong ?? "—"}</td>
                    <td className="booking-excel-lo__wrap">{d.lienHeDong ?? "—"}</td>
                    <td className="booking-excel-lo__wrap">{d.yeuCauPhongNgayDong ?? "—"}</td>
                    <td>{d.thanhCong && d.soPhongDaGan ? d.soPhongDaGan : "—"}</td>
                    <td className={d.thanhCong ? undefined : "booking-excel-lo__ketqua-loi"}>
                      {d.thanhCong ? "OK" : "Lỗi"}
                    </td>
                    <td className="booking-excel-lo__wrap">
                      {d.thanhCong
                        ? d.idDatPhong != null
                          ? `Đơn #${d.idDatPhong}`
                          : "—"
                        : d.loi || "—"}
                    </td>
                    {variant === "khach" ? (
                      <td>
                        {d.thanhCong && d.idDatPhong != null ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            disabled={busy}
                            onClick={() => void moPayOs(d.idDatPhong!)}
                          >
                            PayOS
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {laLeTan && ketQua.soThanhCong > 0 ? (
            <p className="text-muted text-sm" style={{ marginTop: "0.75rem" }}>
              Các đơn mới ở trạng thái chờ duyệt — xác nhận và thanh toán trong danh sách phía dưới.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
