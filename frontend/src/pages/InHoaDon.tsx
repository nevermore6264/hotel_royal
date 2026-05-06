import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Building2, Download, FileText, Loader2, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { formatNgayGioVN, formatNgayVN } from "../lib/ngayGio";
import {
  classBadgeDatPhong,
  classBadgeThanhToan,
  tenTrangThaiChiTietPhong,
  tenTrangThaiDatPhong,
  tenTrangThaiThanhToan,
} from "../lib/trangThai";

type GiaoDich = {
  id: number;
  maGiaoDich?: string;
  loaiGiaoDich?: string;
  soTien: number;
  thoiDiemGiaoDich?: string;
  ghiChu?: string;
  congThanhToan?: string;
};

type DatPhong = {
  id: number;
  tenKhach?: string;
  sdtKhach?: string;
  emailKhach?: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  tongTien: number;
  tienPhong?: number;
  tienDichVu?: number;
  tienHoan?: number;
  thoiGianTao?: string;
  chiTiet: {
    id?: number;
    soPhong: string;
    gia: number;
    trangThai: string;
    soDem?: number;
    giaGocMoiDem?: number;
    soTienHoan?: number;
  }[];
  suDungDichVu?: {
    id: number;
    tenDichVu: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
  }[];
  thanhToan?: {
    tongPhaiThu: number;
    tongDaThu: number;
    tongHoan?: number;
    conPhaiThu: number;
    trangThai: string;
    phuongThuc?: string;
    thoiDiemThanhToan?: string;
    giaoDich: GiaoDich[];
  };
};

