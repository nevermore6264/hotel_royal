import { useState, useEffect } from "react";
import api from "../../api/client";
import PaginationBar from "../../components/PaginationBar";

type KhachHang = {
  id: number;
  hoTen: string;
  soDienThoai?: string;
  email?: string;
  soCanCuoc?: string;
};

export default function KhachHangLeTan() {
  const [page, setPage] = useState(0);
  const [list, setList] = useState<{
    content: KhachHang[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [q, setQ] = useState("");

  useEffect(() => {
    const params: Record<string, string | number> = {
      page,
      size: 15,
    };
    if (q.trim()) params.q = q.trim();
    api.get("/khach-hang", { params }).then((r) => setList(r.data));
  }, [page, q]);

  useEffect(() => {
    setPage(0);
  }, [q]);

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý khách hàng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tìm theo tên, số điện thoại hoặc email — có phân trang.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm kiếm
        </h3>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Từ khóa (tên, SĐT, email)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nhập để lọc danh sách…"
          />
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Danh sách khách</h3>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>CMND/CCCD</th>
            </tr>
          </thead>
          <tbody>
            {list.content.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.hoTen}</td>
                <td>{c.soDienThoai || "-"}</td>
                <td>{c.email || "-"}</td>
                <td>{c.soCanCuoc || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <PaginationBar
          page={page}
          totalPages={list.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      </div>
    </div>
  );
}
