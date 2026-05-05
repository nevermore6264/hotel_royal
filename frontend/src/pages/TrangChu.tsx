import { BedDouble, CalendarPlus, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";

function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M19 13l.8 2.8L22 17l-2.2 1.2L19 21l-.8-2.8L16 17l2.2-1.2L19 13z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STATS = [
  { value: "4.9", label: "Điểm hài lòng", hint: "Khách đánh giá" },
  { value: "24/7", label: "Hỗ trợ online", hint: "Luôn sẵn sàng" },
  { value: "100%", label: "Thanh toán bảo mật", hint: "payOS" },
  { value: "50+", label: "Phòng & suite", hint: "Đa dạng loại hình" },
];

const STEPS = [
  {
    n: "01",
    t: "Chọn ngày & loại phòng",
    d: "Lọc theo lịch trình của bạn, xem giá và tình trạng còn trống.",
  },
  {
    n: "02",
    t: "Thanh toán an toàn",
    d: "Qua payOS — QR/chuyển khoản an toàn, xác nhận giao dịch tự động.",
  },
  {
    n: "03",
    t: "Nhận phòng & theo dõi đơn",
    d: "Mã đơn rõ ràng; hủy/đổi theo chính sách hiển thị trong hệ thống.",
  },
];

const US = (photoPath: string) =>
  `https://images.unsplash.com/${photoPath}?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=82`;

type GalleryItem = {
  label: string;
  src: string;
  alt: string;
  fallback?: string;
};

const GALLERY: GalleryItem[] = [
  {
    label: "Lobby · lễ tân",
    src: US("photo-1566073771259-6a8506099945"),
    alt: "Không gian sảnh khách sạn sang trọng",
    fallback: US("photo-1520250497591-112f2f40a3f4"),
  },
  {
    label: "Phòng Deluxe",
    src: US("photo-1618773928121-c32242e63f39"),
    alt: "Phòng khách sạn hiện đại, giường và nội thất",
    fallback: US("photo-1582719478250-c89cae4dc85b"),
  },
  {
    label: "Suite góc",
    src: US("photo-1590490360182-c33d57733427"),
    alt: "Suite rộng với phòng khách",
    fallback: US("photo-1611892440504-42a792e24d32"),
  },
  {
    label: "Nhà hàng",
    src: US("photo-1517248135467-4c7edcad34c4"),
    alt: "Không gian nhà hàng trong khách sạn",
    fallback: US("photo-1414235077428-338989a2e8c0"),
  },
  {
    label: "Spa · gym",
    src: US("photo-1544161515-4ab6ce6db874"),
    alt: "Khu spa thư giãn",
    fallback: US("photo-1540555700478-4be289fbecef"),
  },
  {
    label: "Sky bar",
    src: US("photo-1514933651103-005eec06c04b"),
    alt: "Không gian bar view thành phố",
    fallback: US("photo-1470337458703-46ad1756a187"),
  },
];

function GalleryImage({ item }: { item: GalleryItem }) {
  return (
    <img
      className="landing-gallery__img"
      src={item.src}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      width={900}
      height={675}
      onError={(e) => {
        const el = e.currentTarget;
        if (item.fallback && el.src !== item.fallback) {
          el.src = item.fallback;
        }
      }}
    />
  );
}

const QUOTES = [
  {
    q: "Đặt phòng nhanh, email xác nhận rõ ràng. Không phải chờ lễ tân gọi lại.",
    a: "Chị Minh Anh",
    r: "Khách lưu trú",
  },
  {
    q: "Một màn hình cho đơn, nhận phòng và dịch vụ — đỡ nhầm giữa các bộ phận.",
    a: "Anh Tuấn",
    r: "Lễ tân",
  },
  {
    q: "Bảng điều khiển doanh thu và tỉ lệ lấp phòng giúp tôi quyết định giá theo mùa.",
    a: "Chị Lan",
    r: "Quản trị",
  },
];

export default function TrangChu() {
  const { isKhachHang, user } = useAuth();

  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="landing-heading">
        <div className="landing-hero__mesh" aria-hidden />
        <div className="landing-hero__glow landing-hero__glow--1" aria-hidden />
        <div className="landing-hero__glow landing-hero__glow--2" aria-hidden />

        <div
          className={`container landing-hero__grid${user ? "" : " landing-hero__grid--with-login"}`}
        >
          <div className="landing-hero__copy">
            <p className="landing-eyebrow">
              <IconSparkle /> Royal Lotus Hotel
            </p>
            <h1 id="landing-heading" className="landing-title">
              Không gian nghỉ dưỡng
              <span className="landing-title__line2">
                {" "}
                — đặt phòng chỉ vài phút.
              </span>
            </h1>
            <p className="landing-lead">
              Đặt ngay trên trang chủ, thanh toán bảo mật và theo dõi đơn minh
              bạch — dành cho khách, lễ tân và ban quản trị.
            </p>

            <div className="landing-actions">
              <Link to="/phong" className="btn btn-lg btn-landing-main">
                <BedDouble className="btn-ico" aria-hidden />
                Xem phòng &amp; giá
              </Link>
              {isKhachHang ? (
                <Link to="/dat-phong" className="btn btn-lg btn-landing-ghost">
                  <CalendarPlus className="btn-ico" aria-hidden />
                  Đặt phòng ngay
                </Link>
              ) : (
                <Link to="/dang-ky" className="btn btn-lg btn-landing-ghost">
                  <UserPlus className="btn-ico" aria-hidden />
                  Tạo tài khoản
                </Link>
              )}
            </div>

            <ul className="landing-trust" role="list">
              <li>
                <span className="landing-trust__dot" aria-hidden />
                {!user
                  ? "Đăng nhập ngay trên trang chủ"
                  : "Theo dõi đơn & lịch lưu trú"}
              </li>
              <li>
                <span className="landing-trust__dot" aria-hidden />
                payOS
              </li>
              <li>
                <span className="landing-trust__dot" aria-hidden />
                Xác nhận qua email
              </li>
            </ul>
          </div>

          {!user ? (
            <div className="landing-hero__aside">
              <div className="home-login-card" id="home-login">
                <LoginForm variant="compact" onSuccess={() => undefined} />
              </div>
              <div className="landing-peek" aria-hidden>
                <article className="landing-mini-card landing-mini-card--a">
                  <span className="landing-mini-card__label">Deluxe City</span>
                  <span className="landing-mini-card__price">từ 1.2tr/đêm</span>
                  <span className="landing-mini-card__hint">
                    Wi‑Fi · view thành phố
                  </span>
                </article>
                <article className="landing-mini-card landing-mini-card--b">
                  <span className="landing-mini-card__label">
                    Suite Executive
                  </span>
                  <span className="landing-mini-card__price">
                    từ 2.4tr/đêm
                  </span>
                  <span className="landing-mini-card__hint">
                    Bồn tắm · minibar
                  </span>
                </article>
              </div>
            </div>
          ) : (
            <aside className="landing-showcase" aria-hidden>
              <div className="landing-showcase__frame">
                <div className="landing-showcase__badge">
                  Phòng trống thời gian thực
                </div>
                <div className="landing-showcase__stack">
                  <article className="landing-mini-card landing-mini-card--a">
                    <span className="landing-mini-card__label">Deluxe City</span>
                    <span className="landing-mini-card__price">
                      từ 1.2tr/đêm
                    </span>
                    <span className="landing-mini-card__hint">
                      Wi‑Fi · view thành phố
                    </span>
                  </article>
                  <article className="landing-mini-card landing-mini-card--b">
                    <span className="landing-mini-card__label">
                      Suite Executive
                    </span>
                    <span className="landing-mini-card__price">
                      từ 2.4tr/đêm
                    </span>
                    <span className="landing-mini-card__hint">
                      Bồn tắm · minibar
                    </span>
                  </article>
                </div>
                <div className="landing-showcase__shine" />
              </div>
            </aside>
          )}
        </div>
      </section>

      <section className="landing-stats" aria-label="Thống kê">
        <div className="container landing-stats__grid">
          {STATS.map((s) => (
            <div key={s.label} className="landing-stat">
              <span className="landing-stat__value">{s.value}</span>
              <span className="landing-stat__label">{s.label}</span>
              <span className="landing-stat__hint">{s.hint}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container landing-features" aria-labelledby="features-heading">
        <header className="landing-section-head">
          <h2 id="features-heading">Một nền tảng cho mọi vai trò</h2>
          <p>
            Khách đặt nhanh — nhân viên xử lý gọn — quản trị theo dõi doanh thu
            và tình trạng phòng.
          </p>
        </header>

        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <div className="landing-feature-card__icon" aria-hidden>
              <IconCalendar />
            </div>
            <h3>Đặt phòng trực tuyến</h3>
            <p>
              Chọn ngày nhận — trả, lọc loại phòng và thanh toán an toàn. Phù
              hợp khách hàng đã đăng ký.
            </p>
            <Link to="/phong" className="landing-feature-card__link">
              Mở danh sách phòng
            </Link>
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-card__icon" aria-hidden>
              <IconShield />
            </div>
            <h3>Đơn &amp; trạng thái rõ ràng</h3>
            <p>
              Theo dõi mã đơn, trạng thái xác nhận và hủy trong điều kiện chính
              sách.
            </p>
            {isKhachHang ? (
              <Link to="/don-cua-toi" className="landing-feature-card__link">
                Xem đơn của tôi
              </Link>
            ) : (
              <span className="landing-feature-card__muted">
                Đăng nhập (trang chủ hoặc menu) để xem đơn.
              </span>
            )}
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-card__icon" aria-hidden>
              <IconLayers />
            </div>
            <h3>Vận hành &amp; lễ tân</h3>
            <p>
              Quản trị phòng, đặt tại quầy, nhận — trả phòng và xuất hóa đơn —
              trong một hệ thống.
            </p>
            <span className="landing-feature-card__muted">
              {user
                ? "Dùng menu trên để vào khu vực theo quyền của bạn."
                : "Đăng nhập để truy cập bảng điều khiển theo vai trò."}
            </span>
          </article>
        </div>
      </section>

      <section className="landing-steps-wrap" aria-labelledby="steps-heading">
        <div className="container">
          <header className="landing-section-head">
            <h2 id="steps-heading">Chỉ ba bước</h2>
            <p>Từ chọn ngày đến xác nhận — gọn gàng, không rối.</p>
          </header>
          <ol className="landing-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="landing-step">
                <span className="landing-step__num">{s.n}</span>
                <h3 className="landing-step__title">{s.t}</h3>
                <p className="landing-step__desc">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container landing-gallery-wrap" aria-labelledby="gallery-heading">
        <header className="landing-section-head">
          <h2 id="gallery-heading">Không gian &amp; tiện nghi</h2>
          <p>
            Từ phòng city view đến suite rộng — mỗi loại hình được cấu hình giá
            và mô tả trong hệ thống.
          </p>
        </header>
        <div className="landing-gallery">
          {GALLERY.map((item) => (
            <figure key={item.label} className="landing-gallery__cell">
              <div className="landing-gallery__img-wrap">
                <GalleryImage item={item} />
              </div>
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="landing-quotes-wrap" aria-labelledby="quotes-heading">
        <div className="container">
          <header className="landing-section-head">
            <h2 id="quotes-heading">Phản hồi từ người dùng</h2>
            <p>Khách, lễ tân và quản trị — cùng một nền tảng.</p>
          </header>
          <div className="landing-quotes">
            {QUOTES.map((x) => (
              <blockquote key={x.a} className="landing-quote">
                <p className="landing-quote__text">&ldquo;{x.q}&rdquo;</p>
                <footer>
                  <strong>{x.a}</strong>
                  <span className="landing-quote__role">{x.r}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-partners" aria-labelledby="partners-heading">
        <div className="container landing-partners__inner">
          <span id="partners-heading" className="landing-partners__label">
            Thanh toán trực tuyến
          </span>
          <div className="landing-partners__logos">
            <span className="landing-partners__brand">payOS</span>
            <span className="landing-partners__muted">Xác nhận email</span>
            <span className="landing-partners__muted">Kết nối bảo mật</span>
          </div>
        </div>
      </section>

      <section className="landing-cta" aria-labelledby="cta-heading">
        <div className="container">
          <div className="landing-cta__shell">
            <div className="landing-cta__accent" aria-hidden />
            <div className="landing-cta__grid">
              <div className="landing-cta__copy">
                <p className="landing-cta__eyebrow">Đặt chỗ trực tuyến</p>
                <h2 id="cta-heading">Sẵn sàng chọn phòng?</h2>
                <p className="landing-cta__lead">
                  {user ? (
                    <>
                      Chọn ngày nhận — trả, lọc loại phòng và xem giá. Tiếp tục
                      đặt chỗ hoặc xem đơn trong menu trên.
                    </>
                  ) : (
                    <>
                      Chọn ngày nhận — trả, lọc loại phòng và xem giá ngay. Đã có
                      tài khoản?{" "}
                      <a href="#home-login" className="landing-cta__inline-link">
                        Đăng nhập phía trên
                      </a>{" "}
                      để đặt nhanh hơn.
                    </>
                  )}
                </p>
              </div>
              <div className="landing-cta__btns">
                <Link to="/phong" className="landing-cta__primary">
                  <span>Xem phòng trống</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                {!user && (
                  <a href="#home-login" className="landing-cta__secondary">
                    Đã có tài khoản? Đăng nhập tại đây
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
