import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Brush,
  ClipboardList,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "../../api/client";
import {
  tenTrangThaiPhong,
  tenTrangThaiVeSinh,
} from "../../lib/trangThai";

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  trangThaiVeSinh?: string;
};

export default function TongQuanBuongPhong() {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/phong")
      .then((r) => setRooms(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const veSinh = {
      SACH: 0,
      CAN_DON: 0,
      BAN: 0,
      DANG_DON: 0,
      khac: 0,
    };
    const phong = {
      PHONG_TRONG: 0,
      DANG_SU_DUNG: 0,
      DA_GIU: 0,
      BAO_TRI: 0,
      khac: 0,
    };
    for (const r of rooms) {
      const v = r.trangThaiVeSinh;
      if (v === "SACH") veSinh.SACH++;
      else if (v === "CAN_DON") veSinh.CAN_DON++;
      else if (v === "BAN") veSinh.BAN++;
      else if (v === "DANG_DON") veSinh.DANG_DON++;
      else veSinh.khac++;

      const t = r.trangThai;
      if (t === "PHONG_TRONG") phong.PHONG_TRONG++;
      else if (t === "DANG_SU_DUNG") phong.DANG_SU_DUNG++;
      else if (t === "DA_GIU") phong.DA_GIU++;
      else if (t === "BAO_TRI") phong.BAO_TRI++;
      else phong.khac++;
    }
    const canDonQueue =
      veSinh.CAN_DON + veSinh.BAN + veSinh.DANG_DON;
    return { veSinh, phong, tong: rooms.length, canDonQueue };
  }, [rooms]);

  return (
    <div className="container page-shell">
      <h1 className="page-title">Buồng phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tổng quan trạng thái vệ sinh và phòng — điểm vào nhanh các màn làm việc.
      </p>

      {loading ? (
        <div className="card loading-panel">
          <div className="loading-panel__spinner" aria-hidden />
          <p style={{ margin: 0 }}>Đang tải dữ liệu phòng…</p>
        </div>
      ) : (
        <>
          <div className="buong-phong-dash-grid">
            <Link
              to="/buong-phong/can-don-ve-sinh"
              className="card buong-phong-dash-card buong-phong-dash-card--accent"
            >
              <Brush className="buong-phong-dash-card__ico" aria-hidden />
              <div>
                <div className="buong-phong-dash-card__label">
                  Hàng đợi dọn
                </div>
                <div className="buong-phong-dash-card__value">
                  {stats.canDonQueue}
                </div>
                <div className="buong-phong-dash-card__hint">
                  Cần dọn + bẩn + đang dọn
                </div>
              </div>
            </Link>
            <div className="card buong-phong-dash-card">
              <Sparkles className="buong-phong-dash-card__ico" aria-hidden />
              <div>
                <div className="buong-phong-dash-card__label">Phòng sạch</div>
                <div className="buong-phong-dash-card__value">
                  {stats.veSinh.SACH}
                </div>
              </div>
            </div>
            <div className="card buong-phong-dash-card">
              <BedDouble className="buong-phong-dash-card__ico" aria-hidden />
              <div>
                <div className="buong-phong-dash-card__label">Tổng số phòng</div>
                <div className="buong-phong-dash-card__value">{stats.tong}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "1.25rem" }}>
            <h3 className="card-title" style={{ marginTop: 0 }}>
              Vệ sinh
            </h3>
            <ul className="buong-phong-stat-list">
              <li>
                <span>{tenTrangThaiVeSinh("SACH")}</span>
                <strong>{stats.veSinh.SACH}</strong>
              </li>
              <li>
                <span>{tenTrangThaiVeSinh("CAN_DON")}</span>
                <strong>{stats.veSinh.CAN_DON}</strong>
              </li>
              <li>
                <span>{tenTrangThaiVeSinh("BAN")}</span>
                <strong>{stats.veSinh.BAN}</strong>
              </li>
              <li>
                <span>{tenTrangThaiVeSinh("DANG_DON")}</span>
                <strong>{stats.veSinh.DANG_DON}</strong>
              </li>
            </ul>
          </div>

          <div className="card" style={{ marginTop: "1rem" }}>
            <h3 className="card-title" style={{ marginTop: 0 }}>
              Trạng thái phòng (vận hành)
            </h3>
            <ul className="buong-phong-stat-list">
              <li>
                <span>{tenTrangThaiPhong("PHONG_TRONG")}</span>
                <strong>{stats.phong.PHONG_TRONG}</strong>
              </li>
              <li>
                <span>{tenTrangThaiPhong("DANG_SU_DUNG")}</span>
                <strong>{stats.phong.DANG_SU_DUNG}</strong>
              </li>
              <li>
                <span>{tenTrangThaiPhong("DA_GIU")}</span>
                <strong>{stats.phong.DA_GIU}</strong>
              </li>
              <li>
                <span>{tenTrangThaiPhong("BAO_TRI")}</span>
                <strong>{stats.phong.BAO_TRI}</strong>
              </li>
            </ul>
          </div>

          <div className="buong-phong-dash-actions">
            <Link to="/buong-phong/trang-thai" className="btn btn-secondary">
              <ClipboardList className="btn-ico" aria-hidden />
              Danh sách trạng thái &amp; lọc
            </Link>
            <Link to="/buong-phong/can-don-ve-sinh" className="btn">
              <Sparkles className="btn-ico" aria-hidden />
              Phòng cần dọn
            </Link>
            <button type="button" className="btn btn-secondary" onClick={load}>
              <RefreshCw className="btn-ico" aria-hidden />
              Làm mới
            </button>
          </div>
        </>
      )}
    </div>
  );
}
