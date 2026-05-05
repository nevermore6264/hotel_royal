import { useEffect, useState } from "react";
import api from "../../api/client";

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  trangThaiVeSinh?: string;
  tenLoaiPhong: string;
};

export default function TrangThaiPhong() {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/phong")
      .then((r) => setRooms(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container page-shell">
        <p>Đang tải…</p>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      <h1 className="page-title">Trạng thái phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Toàn bộ phòng và trạng thái vệ sinh (buồng phòng).
      </p>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Loại</th>
                <th>Trạng thái phòng</th>
                <th>Vệ sinh</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.soPhong}</td>
                  <td>{r.tenLoaiPhong}</td>
                  <td>{r.trangThai}</td>
                  <td>{r.trangThaiVeSinh || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
