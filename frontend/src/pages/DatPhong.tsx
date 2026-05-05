import { useState, useEffect, useMemo } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

type Phong = {
  id: number;
  soPhong: string;
  tenLoaiPhong: string;
  giaLoaiPhong: number;
  giaChoKyLuuTru?: number;
};

function parseIdPhongTuQuery(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("idPhong");
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function soDemLuuTru(ngayNhan: string, ngayTra: string): number | null {
  if (!ngayNhan || !ngayTra) return null;
  const a = new Date(`${ngayNhan}T12:00:00`);
  const b = new Date(`${ngayTra}T12:00:00`);
  const ms = b.getTime() - a.getTime();
  const days = Math.round(ms / 86400000);
  return days > 0 ? days : null;
}

export default function DatPhong() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const idPhongTuUrl = useMemo(
    () => parseIdPhongTuQuery(searchParams),
    [searchParams],
  );
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [checkIn, setCheckIn] = useState(
    searchParams.get("ngayNhanPhong")?.trim() || "",
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get("ngayTraPhong")?.trim() || "",
  );
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const id = parseIdPhongTuQuery(searchParams);
    return id != null ? [id] : [];
  });
  const [phongXemTruoc, setPhongXemTruoc] = useState<Phong | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const soDem = soDemLuuTru(checkIn, checkOut);
  const datesOk = !!(checkIn && checkOut && soDem != null);

  useEffect(() => {
    const id = parseIdPhongTuQuery(searchParams);
    if (id == null) {
      setPhongXemTruoc(null);
      return;
    }
    let cancelled = false;
    api
      .get<Phong>(`/phong/${id}`)
      .then((r) => {
        if (!cancelled) setPhongXemTruoc(r.data);
      })
      .catch(() => {
        if (!cancelled) setPhongXemTruoc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    const idUrl = parseIdPhongTuQuery(searchParams);
    if (idUrl != null) {
      setSelectedIds((prev) =>
        prev.includes(idUrl) ? prev : [...prev, idUrl],
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (!checkIn || !checkOut || soDemLuuTru(checkIn, checkOut) == null) {
      setRooms([]);
      return;
    }
    const idUrl = parseIdPhongTuQuery(searchParams);
    setRoomsLoading(true);
    api
      .get("/phong/con-trong", {
        params: { ngayNhanPhong: checkIn, ngayTraPhong: checkOut },
      })
      .then((r) => {
        const list = r.data as Phong[];
        setRooms(list);
        setSelectedIds((prev) => {
          const next = new Set<number>();
          for (const pid of prev) {
            if (list.some((room) => room.id === pid)) next.add(pid);
          }
          if (idUrl != null && list.some((room) => room.id === idUrl)) {
            next.add(idUrl);
          }
          return [...next];
        });
      })
      .finally(() => setRoomsLoading(false));
  }, [checkIn, checkOut, searchParams]);

  const toggleRoom = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedRooms = rooms.filter((r) => selectedIds.includes(r.id));
  const totalAmount = selectedRooms.reduce(
    (sum, r) => sum + Number(r.giaChoKyLuuTru || r.giaLoaiPhong),
    0,
  );
  const phongDaChonKhongConTrong =
    !!idPhongTuUrl &&
    datesOk &&
    !roomsLoading &&
    rooms.length > 0 &&
    !rooms.some((r) => r.id === idPhongTuUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      navigate("/dang-nhap");
      return;
    }
    if (!user.vaiTro?.includes("ROLE_KHACH_HANG")) {
      setError("Bạn không có quyền đặt phòng.");
      return;
    }
    if (selectedIds.length === 0 || !checkIn || !checkOut) {
      setError("Vui lòng chọn phòng và ngày nhận/trả phòng.");
      return;
    }
    setLoading(true);
    try {
      const meRes = await api.get("/xac-thuc/toi");
      const idKhachHang = meRes.data.idKhachHang as number | undefined;
      if (!idKhachHang) {
        setError(
          "Tài khoản chưa có thông tin khách hàng. Vui lòng liên hệ lễ tân.",
        );
        setLoading(false);
        return;
      }
      const booking = await api.post("/dat-phong", {
        idKhachHang,
        ngayNhanPhong: checkIn,
        ngayTraPhong: checkOut,
        idPhong: selectedIds,
      });
      const idDatPhong = booking.data.id;
      const payRes = await api.post("/thanh-toan/tao-url", {
        idDatPhong,
        urlTroVe: `${window.location.origin}/dat-phong/thanh-cong?idDatPhong=${idDatPhong}`,
        urlHuy: `${window.location.origin}/dat-phong`,
      });
      window.location.href = payRes.data.duongThanhToan;
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Có lỗi xảy ra",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-shell booking-page">
      <header className="booking-page-header">
        <h1 className="page-title animate-fade-in">Đặt phòng</h1>
        <p className="page-subtitle page-subtitle--tight">
          Chọn ngày nhận — trả, chọn phòng trống và thanh toán qua PayOS.{" "}
          <Link to="/phong" className="booking-intro-link">
            Xem danh sách phòng
          </Link>
        </p>
      </header>

      {!user && (
        <div className="booking-login-banner" role="status">
          <span className="booking-login-banner__icon" aria-hidden>
            ◎
          </span>
          <div>
            <strong>Cần tài khoản khách</strong>
            <p className="booking-login-banner__text">
              <Link to="/dang-nhap">Đăng nhập</Link> hoặc{" "}
              <Link to="/dang-ky">đăng ký</Link> để hoàn tất đặt phòng và thanh
              toán.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-layout">
        <div className="booking-main">
          <section className="card booking-section">
            <h2 className="booking-section__title">
              <span className="booking-step-num">1</span>
              Thời gian lưu trú
            </h2>
            <div className="booking-date-grid">
              <div className="form-group">
                <label>Ngày nhận phòng</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày trả phòng</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>
            {soDem != null && (
              <p className="booking-nights-pill">
                <span>{soDem}</span> đêm
              </p>
            )}
            {checkIn && checkOut && soDem === null && (
              <p className="form-error booking-inline-error">
                Ngày trả phòng phải sau ngày nhận phòng.
              </p>
            )}
          </section>

          {datesOk && (
            <section className="card booking-section">
              <h2 className="booking-section__title">
                <span className="booking-step-num">2</span>
                {idPhongTuUrl && phongXemTruoc
                  ? "Xác nhận phòng & giá"
                  : "Chọn phòng trống"}
              </h2>
              {phongDaChonKhongConTrong && phongXemTruoc && (
                <p className="form-error booking-inline-error" role="alert">
                  Phòng {phongXemTruoc.soPhong} không còn trống trong khoảng
                  ngày này. Đổi ngày hoặc chọn phòng khác trong danh sách.
                </p>
              )}
              {roomsLoading ? (
                <div className="booking-rooms-loading" aria-busy="true">
                  <div className="booking-rooms-loading__spinner" />
                  <span>Đang tải phòng trống…</span>
                </div>
              ) : rooms.length === 0 ? (
                <p className="booking-empty-msg">
                  Không còn phòng trống trong khoảng thời gian này. Thử đổi ngày
                  hoặc{" "}
                  <Link to="/phong" className="booking-intro-link">
                    xem danh sách phòng
                  </Link>
                  .
                </p>
              ) : (
                <div className="booking-room-grid">
                  {rooms.map((r) => {
                    const price = Number(r.giaChoKyLuuTru || r.giaLoaiPhong);
                    const checked = selectedIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`booking-room-card${checked ? " booking-room-card--selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          className="booking-room-card__check"
                          checked={checked}
                          onChange={() => toggleRoom(r.id)}
                        />
                        <div className="booking-room-card__body">
                          <span className="booking-room-card__room">
                            Phòng {r.soPhong}
                          </span>
                          <span className="booking-room-card__type">
                            {r.tenLoaiPhong}
                          </span>
                        </div>
                        <div className="booking-room-card__price">
                          <span className="booking-room-card__amount">
                            {price.toLocaleString("vi-VN")}
                          </span>
                          <span className="booking-room-card__unit">
                            VND / kỳ
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="booking-aside">
          <div className="card booking-summary-card">
            <h3 className="booking-summary-card__title">Tóm tắt</h3>
            {phongXemTruoc && !datesOk && (
              <div className="booking-picked-room">
                <p className="booking-picked-room__label">Phòng bạn chọn</p>
                <p className="booking-picked-room__line">
                  <strong>Phòng {phongXemTruoc.soPhong}</strong>
                  <span className="text-muted text-sm">
                    {" "}
                    · {phongXemTruoc.tenLoaiPhong}
                  </span>
                </p>
                <p className="booking-picked-room__hint text-muted text-sm">
                  Chọn ngày nhận và trả ở bước 1 để kiểm tra còn trống và xem giá
                  theo kỳ lưu trú.
                </p>
              </div>
            )}
            {!datesOk ? (
              !phongXemTruoc ? (
                <p className="booking-summary-placeholder">
                  Chọn ngày nhận và trả để xem phòng trống và giá.
                </p>
              ) : null
            ) : (
              <>
                <dl className="booking-summary-dl">
                  <div>
                    <dt>Nhận</dt>
                    <dd>{checkIn}</dd>
                  </div>
                  <div>
                    <dt>Trả</dt>
                    <dd>{checkOut}</dd>
                  </div>
                  <div>
                    <dt>Số đêm</dt>
                    <dd>{soDem}</dd>
                  </div>
                  <div>
                    <dt>Phòng đặt</dt>
                    <dd>
                      {selectedRooms.length > 0
                        ? selectedRooms
                            .map((r) => `Phòng ${r.soPhong}`)
                            .join(", ")
                        : selectedIds.length > 0
                          ? `${selectedIds.length} phòng`
                          : "—"}
                    </dd>
                  </div>
                </dl>
                {selectedIds.length > 0 && (
                  <div className="booking-summary-total">
                    <span>Tạm tính</span>
                    <strong>
                      {totalAmount.toLocaleString("vi-VN")}{" "}
                      <span className="booking-summary-total__unit">VND</span>
                    </strong>
                  </div>
                )}
              </>
            )}
            {error && <p className="form-error booking-summary-error">{error}</p>}
            <button
              type="submit"
              className="btn booking-pay-btn"
              disabled={loading || !datesOk || selectedIds.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                  Đang xử lý…
                </>
              ) : (
                <>
                  <CreditCard className="btn-ico" aria-hidden />
                  Thanh toán PayOS
                </>
              )}
            </button>
            <p className="booking-summary-footnote text-muted text-sm">
              Bạn sẽ được chuyển tới cổng thanh toán an toàn. Đăng nhập tài khoản
              khách trước khi bấm nếu chưa đăng nhập.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
