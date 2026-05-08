import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import api from "../../api/client";
import {
  classBadgePhong,
  classBadgeVeSinh,
  tenTrangThaiPhong,
  tenTrangThaiVeSinh,
} from "../../lib/trangThai";

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  trangThaiVeSinh?: string;
  tenLoaiPhong: string;
};

const VE_SINH_FILTERS = [
  { value: "", label: "Tất cả vệ sinh" },
  { value: "SACH", label: tenTrangThaiVeSinh("SACH") },
  { value: "CAN_DON", label: tenTrangThaiVeSinh("CAN_DON") },
  { value: "BAN", label: tenTrangThaiVeSinh("BAN") },
  { value: "DANG_DON", label: tenTrangThaiVeSinh("DANG_DON") },
] as const;

const PHONG_FILTERS = [
  { value: "", label: "Tất cả phòng" },
  { value: "PHONG_TRONG", label: tenTrangThaiPhong("PHONG_TRONG") },
  { value: "DANG_SU_DUNG", label: tenTrangThaiPhong("DANG_SU_DUNG") },
  { value: "DA_GIU", label: tenTrangThaiPhong("DA_GIU") },
  { value: "BAO_TRI", label: tenTrangThaiPhong("BAO_TRI") },
] as const;

export default function TrangThaiPhong() {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(true);
  const [timSoPhong, setTimSoPhong] = useState("");
  const [locVeSinh, setLocVeSinh] = useState("");
  const [locPhong, setLocPhong] = useState("");

  useEffect(() => {
    api
      .get("/phong")
      .then((r) => setRooms(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = timSoPhong.trim().toLowerCase();
    return rooms.filter((r) => {
      if (locVeSinh && r.trangThaiVeSinh !== locVeSinh) return false;
      if (locPhong && r.trangThai !== locPhong) return false;
      if (q && !r.soPhong.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rooms, timSoPhong, locVeSinh, locPhong]);

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
      <p className="text-muted text-sm" style={{ marginTop: "-0.35rem" }}>
        Sau <strong>trả phòng</strong>, phòng được đánh dấu vệ sinh{" "}
        <strong>Cần dọn</strong>. Danh sách làm việc:{" "}
        <Link to="/buong-phong/can-don-ve-sinh">Phòng cần dọn</Link> (gồm{" "}
        <strong>Bẩn</strong>, <strong>Đang dọn</strong>).
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="buong-phong-filter-row">
          <label>
            Tìm số phòng
            <input
              type="search"
              value={timSoPhong}
              onChange={(e) => setTimSoPhong(e.target.value)}
              placeholder="VD: 101"
              autoComplete="off"
              aria-label="Lọc theo số phòng"
            />
          </label>
          <label>
            Vệ sinh
            <select
              value={locVeSinh}
              onChange={(e) => setLocVeSinh(e.target.value)}
              aria-label="Lọc theo trạng thái vệ sinh"
            >
              {VE_SINH_FILTERS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trạng thái phòng
            <select
              value={locPhong}
              onChange={(e) => setLocPhong(e.target.value)}
              aria-label="Lọc theo trạng thái phòng"
            >
              {PHONG_FILTERS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-muted text-sm" style={{ margin: 0 }}>
          Hiển thị <strong>{filtered.length}</strong> / {rooms.length} phòng.
        </p>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Loại</th>
                <th>Trạng thái phòng</th>
                <th>Vệ sinh</th>
                <th style={{ width: "11rem" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const canDenManDon =
                  r.trangThaiVeSinh === "CAN_DON" ||
                  r.trangThaiVeSinh === "BAN" ||
                  r.trangThaiVeSinh === "DANG_DON";
                return (
                  <tr key={r.id}>
                    <td>{r.soPhong}</td>
                    <td>{r.tenLoaiPhong}</td>
                    <td>
                      <span className={classBadgePhong(r.trangThai)}>
                        {tenTrangThaiPhong(r.trangThai)}
                      </span>
                    </td>
                    <td>
                      {r.trangThaiVeSinh ? (
                        <span className={classBadgeVeSinh(r.trangThaiVeSinh)}>
                          {tenTrangThaiVeSinh(r.trangThaiVeSinh)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {canDenManDon ? (
                        <Link
                          to="/buong-phong/can-don-ve-sinh"
                          className="btn btn-secondary btn-sm"
                          title="Mở trang Phòng cần dọn để cập nhật"
                        >
                          <Sparkles className="btn-ico" aria-hidden />
                          Phòng cần dọn
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--text-muted)" }}>
                    Không có phòng khớp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
