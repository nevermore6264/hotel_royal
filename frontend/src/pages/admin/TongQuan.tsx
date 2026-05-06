import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  LayoutGrid,
  TrendingUp,
  BedDouble,
  ClipboardList,
  Users,
  ScrollText,
  Tag,
  ConciergeBell,
  DoorOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
  ComposedChart,
  Line,
} from "recharts";
import api from "../../api/client";
import { formatNgayVN } from "../../lib/ngayGio";
import { tenTrangThaiDatPhong, tenTrangThaiPhong } from "../../lib/trangThai";

type StatRealtime = {
  tongPhong?: number;
  phongTrong?: number;
  phongDangDung?: number;
  phongDaGiu?: number;
  phongBaoTri?: number;
  tyLeLapDay?: number;
  doanhThuHomNay?: number;
  donHomNay?: number;
  nhanPhongHomNay?: number;
};

type ChartRowPhong = { trangThai: string; soLuong: number; ten: string };
type ChartRowDon = { trangThai: string; soLuong: number; ten: string };
type ChartRowNgay = { ngay: string; doanhThu: number; ngayLabel: string };
type ChartRowDonNgay = { ngay: string; soDon: number };
type ChartRowDoanhThuLoai = { tenLoai: string; doanhThu: number };
type ChartRowPhongLoai = { tenLoai: string; soLuong: number; ten: string };
type ChartRowComboNgay = ChartRowNgay & { soDon: number };

const PIE_COLORS = ["#2dd4bf", "#38bdf8", "#fbbf24", "#f87171", "#a78bfa", "#94a3b8"];

function defaultDateRange() {
  const d = new Date();
  const to = d.toISOString().slice(0, 10);
  const fromD = new Date(d);
  fromD.setDate(fromD.getDate() - 29);
  const from = fromD.toISOString().slice(0, 10);
  return { from, to };
}

const QUICK_LINKS = [
  { to: "/quan-tri/phong", label: "Phòng", icon: BedDouble },
  { to: "/quan-tri/loai-phong", label: "Loại phòng", icon: LayoutGrid },
  { to: "/quan-tri/bang-gia-phong", label: "Bảng giá", icon: Tag },
  { to: "/quan-tri/dat-phong", label: "Đặt phòng", icon: ClipboardList },
  { to: "/quan-tri/nguoi-dung", label: "Người dùng", icon: Users },
  { to: "/quan-tri/nhat-ky", label: "Nhật ký", icon: ScrollText },
  { to: "/quan-tri/dich-vu", label: "Dịch vụ", icon: ConciergeBell },
  { to: "/le-tan/dat-phong", label: "Lễ tân", icon: DoorOpen },
] as const;

