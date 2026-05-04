import { useEffect, useMemo, useState } from "react";
import { BedDouble, LayoutGrid, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

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

const US = (path: string) =>
  `https://images.unsplash.com/${path}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=85`;

const HERO_BY_INDEX = [
  "photo-1618773928121-c32242e63f39",
  "photo-1590490360182-c33d57733427",
  "photo-1582719478250-c89cae4dc85b",
  "photo-1566665797739-1674de7a421a",
  "photo-1631049307264-da0ec9d70304",
];

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

function HeroImage({ loaiId }: { loaiId: number }) {
  const [fail, setFail] = useState(false);
  const path = HERO_BY_INDEX[loaiId % HERO_BY_INDEX.length];
  const src = US(path);

  return (
    <div className="loai-detail-hero__visual">
      {!fail ? (
        <img
          className="loai-detail-hero__img"
          src={src}
          alt=""
          loading="eager"
          width={1400}
          height={933}
          onError={() => setFail(true)}
        />
      ) : (
        <div className="loai-detail-hero__img-fallback" aria-hidden />
      )}
      <div className="loai-detail-hero__img-shade" aria-hidden />
    </div>
  );
}

function StarsRow({ value }: { value: number }) {
  const v = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="loai-detail-stars" aria-label={`${v} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < v ? "loai-detail-stars__on" : "loai-detail-stars__off"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function LoaiPhongDetail() {
  const { id } = useParams();
  const { isKhachHang } = useAuth();
  const { toast } = useToast();
  const [loai, setLoai] = useState<Loai | null>(null);
  const [danhGia, setDanhGia] = useState<DanhGia[]>([]);
  const [form, setForm] = useState({ diem: 5, noiDung: "" });

  const load = () => {
    if (!id) return;
    api.get(`/loai-phong/${id}`).then((r) => setLoai(r.data));
    api
      .get("/danh-gia", { params: { idLoaiPhong: id } })
      .then((r) => setDanhGia(r.data));
  };

  useEffect(() => {
    load();
  }, [id]);

  const diemTrungBinh = useMemo(() => {
    if (danhGia.length === 0) return null;
    const s = danhGia.reduce((a, d) => a + d.diem, 0);
    return Math.round((s / danhGia.length) * 10) / 10;
  }, [danhGia]);

  const guiDanhGia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.post("/danh-gia", {
        idLoaiPhong: Number(id),
        diem: form.diem,
        noiDung: form.noiDung,
      });
      setForm({ diem: 5, noiDung: "" });
      toast("Đã gửi đánh giá.", "success");
      load();
    } catch (err) {
      toast(
        (err as { response?: { data?: string } })?.response?.data ||
          "Không gửi được đánh giá (mỗi tài khoản chỉ một lần / loại).",
        "error",
      );
    }
  };

  if (!loai) {
    return (
      <div className="loai-detail-page">
        <div className="container page-shell">
          <div className="card loading-panel loai-detail-loading">
            <div className="loading-panel__spinner" aria-hidden />
            <p style={{ margin: 0 }}>Đang tải loại phòng…</p>
          </div>
        </div>
      </div>
    );
  }

  const gia = Number(loai.gia);
  const loaiId = loai.id;

  return (
    <div className="loai-detail-page">
      <section className="loai-detail-hero" aria-labelledby="loai-heading">
        <div className="loai-detail-hero__mesh" aria-hidden />
        <div className="loai-detail-hero__glow loai-detail-hero__glow--1" aria-hidden />
        <div className="container loai-detail-hero__grid">
          <div className="loai-detail-hero__copy">
            <nav className="loai-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/phong">Danh sách phòng</Link>
              <span aria-hidden>/</span>
              <span>{loai.ten}</span>
            </nav>
            <h1 id="loai-heading" className="loai-detail-hero__title">
              {loai.ten}
            </h1>
            <p className="loai-detail-hero__price">
              <span className="loai-detail-hero__price-num">
                {gia.toLocaleString("vi-VN")}
              </span>
              <span className="loai-detail-hero__price-unit">VND / đêm</span>
            </p>
            <div className="loai-detail-kpis">
              {loai.sucChuaToiDa != null && (
                <div className="loai-detail-kpi">
                  <span className="loai-detail-kpi__icon" aria-hidden>
                    <IconUsers />
                  </span>
                  <div>
                    <span className="loai-detail-kpi__val">
                      Tối đa {loai.sucChuaToiDa} khách
                    </span>
                    <span className="loai-detail-kpi__lbl">Sức chứa</span>
                  </div>
                </div>
              )}
              <div className="loai-detail-kpi">
                <span className="loai-detail-kpi__icon" aria-hidden>
                  <IconTag />
                </span>
                <div>
                  <span className="loai-detail-kpi__val">Giá niêm yết</span>
                  <span className="loai-detail-kpi__lbl">
                    Theo đêm · có biến động theo mùa
                  </span>
                </div>
              </div>
            </div>
            <div className="loai-detail-hero__actions">
              <Link
                to={`/phong?idLoaiPhong=${loai.id}`}
                className="btn btn-lg loai-detail-cta"
              >
                <BedDouble className="btn-ico" aria-hidden />
                Xem phòng trống loại này
              </Link>
              <Link to="/phong" className="btn btn-lg btn-secondary">
                <LayoutGrid className="btn-ico" aria-hidden />
                Tất cả phòng
              </Link>
            </div>
          </div>
          <HeroImage loaiId={loaiId} />
        </div>
        <div className="loai-detail-hero__accent" aria-hidden />
      </section>

      <div className="container page-shell loai-detail-body">
        {loai.moTa && (
          <section className="loai-detail-about card animate-slide-up">
            <h2 className="loai-detail-section-title">Giới thiệu</h2>
            <p className="loai-detail-about__text">{loai.moTa}</p>
          </section>
        )}

        <section className="loai-detail-reviews card animate-slide-up">
          <div className="loai-detail-reviews__head">
            <h2 className="loai-detail-section-title">Đánh giá từ khách</h2>
            {diemTrungBinh != null && (
              <div className="loai-detail-reviews__avg">
                <span className="loai-detail-reviews__avg-num">
                  {diemTrungBinh}
                </span>
                <StarsRow value={Math.round(diemTrungBinh)} />
                <span className="loai-detail-reviews__avg-count text-muted text-sm">
                  {danhGia.length} nhận xét
                </span>
              </div>
            )}
          </div>

          {danhGia.length === 0 ? (
            <div className="loai-detail-empty">
              <div className="loai-detail-empty__icon" aria-hidden>
                ★
              </div>
              <p className="loai-detail-empty__title">Chưa có đánh giá</p>
              <p className="loai-detail-empty__sub">
                Hãy là người đầu tiên chia sẻ trải nghiệm về loại phòng này.
              </p>
            </div>
          ) : (
            <ul className="loai-detail-review-list">
              {danhGia.map((d) => (
                <li key={d.id} className="loai-detail-review-item">
                  <div className="loai-detail-review-item__top">
                    <strong className="loai-detail-review-item__name">
                      {d.tenHienThi}
                    </strong>
                    <StarsRow value={d.diem} />
                  </div>
                  <time
                    className="loai-detail-review-item__time text-muted text-sm"
                    dateTime={d.thoiDiem}
                  >
                    {new Date(d.thoiDiem).toLocaleString("vi-VN")}
                  </time>
                  {d.noiDung && (
                    <p className="loai-detail-review-item__body">{d.noiDung}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {isKhachHang && (
          <section className="loai-detail-form-wrap card animate-slide-up">
            <h2 className="loai-detail-section-title">Viết đánh giá</h2>
            <p className="loai-detail-form-lead text-muted text-sm">
              Mỗi tài khoản chỉ gửi một đánh giá cho mỗi loại phòng. Chọn sao và
              mô tả ngắn gọn trải nghiệm của bạn.
            </p>
            <form onSubmit={guiDanhGia} className="loai-detail-form">
              <div className="loai-detail-form__row">
                <span className="loai-detail-form__label">Điểm</span>
                <div
                  className="loai-detail-star-pick"
                  role="group"
                  aria-label="Chọn từ 1 đến 5 sao"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`loai-detail-star-btn${form.diem === n ? " loai-detail-star-btn--on" : ""}`}
                      onClick={() => setForm({ ...form, diem: n })}
                      aria-pressed={form.diem === n}
                    >
                      <span aria-hidden>★</span>
                      <span className="visually-hidden">{n} sao</span>
                    </button>
                  ))}
                </div>
                <span className="loai-detail-form__score text-muted text-sm">
                  {form.diem}/5
                </span>
              </div>
              <div className="form-group loai-detail-form__field">
                <label htmlFor="dg-noi-dung">Nội dung</label>
                <textarea
                  id="dg-noi-dung"
                  rows={4}
                  value={form.noiDung}
                  onChange={(e) =>
                    setForm({ ...form, noiDung: e.target.value })
                  }
                  placeholder="Ví dụ: Phòng sạch, view đẹp, nhân viên nhiệt tình…"
                  className="loai-detail-textarea"
                />
              </div>
              <button type="submit" className="btn btn-lg loai-detail-submit">
                <Send className="btn-ico" aria-hidden />
                Gửi đánh giá
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
