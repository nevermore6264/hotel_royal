import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import {
  ArrowLeft,
  Ban,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  List,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  trangThaiVeSinh?: string;
  idLoaiPhong: number;
  tenLoaiPhong: string;
  giaLoaiPhong: number;
  giaChoKyLuuTru?: number;
  duongDanAnh: string[];
  ghiChuVeSinh?: string | null;
};

type Loai = {
  id: number;
  ten: string;
  gia: number;
  moTa?: string;
  sucChuaToiDa?: number;
};

type DanhGia = {
  id: number;
  diem: number;
  noiDung: string;
  thoiDiem: string;
  tenHienThi: string;
};

const TRANG_THAI_PHONG: Record<string, string> = {
  PHONG_TRONG: "Phòng trống",
  DANG_SU_DUNG: "Đang sử dụng",
  BAO_TRI: "Bảo trì",
  DA_GIU: "Đã giữ chỗ",
};

const TRANG_THAI_VS: Record<string, string> = {
  SACH: "Sạch — sẵn sàng",
  CAN_DON: "Cần dọn",
  BAN: "Chưa đạt vệ sinh",
  DANG_DON: "Đang dọn dẹp",
};

const TIEN_NGHI_DIEM: string[] = [
  "Wi‑Fi tốc độ cao",
  "Điều hòa đa hướng",
  "Minibar & ấm đun",
  "Két an toàn",
  "Nước nóng 24/7",
];

const US = (path: string) =>
  `https://images.unsplash.com/${path}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=85`;

const HERO_FALLBACK = [
  "photo-1618773928121-c32242e63f39",
  "photo-1590490360182-c33d57733427",
  "photo-1582719478250-c89cae4dc85b",
];

function labelPhong(code: string) {
  return TRANG_THAI_PHONG[code] ?? code.replaceAll("_", " ");
}

function labelVeSinh(code: string | undefined) {
  if (!code) return "—";
  return TRANG_THAI_VS[code] ?? code.replaceAll("_", " ");
}

