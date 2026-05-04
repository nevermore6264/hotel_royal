import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type CSSProperties,
} from "react";
import { BedDouble, Eye, FilterX, RotateCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

type SortKey = "gia-asc" | "gia-desc" | "phong-asc";

type LoaiPhong = {
  id: number;
  ten: string;
  gia: number;
  moTa?: string;
};

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  idLoaiPhong: number;
  tenLoaiPhong: string;
  giaLoaiPhong: number;
  giaChoKyLuuTru?: number;
  duongDanAnh: string[];
};

const US_HERO = (path: string) =>
  `https://images.unsplash.com/${path}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=85`;

function IconEyebrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  );
}

function RoomsHeroVisual() {
  const [fail, setFail] = useState(false);
  const src = US_HERO("photo-1618773928121-c32242e63f39");
  return (
    <div className="rooms-hero__visual">
      <div className="rooms-hero__frame">
        {!fail ? (
          <img
            className="rooms-hero__img"
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            width={1400}
            height={933}
            onError={() => setFail(true)}
          />
        ) : (
          <div className="rooms-hero__img-fallback" aria-hidden />
        )}
        <div className="rooms-hero__frame-overlay" aria-hidden />
        <span className="rooms-hero__badge rooms-hero__badge--pay">
          payOS
        </span>
        <span className="rooms-hero__badge rooms-hero__badge--wifi">
          Wi‑Fi · view biển
        </span>
        <div className="rooms-hero__stat-card">
          <span className="rooms-hero__stat-num">50+</span>
          <span className="rooms-hero__stat-lbl">Phòng &amp; suite</span>
        </div>
      </div>
      <div className="rooms-hero__ring" aria-hidden />
    </div>
  );
}

function soDemLuuTru(ngayNhan: string, ngayTra: string): number | null {
  if (!ngayNhan || !ngayTra) return null;
  const a = new Date(`${ngayNhan}T12:00:00`);
  const b = new Date(`${ngayTra}T12:00:00`);
  const d = Math.round((b.getTime() - a.getTime()) / 86400000);
  return d > 0 ? d : null;
}

function RoomCardImage({ phong }: { phong: Phong }) {
  const [broken, setBroken] = useState(false);
  const src = phong.duongDanAnh?.[0];
  const hue = (phong.id * 41) % 360;
  const showImg = Boolean(src) && !broken;

  return (
    <div className="room-card-visual">
      {showImg ? (
        <img
          className="room-card-visual__img"
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <div
          className="room-card-visual__grad"
          style={{ "--room-h": hue } as CSSProperties}
          aria-hidden
        />
      )}
      <div className="room-card-visual__shade" aria-hidden />
      <span className="room-card-visual__badge">Còn trống</span>
      <span className="room-card-visual__num">Phòng {phong.soPhong}</span>
    </div>
  );
}

