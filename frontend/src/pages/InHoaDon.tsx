import { useEffect, useState } from "react";
import { ArrowLeft, Printer, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

type DatPhong = {
  id: number;
  tenKhach?: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  tongTien: number;
  chiTiet: { soPhong: string; gia: number; trangThai: string }[];
  thanhToan?: {
    tongPhaiThu: number;
    tongDaThu: number;
    conPhaiThu: number;
    trangThai: string;
  };
};

export default function InHoaDon() {
  const { id } = useParams();
  const [dp, setDp] = useState<DatPhong | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/dat-phong/${id}/hoa-don`)
      .then((r) => setDp(r.data))
      .catch(() => setErr("Không xem được hóa đơn."));
  }, [id]);

  useEffect(() => {
    if (dp) {
      const t = window.setTimeout(() => window.print(), 400);
      return () => window.clearTimeout(t);
    }
  }, [dp]);

  if (err) {
    return (
      <div className="container page-shell">
        <p className="form-error">{err}</p>
        <Link to="/don-cua-toi" className="btn mt-4">
          <ArrowLeft className="btn-ico" aria-hidden />
          Quay lại đơn của tôi
        </Link>
      </div>
    );
  }

  if (!dp) {
    return (
      <div className="container page-shell">
        <p>Đang tải hóa đơn…</p>
      </div>
    );
  }

  return (
    <div className="container page-shell invoice-print-wrap">
      <div className="no-print" style={{ marginBottom: "1rem" }}>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          <Printer className="btn-ico" aria-hidden />
          In / Lưu PDF
        </button>
        <Link to="/don-cua-toi" className="btn" style={{ marginLeft: "0.5rem" }}>
          <X className="btn-ico" aria-hidden />
          Đóng
        </Link>
      </div>
      <div className="card invoice-print-card">
        <h1 className="page-title" style={{ fontSize: "1.35rem" }}>
          Hóa đơn / Phiếu thanh toán
        </h1>
        <p className="text-muted text-sm">Mã đơn: #{dp.id}</p>
        <p>Khách: {dp.tenKhach || "—"}</p>
        <p>
          Nhận phòng: {dp.ngayNhanPhong} — Trả phòng: {dp.ngayTraPhong}
        </p>
        <p>Trạng thái đơn: {dp.trangThai}</p>
        <table className="invoice-table mt-4">
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Giá</th>
              <th>Trạng thái dòng</th>
            </tr>
          </thead>
          <tbody>
            {dp.chiTiet.map((c) => (
              <tr key={c.soPhong}>
                <td>{c.soPhong}</td>
                <td>{Number(c.gia).toLocaleString("vi-VN")}</td>
                <td>{c.trangThai}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-totals mt-4">
          <p>
            <strong>Tổng đơn:</strong> {Number(dp.tongTien).toLocaleString("vi-VN")} VND
          </p>
          {dp.thanhToan && (
            <>
              <p>Phải thu: {Number(dp.thanhToan.tongPhaiThu).toLocaleString("vi-VN")}</p>
              <p>Đã thu: {Number(dp.thanhToan.tongDaThu).toLocaleString("vi-VN")}</p>
              <p>Còn lại: {Number(dp.thanhToan.conPhaiThu).toLocaleString("vi-VN")}</p>
              <p>TT: {dp.thanhToan.trangThai}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