function formatVndShort(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} k`;
  return n.toLocaleString("vi-VN");
}

export default function AdminTongQuan() {
  const { from: defaultFrom, to: defaultTo } = useMemo(() => defaultDateRange(), []);
  const [stats, setStats] = useState<StatRealtime | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [revenue, setRevenue] = useState<Record<string, unknown> | null>(null);
  const [seriesNgay, setSeriesNgay] = useState<ChartRowNgay[]>([]);
  const [seriesDonNgay, setSeriesDonNgay] = useState<ChartRowDonNgay[]>([]);
  const [chartPhong, setChartPhong] = useState<ChartRowPhong[]>([]);
  const [chartDon, setChartDon] = useState<ChartRowDon[]>([]);
  const [chartDoanhThuLoai, setChartDoanhThuLoai] = useState<ChartRowDoanhThuLoai[]>([]);
  const [chartPhongLoai, setChartPhongLoai] = useState<ChartRowPhongLoai[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  const seriesCombo = useMemo((): ChartRowComboNgay[] => {
    const m = new Map<string, ChartRowComboNgay>();
    for (const r of seriesNgay) {
      m.set(r.ngay, {
        ngay: r.ngay,
        ngayLabel: r.ngayLabel,
        doanhThu: r.doanhThu,
        soDon: 0,
      });
    }
    for (const d of seriesDonNgay) {
      const soDon = Number(d.soDon) || 0;
      const cur = m.get(d.ngay);
      if (cur) cur.soDon = soDon;
      else
        m.set(d.ngay, {
          ngay: d.ngay,
          ngayLabel: formatNgayVN(d.ngay),
          doanhThu: 0,
          soDon,
        });
    }
    return Array.from(m.values()).sort((a, b) => a.ngay.localeCompare(b.ngay));
  }, [seriesNgay, seriesDonNgay]);

  useEffect(() => {
    api
      .get("/bang-dieu-khien/thoi-gian-thuc")
      .then((r) => setStats(r.data as StatRealtime))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (!from || !to) return;
    api
      .get("/bang-dieu-khien/doanh-thu", { params: { tu: from, den: to } })
      .then((r) => setRevenue(r.data));
  }, [from, to]);

  useEffect(() => {
    if (!from || !to) return;
    setChartsLoading(true);
    Promise.all([
      api.get("/bang-dieu-khien/doanh-thu-theo-ngay", { params: { tu: from, den: to } }),
      api.get("/bang-dieu-khien/don-theo-ngay", { params: { tu: from, den: to } }),
      api.get("/bang-dieu-khien/doanh-thu-theo-loai-phong", { params: { tu: from, den: to } }),
      api.get("/bang-dieu-khien/phong-theo-trang-thai"),
      api.get("/bang-dieu-khien/dat-phong-theo-trang-thai"),
      api.get("/bang-dieu-khien/phong-theo-loai-phong"),
    ])
      .then(([rNgay, rDonNgay, rDtLoai, rPhong, rDon, rPhongLoai]) => {
        const rawNgay = (rNgay.data || []) as { ngay: string; doanhThu: number }[];
        setSeriesNgay(
          rawNgay.map((row) => ({
            ngay: row.ngay,
            doanhThu: Number(row.doanhThu) || 0,
            ngayLabel: formatNgayVN(row.ngay),
          })),
        );
        const rawDonNgay = (rDonNgay.data || []) as { ngay: string; soDon: number }[];
        setSeriesDonNgay(
          rawDonNgay.map((row) => ({
            ngay: row.ngay,
            soDon: Number(row.soDon) || 0,
          })),
        );
        const rawDtLoai = (rDtLoai.data || []) as { tenLoai: string; doanhThu: number }[];
        setChartDoanhThuLoai(
          rawDtLoai.map((row) => ({
            tenLoai: String(row.tenLoai ?? ""),
            doanhThu: Number(row.doanhThu) || 0,
          })),
        );
        const rawP = (rPhong.data || []) as { trangThai: string; soLuong: number }[];
        setChartPhong(
          rawP.map((row) => ({
            trangThai: row.trangThai,
            soLuong: Number(row.soLuong) || 0,
            ten: tenTrangThaiPhong(row.trangThai),
          })),
        );
        const rawD = (rDon.data || []) as { trangThai: string; soLuong: number }[];
        setChartDon(
          rawD.map((row) => ({
            trangThai: row.trangThai,
            soLuong: Number(row.soLuong) || 0,
            ten: tenTrangThaiDatPhong(row.trangThai),
          })),
        );
        const rawPL = (rPhongLoai.data || []) as { tenLoai: string; soLuong: number }[];
        setChartPhongLoai(
          rawPL.map((row) => ({
            tenLoai: String(row.tenLoai ?? ""),
            soLuong: Number(row.soLuong) || 0,
            ten: String(row.tenLoai ?? ""),
          })),
        );
      })
      .finally(() => setChartsLoading(false));
  }, [from, to]);

  const tooltipStyle = {
    background: "rgba(21, 30, 40, 0.96)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "8px",
    color: "#f1f5f9",
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title animate-fade-in">Báo cáo &amp; bảng điều khiển</h1>
      <p className="page-subtitle page-subtitle--tight">
        Theo dõi phòng, đặt phòng và doanh thu — có biểu đồ và xuất dữ liệu nhanh.
      </p>

      <div className="card dashboard-quick-links animate-fade-in mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Truy cập nhanh
        </h3>
        <div className="dashboard-quick-links__grid">
          {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="dashboard-quick-link">
              <Icon className="dashboard-quick-link__ico" aria-hidden />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {statsLoading && (
        <div className="dashboard-stats dashboard-stats--skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="stat-value">{String(stats.tongPhong ?? 0)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-2">
            <div className="stat-label">Phòng trống</div>
            <div className="stat-value stat-value-primary">{String(stats.phongTrong ?? 0)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-3">
            <div className="stat-label">Đang sử dụng</div>
            <div className="stat-value">{String(stats.phongDangDung ?? 0)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-4">
            <div className="stat-label">Đã giữ</div>
            <div className="stat-value">{String(stats.phongDaGiu ?? 0)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-1">
            <div className="stat-label">Bảo trì</div>
            <div className="stat-value">{String(stats.phongBaoTri ?? 0)}</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-2">
            <div className="stat-label">Tỉ lệ lấp phòng</div>
            <div className="stat-value">{Number(stats.tyLeLapDay || 0).toFixed(1)}%</div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-3">
            <div className="stat-label">Doanh thu hôm nay (VND)</div>
            <div className="stat-value stat-value-sm">
              {Number(stats.doanhThuHomNay || 0).toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="card dashboard-stat-card animate-slide-up animate-delay-4">
            <div className="stat-label">Đơn hôm nay</div>
            <div className="stat-value">{String(stats.donHomNay ?? 0)}</div>
          </div>
        </div>
      )}
      {!statsLoading && !stats && (
        <p className="form-error">Không tải được dữ liệu bảng điều khiển.</p>
      )}

      <div className="dashboard-charts-grid">
        <div className="card dashboard-chart-card animate-fade-in">
          <h3 className="card-title" style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp className="btn-ico" aria-hidden />
            Phân bổ phòng theo trạng thái
          </h3>
          {chartsLoading ? (
            <div className="dashboard-chart-skeleton" />
          ) : chartPhong.length === 0 ? (
            <p className="text-muted text-sm">Chưa có dữ liệu phòng.</p>
          ) : (
            <div className="dashboard-chart-inner">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartPhong}
                    dataKey="soLuong"
                    nameKey="ten"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    label={false}
                  >
                    {chartPhong.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(15,23,42,0.5)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [Number(value ?? 0), "Số phòng"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card dashboard-chart-card animate-fade-in">
          <h3 className="card-title" style={{ marginTop: 0 }}>Đặt phòng theo trạng thái</h3>
          {chartsLoading ? (
            <div className="dashboard-chart-skeleton" />
          ) : chartDon.length === 0 ? (
            <p className="text-muted text-sm">Chưa có đơn đặt phòng.</p>
          ) : (
            <div className="dashboard-chart-inner">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartDon} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="ten" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [Number(value ?? 0), "Số đơn"]}
                  />
                  <Bar dataKey="soLuong" fill="#2dd4bf" radius={[6, 6, 0, 0]} name="Số đơn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <div className="card dashboard-chart-card dashboard-chart-card--span-full animate-fade-in">
          <h3 className="card-title" style={{ marginTop: 0 }}>
            Doanh thu &amp; số đơn theo ngày (nhận phòng)
          </h3>
          <p className="text-muted text-sm" style={{ margin: "0 0 0.75rem" }}>
            Cột: doanh thu đã thu; đường: số đơn đã xác nhận / đang lưu trú / đã trả — trong khoảng ngày đã chọn bên dưới.
          </p>
          {chartsLoading ? (
            <div className="dashboard-chart-skeleton dashboard-chart-skeleton--tall" />
          ) : seriesCombo.length === 0 ? (
            <p className="text-muted text-sm">Chưa có dữ liệu đơn hoặc doanh thu trong khoảng hiện tại.</p>
          ) : (
            <div className="dashboard-chart-inner dashboard-chart-inner--composed">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={seriesCombo} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="ngayLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis
                    yAxisId="dt"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => formatVndShort(Number(v))}
                  />
                  <YAxis
                    yAxisId="don"
                    orientation="right"
                    tick={{ fill: "#7dd3fc", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) =>
                      name === "Doanh thu"
                        ? [`${Number(value ?? 0).toLocaleString("vi-VN")} VND`, name]
                        : [Number(value ?? 0), name]
                    }
                    labelFormatter={(_, p) => p?.[0]?.payload?.ngayLabel ?? ""}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                  <Bar
                    yAxisId="dt"
                    dataKey="doanhThu"
                    name="Doanh thu"
                    fill="#2dd4bf"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={52}
                  />
                  <Line
                    yAxisId="don"
                    type="monotone"
                    dataKey="soDon"
                    name="Số đơn"
                    stroke="#7dd3fc"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#7dd3fc" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card dashboard-chart-card animate-fade-in">
          <h3 className="card-title" style={{ marginTop: 0 }}>
            Doanh thu theo loại phòng
          </h3>
          <p className="text-muted text-sm" style={{ margin: "0 0 0.75rem" }}>
            Tổng thành tiền phòng (chi tiết đặt) theo loại — cùng khoảng ngày với báo cáo bên dưới.
          </p>
          {chartsLoading ? (
            <div className="dashboard-chart-skeleton" />
          ) : chartDoanhThuLoai.length === 0 ? (
            <p className="text-muted text-sm">Chưa có doanh thu phân loại trong khoảng này.</p>
          ) : (
            <div className="dashboard-chart-inner">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  layout="vertical"
                  data={chartDoanhThuLoai}
                  margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => formatVndShort(Number(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="tenLoai"
                    width={108}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      `${Number(value ?? 0).toLocaleString("vi-VN")} VND`,
                      "Thành tiền phòng",
                    ]}
                  />
                  <Bar dataKey="doanhThu" fill="#38bdf8" radius={[0, 6, 6, 0]} name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card dashboard-chart-card animate-fade-in">
          <h3 className="card-title" style={{ marginTop: 0 }}>Phòng theo loại (tồn kho)</h3>
          {chartsLoading ? (
            <div className="dashboard-chart-skeleton" />
          ) : chartPhongLoai.length === 0 ? (
            <p className="text-muted text-sm">Chưa có phân loại phòng.</p>
          ) : (
            <div className="dashboard-chart-inner">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartPhongLoai}
                    dataKey="soLuong"
                    nameKey="ten"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={82}
                    paddingAngle={2}
                    label={false}
                  >
                    {chartPhongLoai.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(15,23,42,0.5)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [Number(value ?? 0), "Số phòng"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card animate-fade-in mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>Doanh thu &amp; báo cáo theo khoảng ngày</h3>
        <p className="text-muted text-sm" style={{ margin: "0 0 1rem" }}>
          Chọn khoảng thời gian để xem tổng hợp, biểu đồ theo ngày và xuất CSV.
        </p>
        <div className="form-inline">
          <div className="form-group">
            <label>Từ ngày</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Đến ngày</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        {revenue && (
          <>
            <div className="panel-metrics">
              <div className="metric-pill">
                <div className="metric-pill__label">Doanh thu (đã thu)</div>
                <div className="metric-pill__value">
                  {Number(revenue.doanhThu || 0).toLocaleString("vi-VN")}{" "}
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>VND</span>
                </div>
              </div>
              <div className="metric-pill">
                <div className="metric-pill__label">Số đơn (đã xác nhận trở đi)</div>
                <div className="metric-pill__value" style={{ color: "var(--primary)" }}>
                  {String(revenue.soDon)}
                </div>
              </div>
            </div>
            <div className="dashboard-chart-card dashboard-chart-card--full" style={{ marginTop: "1.25rem", padding: 0, border: "none", boxShadow: "none", background: "transparent" }}>
              <h4 className="text-sm" style={{ margin: "0 0 0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Doanh thu theo ngày nhận phòng
              </h4>
              {chartsLoading ? (
                <div className="dashboard-chart-skeleton dashboard-chart-skeleton--tall" />
              ) : seriesNgay.length === 0 ? (
                <p className="text-muted text-sm">Không có dữ liệu doanh thu trong khoảng đã chọn.</p>
              ) : (
                <div className="dashboard-chart-inner dashboard-chart-inner--area">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={seriesNgay} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dtGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="ngayLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickFormatter={(v) => formatVndShort(Number(v))}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [
                          `${Number(value ?? 0).toLocaleString("vi-VN")} VND`,
                          "Doanh thu",
                        ]}
                        labelFormatter={(_, p) =>
                          p?.[0]?.payload?.ngayLabel ?? ""
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="doanhThu"
                        stroke="#2dd4bf"
                        strokeWidth={2}
                        fill="url(#dtGradient)"
                        name="Doanh thu"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="inline-actions mt-4" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const rows = [
                    ["tuNgay", "denNgay", "doanhThuVND", "soDon"],
                    [from, to, String(revenue.doanhThu ?? ""), String(revenue.soDon ?? "")],
                  ];
                  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `bao-cao-doanh-thu-${from}-${to}.csv`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                <Download className="btn-ico" aria-hidden />
                Tải CSV tổng hợp
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={seriesNgay.length === 0}
                onClick={() => {
                  const rows = [["ngay", "doanhThuVND"], ...seriesNgay.map((r) => [r.ngay, String(r.doanhThu)])];
                  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
                  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `bao-cao-doanh-thu-theo-ngay-${from}-${to}.csv`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                <Download className="btn-ico" aria-hidden />
                Tải CSV theo ngày
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