export default function RoomList() {
  const [searchParams] = useSearchParams();
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomTypeId, setRoomTypeId] = useState<number | "">("");
  const [sortKey, setSortKey] = useState<SortKey>("gia-asc");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const { isKhachHang } = useAuth();

  const soDem = soDemLuuTru(checkIn, checkOut);
  const datesOk = !!(checkIn && checkOut && soDem != null);

  useEffect(() => {
    api.get("/loai-phong").then((r) => setRoomTypes(r.data));
  }, []);

  useEffect(() => {
    const raw = searchParams.get("idLoaiPhong");
    if (raw == null || raw === "") return;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) setRoomTypeId(n);
  }, [searchParams]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (checkIn) params.ngayNhanPhong = checkIn;
    if (checkOut) params.ngayTraPhong = checkOut;
    if (roomTypeId) params.idLoaiPhong = String(roomTypeId);
    setLoadingRooms(true);
    api
      .get("/phong/con-trong", { params })
      .then((r) => setRooms(r.data))
      .finally(() => setLoadingRooms(false));
  }, [checkIn, checkOut, roomTypeId]);

  const sortedRooms = useMemo(() => {
    const arr = [...rooms];
    const priceOf = (r: Phong) =>
      Number(r.giaChoKyLuuTru ?? r.giaLoaiPhong);
    if (sortKey === "gia-asc") arr.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sortKey === "gia-desc") arr.sort((a, b) => priceOf(b) - priceOf(a));
    else arr.sort((a, b) => a.soPhong.localeCompare(b.soPhong, "vi"));
    return arr;
  }, [rooms, sortKey]);

  const hasFilters = !!(checkIn || checkOut || roomTypeId);

  const clearFilters = useCallback(() => {
    setCheckIn("");
    setCheckOut("");
    setRoomTypeId("");
  }, []);

  const minPrice = useMemo(() => {
    if (sortedRooms.length === 0) return null;
    return Math.min(
      ...sortedRooms.map((r) => Number(r.giaChoKyLuuTru ?? r.giaLoaiPhong)),
    );
  }, [sortedRooms]);

  return (
    <div className="rooms-page">
      <section className="rooms-hero" aria-labelledby="rooms-heading">
        <div className="rooms-hero__mesh" aria-hidden />
        <div className="rooms-hero__glow rooms-hero__glow--1" aria-hidden />
        <div className="rooms-hero__glow rooms-hero__glow--2" aria-hidden />
        <div className="rooms-hero__accent-line" aria-hidden />
        <div className="container rooms-hero__grid">
          <div className="rooms-hero__copy">
            <p className="rooms-hero__eyebrow">
              <IconEyebrow /> Royal Lotus · Đà Nẵng
            </p>
            <h1 id="rooms-heading" className="rooms-hero__title">
              Phòng &amp;{" "}
              <span className="rooms-hero__title-accent">suite</span>
            </h1>
            <p className="rooms-hero__lead">
              Chọn ngày nhận — trả để xem giá theo kỳ lưu trú, lọc loại phòng và
              đặt chỗ trong vài phút. Thanh toán bảo mật qua PayOS.
            </p>
            <ul className="rooms-hero__trust" role="list">
              <li>
                <span className="rooms-hero__trust-dot" aria-hidden />
                Giá minh bạch theo đêm / kỳ
              </li>
              <li>
                <span className="rooms-hero__trust-dot" aria-hidden />
                Lọc loại · sắp xếp giá
              </li>
              <li>
                <span className="rooms-hero__trust-dot" aria-hidden />
                Xác nhận email &amp; đơn online
              </li>
            </ul>
          </div>
          <RoomsHeroVisual />
        </div>
      </section>

      <div className="container page-shell rooms-page__body">
        <div className="rooms-filter-panel card animate-slide-up">
          <div className="rooms-filter-panel__head">
            <div>
              <h2 className="rooms-filter-panel__title">Tìm phòng phù hợp</h2>
              <p className="rooms-filter-panel__sub">
                Ngày nhận — trả áp dụng cho cả giá và tình trạng còn trống.
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                className="btn btn-ghost rooms-filter-clear"
                onClick={clearFilters}
              >
                <FilterX className="btn-ico" aria-hidden />
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="rooms-filter-panel__grid">
            <div className="form-group rooms-filter-field">
              <label>Ngày nhận</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="form-group rooms-filter-field">
              <label>Ngày trả</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div className="form-group rooms-filter-field">
              <label>Loại phòng</label>
              <select
                value={roomTypeId}
                onChange={(e) =>
                  setRoomTypeId(e.target.value ? Number(e.target.value) : "")
                }
              >
                <option value="">Tất cả loại</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.ten}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group rooms-filter-field">
              <label>Sắp xếp</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="gia-asc">Giá: thấp → cao</option>
                <option value="gia-desc">Giá: cao → thấp</option>
                <option value="phong-asc">Số phòng A → Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rooms-toolbar">
          <div className="rooms-toolbar__left">
            <span className="rooms-count-pill" aria-live="polite">
              {loadingRooms ? (
                "Đang tải…"
              ) : sortedRooms.length === 0 ? (
                "0 phòng"
              ) : (
                <>
                  <strong>{sortedRooms.length}</strong>
                  <span className="rooms-count-pill__lbl">
                    phòng phù hợp
                  </span>
                </>
              )}
            </span>
            {!loadingRooms && sortedRooms.length > 0 && minPrice != null && (
              <span className="rooms-toolbar__from text-muted text-sm">
                Từ{" "}
                <strong className="text-accent">
                  {minPrice.toLocaleString("vi-VN")}
                </strong>{" "}
                VND
                {datesOk ? " / kỳ" : " / đêm"}
              </span>
            )}
          </div>
          <div className="rooms-toolbar__right">
            {checkIn && checkOut && soDem === null && (
              <span className="rooms-toolbar__warn text-sm">
                Ngày trả phải sau ngày nhận.
              </span>
            )}
            {!datesOk && !loadingRooms && sortedRooms.length > 0 && (
              <span className="rooms-toolbar__hint text-muted text-sm">
                Chọn đủ hai ngày để xem giá theo kỳ lưu trú.
              </span>
            )}
          </div>
        </div>

        {loadingRooms ? (
          <div className="room-grid room-grid--listing room-grid--skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="card room-card-skeleton room-card-skeleton--listing"
              >
                <div className="room-card-skeleton__shine room-card-skeleton__shine--listing" />
                <div className="room-card-skeleton__body">
                  <div className="room-card-skeleton__line room-card-skeleton__line--lg" />
                  <div className="room-card-skeleton__line" />
                  <div className="room-card-skeleton__line room-card-skeleton__line--price" />
                  <div className="room-card-skeleton__btn" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="room-grid room-grid--listing">
            {sortedRooms.map((r, i) => {
              const price = Number(r.giaChoKyLuuTru || r.giaLoaiPhong);
              const priceLabel = datesOk
                ? `${price.toLocaleString("vi-VN")}`
                : `${Number(r.giaLoaiPhong).toLocaleString("vi-VN")}`;
              const unitLabel = datesOk
                ? `VND / kỳ${soDem != null ? ` · ${soDem} đêm` : ""}`
                : "Giá tham khảo / đêm";

              return (
                <article
                  key={r.id}
                  className="card card--interactive room-card room-card--listing animate-slide-up"
                  style={{ animationDelay: `${0.06 * (i % 8) + 0.08}s` }}
                >
                  <RoomCardImage phong={r} />
                  <div className="room-card__body">
                    <div className="room-card__head">
                      <h2 className="room-card__type-name">{r.tenLoaiPhong}</h2>
                      <p className="room-card__meta">
                        <Link
                          to={`/loai-phong/chi-tiet/${r.idLoaiPhong}`}
                          className="room-card__link-type"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xem mô tả loại phòng
                        </Link>
                      </p>
                    </div>
                    <div className="room-card__price-row">
                      <div className="room-card__price-main">
                        <span className="room-card__price-num">{priceLabel}</span>
                        <span className="room-card__price-unit">{unitLabel}</span>
                      </div>
                    </div>
                    <div className="room-card__actions">
                      <Link
                        to={`/dat-phong?idPhong=${r.id}&ngayNhanPhong=${checkIn || ""}&ngayTraPhong=${checkOut || ""}`}
                        className="btn room-card__cta"
                        style={{
                          pointerEvents: isKhachHang ? "auto" : "none",
                          opacity: isKhachHang ? 1 : 0.55,
                        }}
                      >
                        <BedDouble className="btn-ico" aria-hidden />
                        Chọn phòng này
                      </Link>
                      <Link
                        to={`/phong/chi-tiet/${r.id}`}
                        className="btn btn-secondary room-card__detail"
                      >
                        <Eye className="btn-ico" aria-hidden />
                        Chi tiết phòng
                      </Link>
                    </div>
                    {!isKhachHang && (
                      <p className="room-card-hint">
                        <Link to="/dang-nhap">Đăng nhập</Link> tài khoản khách để
                        đặt phòng.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loadingRooms && sortedRooms.length === 0 && (
          <div className="rooms-empty card animate-fade-in">
            <div className="rooms-empty__icon" aria-hidden>
              ◎
            </div>
            <h2 className="rooms-empty__title">Chưa có phòng phù hợp</h2>
            <p className="rooms-empty__text">
              Thử đổi khoảng ngày, bỏ lọc loại phòng, hoặc quay lại sau — lịch
              cập nhật theo thời gian thực.
            </p>
            {hasFilters && (
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                <RotateCcw className="btn-ico" aria-hidden />
                Đặt lại bộ lọc
              </button>
            