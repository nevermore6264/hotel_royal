import { useEffect, useState } from "react";
import api from "../../api/client";
import PaginationBar from "../../components/PaginationBar";

type Row = {
  id: number;
  thoiDiem: string;
  hanhDong: string;
  chiTiet: string;
  tenDangNhapNguoiThucHien?: string;
};

export default function AuditLog() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [rows, setRows] = useState<{ content: Row[]; totalPages: number }>({
    content: [],
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: 20 };
    if (q.trim()) params.q = q.trim();
    if (tuNgay) params.tuNgay = tuNgay;
    if (denNgay) params.denNgay = denNgay;
    api
      .get("/nhat-ky", { params })
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, [page, q, tuNgay, denNgay]);

  useEffect(() => {
    setPage(0);
  }, [q, tuNgay, denNgay]);

  return (
    <div className="container page-shell">
      <h1 className="page-title">Nhật ký hệ thống</h1>
      <p className="page-subtitle page-subtitle--tight">
        Ghi nhận thao tác quan trọng (ví dụ cập nhật hồ sơ, đổi mật khẩu).
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm &amp; lọc theo thời gian
        </h3>
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Từ khóa (hành động, chi tiết, tài khoản)</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm trong nhật ký…"
            />
          </div>
          <div className="form-group">
            <label>Từ ngày</label>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Đến ngày</label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
            />
          </div>
        </div>
      </div>
      {loading ? (
        <p>Đang tải…</p>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Thời điểm</th>
                  <th>Hành động</th>
                  <th>Chi tiết</th>
                  <th>Người thực hiện</th>
                </tr>
              </thead>
              <tbody>
                {rows.content.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.thoiDiem).toLocaleString("vi-VN")}</td>
                    <td>{r.hanhDong}</td>
                    <td className="cell-wrap-text">{r.chiTiet}</td>
                    <td>{r.tenDangNhapNguoiThucHien || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            page={page}
            totalPages={rows.totalPages}
            onPageChange={setPage}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
}