function IconDoor() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21V4a2 2 0 012-2h8a2 2 0 012 2v17M4 21h16M9 7h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function StarsRow({ value }: { value: number }) {
  const v = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="room-detail-stars" aria-label={`${v} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < v ? undefined : "room-detail-stars__off"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ChiTietPhong() {
  const { id } = useParams();
  const { isKhachHang } = useAuth();
  const [phong, setPhong] = useState<Phong | null>(null);
  const [loai, setLoai] = useState<Loai | null>(null);
  const [danhGia, setDanhGia] = useState<DanhGia[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [imgBroken, setImgBroken] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setErr("");
        setPhong(null);
        setLoai(null);
        setDanhGia([]);
        setActiveImg(0);
        setImgBroken(false);
        setLightboxOpen(false);
        const pr = await api.get<Phong>(`/phong/${id}`);
        if (cancelled) return;
        const p = pr.data;
        setPhong(p);
        const [lr, dr] = await Promise.all([
          api.get<Loai>(`/loai-phong/${p.idLoaiPhong}`),
          api.get<DanhGia[]>("/danh-gia", {
            params: { idLoaiPhong: p.idLoaiPhong },
          }),
        ]);
        if (cancelled) return;
        setLoai(lr.data);
        setDanhGia(dr.data);
      } catch {
        if (!cancelled) setErr("Không tải được thông tin phòng.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setImgBroken(false);
  }, [phong?.id, activeImg]);

  const images = phong?.duongDanAnh?.filter(Boolean) ?? [];

  const goPrevImg = useCallback(() => {
    setActiveImg((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  }, [images.length]);

  const goNextImg = useCallback(() => {
    setActiveImg((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrevImg();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNextImg();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen, images.length, goPrevImg, goNextImg]);

  const diemTB = useMemo(() => {
    if (danhGia.length === 0) return null;
    const s = danhGia.reduce((a, d) => a + d.diem, 0);
    return Math.round((s / danhGia.length) * 10) / 10;
  }, [danhGia]);

  const hue = ((phong?.id ?? 0) * 41) % 360;
  const fallbackPath = HERO_FALLBACK[(phong?.id ?? 1) % HERO_FALLBACK.length];
  const fallbackSrc = US(fallbackPath);

  const giaHien = phong
    ? Number(phong.giaChoKyLuuTru ?? phong.giaLoaiPhong)
    : 0;
  const giaNiemyet = phong ? Number(phong.giaLoaiPhong) : 0;
  const coChenhGia =
    phong &&
    phong.giaChoKyLuuTru != null &&
    Math.round(Number(phong.giaChoKyLuuTru)) !==
      Math.round(Number(phong.giaLoaiPhong));

  const heroUrl = !phong
    ? ""
    : images.length > 0
      ? images[Math.min(activeImg, images.length - 1)]
      : fallbackSrc;
  const heroAlt =
    phong && images.length > 0 ? `Phòng ${phong.soPhong}` : "";

  const coTheDat =
    isKhachHang && phong?.trangThai === "PHONG_TRONG";

  if (err) {
    return (
      <div className="container page-shell">
        <p className="form-error">{err}</p>
        <Link to="/phong" className="btn btn-secondary mt-4">
          <ArrowLeft className="btn-ico" aria-hidden />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!phong) {
    return (
      <div className="room-detail-page">
        <div className="container page-shell">
          <div className="card loading-panel room-detail-loading">
            <div className="loading-panel__spinner" aria-hidden />
            <p style={{ margin: 0 }}>Đang tải chi tiết phòng…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-detail-page">
      <section className="room-detail-hero" aria-labelledby="room-heading">
        <div className="room-detail-hero__mesh" aria-hidden />
        <div className="room-detail-hero__glow" aria-hidden />
        <div className="container room-detail-hero__grid">
          <div>
            <nav className="room-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <Link to="/phong">Phòng</Link>
              <span aria-hidden="true">/</span>
              <span>Phòng {phong.soPhong}</span>
            </nav>
            <h1 id="room-heading" className="room-detail-hero__title">
              Phòng {phong.soPhong}
            </h1>
            <p className="room-detail-hero__lead">
              Thuộc hạng <strong>{phong.tenLoaiPhong}</strong>
              {loai?.sucChuaToiDa != null
                ? ` · tối đa ${loai.sucChuaToiDa} khách`
                : ""}
              . Xem ảnh thực tế, tiện nghi và đánh giá của khách về cùng dòng
              phòng.
            </p>
            <div className="room-detail-badges">
              <span
                className={`room-detail-badge${
                  phong.trangThai === "PHONG_TRONG"
                    ? " room-detail-badge--ok"
                    : phong.trangThai === "BAO_TRI"
                      ? " room-detail-badge--warn"
                      : " room-detail-badge--muted"
                }`}
              >
                {labelPhong(phong.trangThai)}
              </span>
              <span className="room-detail-badge room-detail-badge--muted">
                Vệ sinh: {labelVeSinh(phong.trangThaiVeSinh)}
              </span>
            </div>
            <div className="room-detail-kpis">
              <div className="room-detail-kpi">
                <span className="room-detail-kpi__icon" aria-hidden>
                  <IconDoor />
                </span>
                <div>
                  <span className="room-detail-kpi__val">Số phòng</span>
                  <span className="room-detail-kpi__lbl">
                    {phong.soPhong} · ID #{phong.id}
                  </span>
                </div>
              </div>
              <div className="room-detail-kpi">
                <span className="room-detail-kpi__icon" aria-hidden>
                  <IconTag />
                </span>
                <div>
                  <span className="room-detail-kpi__val">Giá tham chiếu</span>
                  <span className="room-detail-kpi__lbl">
                    {giaHien.toLocaleString("vi-VN")} VND/đêm
                    {coChenhGia
                      ? ` (niêm yết loại: ${giaNiemyet.toLocaleString("vi-VN")})`
                      : ""}
                  </span>
                </div>
              </div>
              {loai?.sucChuaToiDa != null && (
                <div className="room-detail-kpi">
                  <span className="room-detail-kpi__icon" aria-hidden>
                    <IconUsers />
                  </span>
                  <div>
                    <span className="room-detail-kpi__val">Sức chứa</span>
                    <span className="room-detail-kpi__lbl">
                      Tối đa {loai.sucChuaToiDa} khách / phòng
                    </span>
                  </div>
                </div>
              )}
              <div className="room-detail-kpi">
                <span className="room-detail-kpi__icon" aria-hidden>
                  <IconSpark />
                </span>
                <div>
                  <span className="room-detail-kpi__val">Đánh giá loại phòng</span>
                  <span className="room-detail-kpi__lbl">
                    {diemTB != null
                      ? `${diemTB}/5 · ${danhGia.length} nhận xét`
                      : "Chưa có điểm trung bình"}
                  </span>
                </div>
              </div>
            </div>
            <div className="room-detail-hero__actions">
              {coTheDat ? (
                <Link
                  to={`/dat-phong?idPhong=${phong.id}`}
                  className="btn btn-lg"
                >
                  <CalendarPlus className="btn-ico" aria-hidden />
                  Đặt phòng ngay
                </Link>
              ) : isKhachHang ? (
                <span className="text-muted text-sm" style={{ alignSelf: "center" }}>
                  Phòng này hiện không mở đặt trực tuyến (trạng thái:{" "}
                  {labelPhong(phong.trangThai)}).
                </span>
              ) : (
                <span className="text-muted text-sm" style={{ alignSelf: "center" }}>
                  Đăng nhập tài khoản khách để đặt phòng trực tuyến.
                </span>
              )}
            </div>
          </div>

          <div className="room-detail-hero__visual">
            <div
              className={`room-detail-hero__main${images.length > 0 ? " room-detail-hero__main--clickable" : ""}`}
              role={images.length > 0 ? "button" : undefined}
              tabIndex={images.length > 0 ? 0 : undefined}
              aria-label={
                images.length > 0
                  ? `Xem ảnh lớn (${images.length} ảnh), đang hiển thị ảnh ${activeImg + 1}`
                  : undefined
              }
              onClick={() => images.length > 0 && setLightboxOpen(true)}
              onKeyDown={(e) => {
                if (images.length === 0) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLightboxOpen(true);
                }
              }}
            >
              {!imgBroken ? (
                <img
                  src={heroUrl}
                  alt={heroAlt}
                  className="room-detail-hero__img"
                  loading="eager"
                  decoding="async"
                  onError={() => setImgBroken(true)}
                />
              ) : (
                <div
                  className="room-detail-hero__grad"
                  style={{ "--room-h": hue } as CSSProperties}
                  aria-hidden
                />
              )}
              <div className="room-detail-hero__shade" aria-hidden />
              <span className="room-detail-hero__num">
                Phòng {phong.soPhong}
              </span>
              {images.length > 0 && (
                <span className="room-detail-hero__img-count">
                  {images.length > 1
                    ? `${activeImg + 1} / ${images.length}`
                    : `${images.length} ảnh`}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="room-detail-gallery-grid-wrap">
                <p className="room-detail-gallery-grid__hint text-muted text-sm">
                  Chọn ảnh bên dưới — bấm ảnh lớn để xem toàn màn hình.
                </p>
                <div className="room-detail-gallery-grid" role="list" aria-label="Ảnh phòng">
                  {images.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      role="listitem"
                      aria-label={`Ảnh ${i + 1} / ${images.length}`}
                      aria-current={i === activeImg ? "true" : undefined}
                      className={
                        i === activeImg
                          ? "room-detail-gallery-grid__cell room-detail-gallery-grid__cell--active"
                          : "room-detail-gallery-grid__cell"
                      }
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={url} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="room-detail-hero__accent" aria-hidden />
      </section>

      {lightboxOpen && images.length > 0 && (
        <div
          className="room-detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phòng"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="room-detail-lightbox__frame"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="room-detail-lightbox__close"
              aria-label="Đóng"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={22} strokeWidth={2} aria-hidden />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="room-detail-lightbox__nav room-detail-lightbox__nav--prev"
                  aria-label="Ảnh trước"
                  onClick={goPrevImg}
                >
                  <ChevronLeft size={28} strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  className="room-detail-lightbox__nav room-detail-lightbox__nav--next"
                  aria-label="Ảnh sau"
                  onClick={goNextImg}
                >
                  <ChevronRight size={28} strokeWidth={2} aria-hidden />
                </button>
              </>
            )}
            <img
              className="room-detail-lightbox__img"
              src={images[Math.min(activeImg, images.length - 1)]}
              alt={`Phòng ${phong.soPhong} — ảnh ${activeImg + 1}`}
              decoding="async"
            />
            <p className="room-detail-lightbox__caption">
              Ảnh {activeImg + 1} / {images.length} · Phòng {phong.soPhong}
            </p>
            {images.length > 1 && (
              <div className="room-detail-lightbox__grid" role="list" aria-label="Chọn ảnh">
                {images.map((url, i) => (
                  <button
                    key={`lb-${url}-${i}`}
                    type="button"
                    role="listitem"
                    aria-label={`Ảnh ${i + 1}`}
                    aria-current={i === activeImg ? "true" : undefined}
                    className={
                      i === activeImg
                        ? "room-detail-lightbox__grid-cell room-detail-lightbox__grid-cell--active"
                        : "room-detail-lightbox__grid-cell"
                    }
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container page-shell room-detail-body">
        <div className="room-detail-layout">
          <div className="room-detail-main">
            <section className="card animate-slide-up">
              <h2 className="room-detail-section-title">Tiện nghi điển hình</h2>
              <p className="text-muted text-sm" style={{ margin: "-0.35rem 0 0.85rem" }}>
                Gợi ý theo tiêu chuẩn khách sạn; chi tiết có thể khác từng phòng.
              </p>
              <div className="room-detail-amenities">
                {TIEN_NGHI_DIEM.map((t) => (
                  <span key={t} className="room-detail-amenity">
                    {t}
                  </span>
                ))}
              </div>
            </section>

            {(loai?.moTa ?? "").trim() !== "" && (
              <section className="card animate-slide-up">
                <h2 className="room-detail-section-title">Về loại phòng này</h2>
                <p className="room-detail-about__text">{loai!.moTa}</p>
              </section>
            )}

            <section className="card animate-slide-up">
              <div className="room-detail-reviews__head">
                <h2 className="room-detail-section-title" style={{ margin: 0 }}>
                  Đánh giá từ khách (theo loại phòng)
                </h2>
                {diemTB != null && (
                  <div className="room-detail-reviews__avg">
                    <span className="room-detail-reviews__avg-num">{diemTB}</span>
                    <StarsRow value={Math.round(diemTB)} />
                    <span className="text-muted text-sm">
                      {danhGia.length} nhận xét
                    </span>
                  </div>
                )}
              </div>
              {danhGia.length === 0 ? (
                <div className="room-detail-empty">
                  Chưa có đánh giá cho loại phòng này.
                </div>
              ) : (
                <ul className="room-detail-review-list">
                  {danhGia.map((d) => (
                    <li key={d.id} className="room-detail-review-item">
                      <div className="room-detail-review-item__top">
                        <strong className="room-detail-review-item__name">
                          {d.tenHienThi}
                        </strong>
                        <StarsRow value={d.diem} />
                      </div>
                      <time
                        className="room-detail-review-item__time text-muted text-sm"
                        dateTime={d.thoiDiem}
                      >
                        {new Date(d.thoiDiem).toLocaleString("vi-VN")}
                      </time>
                      {d.noiDung ? (
                        <p className="room-detail-review-item__body">{d.noiDung}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-muted text-sm" style={{ margin: "0.75rem 0 0" }}>
                Muốn gửi đánh giá? Mở{" "}
                <Link to={`/loai-phong/chi-tiet/${phong.idLoaiPhong}`}>
                  trang loại phòng
                </Link>{" "}
                (yêu cầu đăng nhập khách).
              </p>
            </section>
          </div>

          <aside className="room-detail-aside card animate-fade-in">
            <div className="room-detail-aside__price-num">
              {giaHien.toLocaleString("vi-VN")}{" "}
              <span style={{ fontSize: "0.55em", fontWeight: 700 }}>VND</span>
            </div>
            <span className="room-detail-aside__price-unit">một đêm (ước tính)</span>
            <p className="room-detail-aside__hint">
              Giá có thể thay đổi theo ngày đặt và chính sách giá. Vui lòng chọn
              ngày ở bước đặt phòng để xác nhận chính xác.
            </p>
            <div className="room-detail-aside__actions">
              {coTheDat ? (
                <Link
                  to={`/dat-phong?idPhong=${phong.id}`}
                  className="btn btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <CalendarPlus className="btn-ico" aria-hidden />
                  Đặt phòng
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-lg btn-secondary"
                  style={{ width: "100%" }}
                  disabled
                >
                  <Ban className="btn-ico" aria-hidden />
                  Không mở đặt
                </button>
              )}
              <Link
                to="/phong"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <List className="btn-ico" aria-hidden />
                Danh sách phòng
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
