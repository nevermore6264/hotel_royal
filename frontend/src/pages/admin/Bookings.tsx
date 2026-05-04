import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import {
  classBadgeDatPhong,
  tenTrangThaiDatPhong,
} from "../../lib/trangThai";

type DatPhong = {
  id: number;
  tenKhach?: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  tongTien: number;
};

export default function AdminBookings() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [trangThai, setTrangThai] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [list, setList] = useState<{ content: DatPhong[]; totalPages: number }>({
    content: [],
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: 15 };
    if (q.trim()) params.q = q.trim();
    if (trangThai) params.trangThai = trangThai;
    if (tuNgay) params.tuNgay = tuNgay;
    if (denNgay) params.denNgay = denNgay;
    api
      .get("/dat-phong", { params })
      .then((r) => setList(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [page, q, trangThai, tuNgay, denNgay]);

  useEffect(() => {
    setPage(0);
  }, [q, trangThai, tuNgay, denNgay]);

  return (
    <div className="container page-shell">
      <h1 className="page-title">Đặt phòng toàn hệ thống</h1>
      <p className="page-subtitle page-subtitle--tight">
        Lọc theo trạng thái và khoảng ngày nhận phòng.
      </p>
      <div className="card mb-section">
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Tìm khách (tên, SĐT, email)</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Từ khóa…"
            />
          </div>
          <div className="form-group">
            <label>Trạng thái đơn</label>
            <select value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="DA_XAC_NHAN">Đã xác nhận</option>
              <option value="DA_NHAN_PHONG">Đã nhận phòng</option>
              <option value="DA_TRA_PHONG">Đã trả phòng</option>
              <option value="DA_HUY">Đã hủy</option>
            </select>
          </div>
          <div className="form-group">
            <label>Từ ngày nhận</label>
            <input type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Đến ngày nhận</label>
            <input type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} />
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
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Nhận</th>
                  <th>Trả</th>
                  <th>Trạng thái</th>
                  <th>Tổng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.content.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.tenKhach || "—"}</td>
                    <td>{d.ngayNhanPhong}</td>
                    <td>{d.ngayTraPhong}</td>
                    <td>
                      <span className={`badge ${classBadgeDatPhong(d.trangThai)}`}>
                        {tenTrangThaiDatPhong(d.trangThai)}
                      </span>
                    </td>
                    <td>{Number(d.tongTien).toLocaleString("vi-VN")}</td>
                    <td>
                      <Link to={`/le-tan/dat-phong`} className="text-sm">
                        Lễ tân
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-bar mt-4">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="btn-ico" aria-hidden />
              Trước
            </button>
            <span className="text-muted text-sm mx-2">
              Trang {page + 1} / {Math.max(1, list.totalPages)}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= list.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
              <ChevronRight className="btn-ico" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