function tien(n: number | undefined | null): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString("vi-VN")} đ`;
}

function tenLoaiGiaoDich(ma?: string): string {
  if (!ma) return "—";
  const m: Record<string, string> = {
    THANH_TOAN: "Thanh toán",
    DAT_COC: "Đặt cọc",
  };
  return m[ma] ?? ma;
}

function ghiChuHienThi(g: GiaoDich): string {
  const note = g.ghiChu?.trim();
  const quaPayOs = g.congThanhToan === "CONG_PAYOS";
  if (note) {
    if (quaPayOs && !/pay\s*os/i.test(note)) {
      return `${note} · PayOS`;
    }
    return note;
  }
  if (quaPayOs) return "Thanh toán qua PayOS";
  return "—";
}

export default function InHoaDon() {
  const { id } = useParams();
  const [dp, setDp] = useState<DatPhong | null>(null);
  const [err, setErr] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const invoiceRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/dat-phong/${id}/hoa-don`)
      .then((r) => setDp(r.data))
      .catch(() => setErr("Không xem được hóa đơn."));
  }, [id]);

  const ngayLap = useMemo(() => {
    if (!dp?.thoiGianTao) return formatNgayGioVN(new Date().toISOString());
    return formatNgayGioVN(
      typeof dp.thoiGianTao === "string" ? dp.thoiGianTao : String(dp.thoiGianTao),
    );
  }, [dp?.thoiGianTao]);

  const taiPdf = useCallback(async () => {
    const el = invoiceRootRef.current;
    if (!el || !id) return;
    setPdfBusy(true);
    el.classList.add("invoice-doc--paper");
    try {
      const mod = await import("html2pdf.js");
      const html2pdf = mod.default;
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: `hoa-don-${id}.pdf`,
          image: { type: "jpeg", quality: 0.92 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            scrollY: 0,
            scrollX: 0,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } catch {
      window.alert("Không tạo được file PDF. Bạn có thể dùng nút In và chọn «Lưu thành PDF».");
    } finally {
      el.classList.remove("invoice-doc--paper");
      setPdfBusy(false);
    }
  }, [id]);

  if (err) {
    return (
      <div className="container page-shell invoice-page">
        <div className="card invoice-error-card">
          <p className="form-error" role="alert">
            {err}
          </p>
          <Link to="/don-cua-toi" className="btn mt-4">
            <ArrowLeft className="btn-ico" aria-hidden />
            Quay lại đơn của tôi
          </Link>
        </div>
      </div>
    );
  }

  if (!dp) {
    return (
      <div className="container page-shell invoice-page">
        <div className="card invoice-loading-card">
          <div className="invoice-loading-card__spinner" aria-hidden />
          <p className="invoice-loading-card__text">Đang tải hóa đơn…</p>
        </div>
      </div>
    );
  }

  const coDichVu = (dp.suDungDichVu?.length ?? 0) > 0;

  return (
    <div className="container page-shell invoice-page invoice-print-wrap">
      <div className="invoice-toolbar no-print">
        <div className="invoice-toolbar__inner">
          <p className="invoice-toolbar__hint">
            <FileText className="invoice-toolbar__hint-ico" aria-hidden />
            Xem trước hóa đơn — in hoặc lưu PDF từ trình duyệt.
          </p>
          <div className="invoice-toolbar__actions">
            <button
              type="button"
              className="btn"
              disabled={pdfBusy}
              onClick={() => void taiPdf()}
            >
              {pdfBusy ? (
                <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
              ) : (
                <Download className="btn-ico" aria-hidden />
              )}
              Tải PDF
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              <Printer className="btn-ico" aria-hidden />
              In trang
            </button>
            <Link to="/don-cua-toi" className="btn btn-secondary">
              <ArrowLeft className="btn-ico" aria-hidden />
              Đơn của tôi
            </Link>
          </div>
        </div>
      </div>

      <article
        ref={invoiceRootRef}
        className="invoice-doc card invoice-print-card"
      >
        <header className="invoice-doc__head">
          <div className="invoice-doc__brand">
            <div className="invoice-doc__logo" aria-hidden>
              <Building2 size={28} strokeWidth={1.75} />
            </div>
            <div>
              <p className="invoice-doc__hotel">Royal Lotus Hotel</p>
              <p className="invoice-doc__tagline">Đà Nẵng · Hóa đơn / Phiếu thanh toán</p>
            </div>
          </div>
          <div className="invoice-doc__meta">
            <div className="invoice-doc__meta-block">
              <span className="invoice-doc__meta-label">Số phiếu</span>
              <span className="invoice-doc__meta-value">#{dp.id}</span>
            </div>
            <div className="invoice-doc__meta-block">
              <span className="invoice-doc__meta-label">Ngày lập</span>
              <span className="invoice-doc__meta-value">{ngayLap}</span>
            </div>
            <div className="invoice-doc__meta-block invoice-doc__meta-block--badge">
              <span className="invoice-doc__meta-label">Trạng thái đơn</span>
              <span className={classBadgeDatPhong(dp.trangThai)}>
                {tenTrangThaiDatPhong(dp.trangThai)}
              </span>
            </div>
          </div>
        </header>

        <section className="invoice-section">
          <h2 className="invoice-section__title">Thông tin khách</h2>
          <div className="invoice-grid">
            <div className="invoice-kv">
              <span className="invoice-kv__k">Họ tên</span>
              <span className="invoice-kv__v">{dp.tenKhach?.trim() || "—"}</span>
            </div>
            <div className="invoice-kv">
              <span className="invoice-kv__k">Điện thoại</span>
              <span className="invoice-kv__v">{dp.sdtKhach?.trim() || "—"}</span>
            </div>
            <div className="invoice-kv invoice-kv--wide">
              <span className="invoice-kv__k">Email</span>
              <span className="invoice-kv__v">{dp.emailKhach?.trim() || "—"}</span>
            </div>
            <div className="invoice-kv">
              <span className="invoice-kv__k">Nhận phòng</span>
              <span className="invoice-kv__v">{formatNgayVN(dp.ngayNhanPhong)}</span>
            </div>
            <div className="invoice-kv">
              <span className="invoice-kv__k">Trả phòng</span>
              <span className="invoice-kv__v">{formatNgayVN(dp.ngayTraPhong)}</span>
            </div>
          </div>
        </section>

        <section className="invoice-section">
          <h2 className="invoice-section__title">Chi tiết phòng</h2>
          <div className="invoice-table-wrap">
            <table className="invoice-table invoice-table--lines">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th className="invoice-table__num">Số đêm</th>
                  <th className="invoice-table__num">Đơn giá / đêm</th>
                  <th className="invoice-table__num">Thành tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {dp.chiTiet.map((c, i) => (
                  <tr key={c.id ?? `${c.soPhong}-${i}`}>
                    <td>
                      <span className="invoice-room">Phòng {c.soPhong}</span>
                    </td>
                    <td className="invoice-table__num">{c.soDem ?? "—"}</td>
                    <td className="invoice-table__num">
                      {c.giaGocMoiDem != null ? tien(c.giaGocMoiDem) : "—"}
                    </td>
                    <td className="invoice-table__num invoice-table__strong">{tien(c.gia)}</td>
                    <td>
                      <span className="invoice-pill">{tenTrangThaiChiTietPhong(c.trangThai)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {coDichVu && (
          <section className="invoice-section">
            <h2 className="invoice-section__title">Dịch vụ</h2>
            <div className="invoice-table-wrap">
              <table className="invoice-table invoice-table--lines">
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th className="invoice-table__num">SL</th>
                    <th className="invoice-table__num">Đơn giá</th>
                    <th className="invoice-table__num">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {dp.suDungDichVu!.map((d) => (
                    <tr key={d.id}>
                      <td>{d.tenDichVu}</td>
                      <td className="invoice-table__num">{d.soLuong}</td>
                      <td className="invoice-table__num">{tien(d.donGia)}</td>
                      <td className="invoice-table__num invoice-table__strong">{tien(d.thanhTien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="invoice-bottom">
          <section className="invoice-section invoice-section--compact">
            <h2 className="invoice-section__title">Thanh toán</h2>
            {dp.thanhToan?.giaoDich && dp.thanhToan.giaoDich.length > 0 ? (
              <div className="invoice-table-wrap">
                <table className="invoice-table invoice-table--lines invoice-table--tx">
                  <thead>
                    <tr>
                      <th>Thời điểm</th>
                      <th>Loại</th>
                      <th className="invoice-table__num">Số tiền</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dp.thanhToan.giaoDich.map((g) => (
                      <tr key={g.id}>
                        <td className="invoice-table__muted">
                          {g.thoiDiemGiaoDich
                            ? formatNgayGioVN(g.thoiDiemGiaoDich)
                            : "—"}
                        </td>
                        <td>{tenLoaiGiaoDich(g.loaiGiaoDich)}</td>
                        <td className="invoice-table__num invoice-table__strong">{tien(g.soTien)}</td>
                        <td className="invoice-table__muted">{ghiChuHienThi(g)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="invoice-muted">Chưa có giao dịch thanh toán ghi nhận.</p>
            )}
          </section>

          <aside className="invoice-summary">
            <h2 className="invoice-summary__title">Tổng cộng</h2>
            <dl className="invoice-summary__dl">
              {dp.tienPhong != null && (
                <div className="invoice-summary__row">
                  <dt>Tiền phòng</dt>
                  <dd>{tien(dp.tienPhong)}</dd>
                </div>
              )}
              {dp.tienDichVu != null && Number(dp.tienDichVu) > 0 && (
                <div className="invoice-summary__row">
                  <dt>Tiền dịch vụ</dt>
                  <dd>{tien(dp.tienDichVu)}</dd>
                </div>
              )}
              {dp.tienHoan != null && Number(dp.tienHoan) > 0 && (
                <div className="invoice-summary__row invoice-summary__row--muted">
                  <dt>Hoàn tiền</dt>
                  <dd>− {tien(dp.tienHoan)}</dd>
                </div>
              )}
              <div className="invoice-summary__row invoice-summary__row--total">
                <dt>Tổng đơn</dt>
                <dd>{tien(dp.tongTien)}</dd>
              </div>
              {dp.thanhToan && (
                <>
                  <div className="invoice-summary__row">
                    <dt>Phải thu</dt>
                    <dd>{tien(dp.thanhToan.tongPhaiThu)}</dd>
                  </div>
                  <div className="invoice-summary__row">
                    <dt>Đã thu</dt>
                    <dd>{tien(dp.thanhToan.tongDaThu)}</dd>
                  </div>
                  {dp.thanhToan.tongHoan != null && Number(dp.thanhToan.tongHoan) > 0 && (
                    <div className="invoice-summary__row invoice-summary__row--muted">
                      <dt>Đã hoàn</dt>
                      <dd>{tien(dp.thanhToan.tongHoan)}</dd>
                    </div>
                  )}
                  <div className="invoice-summary__row invoice-summary__row--due">
                    <dt>Còn lại</dt>
                    <dd>{tien(dp.thanhToan.conPhaiThu)}</dd>
                  </div>
                  <div className="invoice-summary__foot">
                    <span className="invoice-doc__meta-label">Trạng thái TT</span>
                    <span className={classBadgeThanhToan(dp.thanhToan.trangThai)}>
                      {tenTrangThaiThanhToan(dp.thanhToan.trangThai)}
                    </span>
                  </div>
                </>
              )}
            </dl>
          </aside>
        </div>

        <footer className="invoice-foot">
          <p>
            Cảm ơn quý khách đã lựa chọn Royal Lotus Hotel. Mọi thắc mắc xin liên hệ lễ tân.
          </p>
          <p className="invoice-foot__fine">Phiếu có giá trị tham khảo — không thay thế hóa đơn GTGT.</p>
        </footer>
      </article>
    </div>
  );
}
