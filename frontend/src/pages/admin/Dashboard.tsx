import { useState, useEffect } from "react";
import api from "../../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [revenue, setRevenue] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api
      .get("/bang-dieu-khien/thoi-gian-thuc")
      .then((r) => setStats(r.data))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (!from || !to) return;
    api
      .get("/bang-dieu-khien/doanh-thu", { params: { tu: from, den: to } })
      .then((r) => setRevenue(r.data));
  }, [from, to]);

  const d = new Date();
  const defaultFrom = d.toISOString().slice(0, 7) + "-01";
  const defaultTo = d.toISOString().slice(0, 10);

  return (
    <div className="container page-shell">
      <h1 className="page-title animate-fade-in">Bảng điều khiển</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tổng quan phòng, lấp độ và doanh thu theo thời gian thực.
      </p>
      {statsLoading && (
        <div className="dashboard-stats dashboard-stats--skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card dashboard-stat-card skeleton-stat">
              <div className="skeleton-line skeleton-line--sm" />
              <div className="skeleton-line skeleton-line--lg" />
            </div>
          ))}
        </div>
      )}
      {!statsLoading && stats && (
        <div className="dashboard-stats">
          <div className="card dashboard-stat-card animate-slide-up animate-delay-1">
            <div className="stat-label">Tổng phòng</div>
            <div className="stat-value">{String(stats.tongPhong)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-2">
            <div className="stat-label">Phòng trống</div>
            <div className="stat-value stat-value-primary">
              {String(stats.phongTrong)}
            </div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-3">
            <div className="stat-label">Phòng đang dùng</div>
            <div className="stat-value">{String(stats.phongDangDung)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-4">
            <div className="stat-label">Tỉ lệ lấp phòng (%)</div>
            <div className="stat-value">
              {Number(stats.tyLeLapDay || 0).toFixed(1)}%
            </div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-2">
            <div className="stat-label">Doanh thu hôm nay (VND)</div>
            <div className="stat-value stat-value-sm">
              {Number(stats.doanhThuHomNay || 0).toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-3">
            <div className="stat-label">Đơn hôm nay</div>
            <div className="stat-value">{String(stats.donHomNay)}</div>
          </div>
        </div>
      )}
      {!statsLoading && !stats && (
        <p className="form-error">Không tải được dữ liệu bảng điều khiển.</p>
      )}
      <div className="card animate-fade-in mb-section">
        <h3 className="card-title">Doanh thu theo khoảng thời gian</h3>
        <p className="text-muted text-sm" style={{ margin: "0 0 1rem" }}>
          Chọn khoảng ngày để xem tổng doanh thu và số đơn ghi nhận.
        </p>
        <div className="form-inline">
          <div className="form-group">
            <label>Từ ngày</label>
            <input
              type="date"
              value={from || defaultFrom}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Từ ngày"
            />
          </div>
          <div className="form-group">
            <label>Đến ngày</label>
            <input
              type="date"
              value={to || defaultTo}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Đến ngày"
            />
          </div>
        </div>
        {revenue && (
          <>
            <div className="panel-metrics">
              <div className="metric-pill">
                <div className="metric-pill__label">Doanh thu</div>
                <div className="metric-pill__value">
                  {Number(revenue.doanhThu || 0).toLocaleString("vi-VN")}{" "}
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>VND</span>
                </div>
              </div>
              <div className="metric-pill">
                <div className="metric-pill__label">Số đơn</div>
                <div
                  className="metric-pill__value"
                  style={{ color: "var(--primary)" }}
                >
                  {String(revenue.soDon)}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary mt-4"
              onClick={() => {
                const rows = [
                  ["tuNgay", "denNgay", "doanhThuVND", "soDon"],
                  [
                    from || defaultFrom,
                    to || defaultTo,
                    String(revenue.doanhThu ?? ""),
                    String(revenue.soDon ?? ""),
                  ],
                ];
                const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob(["\ufeff" + csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `bao-cao-doanh-thu-${from || defaultFrom}-${to || defaultTo}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
              }}
            >
              Tải CSV khoảng đã chọn
            </button>
          </>
        )}
      </div>
    </div>
  );
}
