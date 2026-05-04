import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DIA_CHI_DAY_DU =
  "120 Đường Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, TP. Đà Nẵng";
const MAPS_QUERY = encodeURIComponent(
  "Royal Lotus Hotel Đà Nẵng " + DIA_CHI_DAY_DU,
);

function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const TIEN_ICH = [
  {
    t: "Wi‑Fi tốc độ cao",
    d: "Miễn phí toàn khuôn viên — phù hợp họp online & streaming.",
  },
  {
    t: "Bãi đỗ xe",
    d: "Chỗ đậu cho khách lưu trú (theo tình trạng thực tế tại chỗ).",
  },
  {
    t: "Hồ bơi & gym",
    d: "Giờ mở cửa theo biển thông báo tại sảnh — vui lòng hỏi lễ tân.",
  },
  {
    t: "Nhà hàng & bar",
    d: "Phục vụ bữa sáng buffet và ẩm thực — đặt bàn qua lễ tân.",
  },
  {
    t: "Dịch vụ phòng",
    d: "Gọi món, dọn phòng, giặt ủi theo bảng giá niêm yết.",
  },
  {
    t: "Hỗ trợ & chat",
    d: "Liên hệ lễ tân hoặc chat trong ứng dụng khi cần.",
  },
];

export default function Info() {
  const { isKhachHang, user } = useAuth();

  return (
    <div className="info-page">
      <section className="info-hero" aria-labelledby="info-heading">
        <div className="info-hero__mesh" aria-hidden />
        <div className="info-hero__glow info-hero__glow--1" aria-hidden />
        <div className="info-hero__glow info-hero__glow--2" aria-hidden />
        <div className="container info-hero__inner">
          <p className="info-hero__eyebrow">Royal Lotus Hotel · Đà Nẵng</p>
          <h1 id="info-heading" className="info-hero__title">
            Thông tin &amp; chính sách lưu trú
          </h1>
          <p className="info-hero__lead">
            Mọi thứ bạn cần trước khi đến: liên hệ, giờ nhận — trả phòng, tiện
            ích và các điều khoản minh bạch — để lưu trú suôn sẻ.
          </p>
          <ul className="info-hero__chips" role="list">
            <li>Nhận phòng từ 14:00</li>
            <li>Trả phòng trước 12:00</li>
            <li>Thanh toán payOS</li>
            <li>Hỗ trợ tiếng Việt</li>
          </ul>
        </div>
      </section>

      <div className="container page-shell info-page__body">
        <section
          className="info-quick-strip animate-slide-up"
          aria-label="Tóm tắt nhanh"
        >
          <div className="info-quick-strip__item">
            <span className="info-quick-strip__val">14:00</span>
            <span className="info-quick-strip__lbl">Nhận phòng từ</span>
          </div>
          <div className="info-quick-strip__item">
            <span className="info-quick-strip__val">12:00</span>
            <span className="info-quick-strip__lbl">Trả phòng trước</span>
          </div>
          <div className="info-quick-strip__item">
            <span className="info-quick-strip__val">24/7</span>
            <span className="info-quick-strip__lbl">Lễ tân &amp; an ninh</span>
          </div>
          <div className="info-quick-strip__item">
            <span className="info-quick-strip__val">Wi‑Fi</span>
            <span className="info-quick-strip__lbl">Miễn phí</span>
          </div>
        </section>

        <div className="info-two-col mb-section">
          <article className="card info-card info-card--accent animate-slide-up animate-delay-1">
            <h2 className="info-card__head">
              <span className="info-card__icon" aria-hidden>
                <IconPin />
              </span>
              Liên hệ &amp; địa chỉ
            </h2>
            <p className="info-card__brand">
              <strong>Royal Lotus Hotel</strong>
            </p>
            <address className="info-address">{DIA_CHI_DAY_DU}</address>
            <dl className="info-contact-dl">
              <div>
                <dt>
                  <IconPhone /> Điện thoại
                </dt>
                <dd>
                  <a href="tel:+842363888888">0236 3 888 888</a>
                </dd>
              </div>
              <div>
                <dt>
                  <IconMail /> Email
                </dt>
                <dd>
                  <a href="mailto:welcome.danang@royallotushotel.vn">
                    welcome.danang@royallotushotel.vn
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
              className="btn btn-secondary info-map-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở chỉ đường trên Google Maps
            </a>
          </article>

          <article className="card info-card animate-slide-up animate-delay-2">
            <h2 className="info-card__head">
              <span className="info-card__icon" aria-hidden>
                <IconClock />
              </span>
              Giờ nhận &amp; trả phòng
            </h2>
            <div className="info-timeline">
              <div className="info-timeline__row">
                <span className="info-timeline__time">14:00</span>
                <div>
                  <strong>Nhận phòng</strong>
                  <p>
                    Phòng sẵn sàng từ 14:00 (giờ địa phương). Đến sớm? Gửi hành
                    lý và nhận thẻ khi có phòng — phụ phí có thể áp dụng nếu
                    nhận sớm là chắc chắn.
                  </p>
                </div>
              </div>
              <div className="info-timeline__row">
                <span className="info-timeline__time">12:00</span>
                <div>
                  <strong>Trả phòng</strong>
                  <p>
                    Vui lòng trả phòng và trả chìa khóa trước 12:00. Trả muộn có
                    thể phát sinh phí theo quy định — vui lòng báo lễ tân trước
                    để sắp xếp.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <section className="mb-section animate-slide-up animate-delay-2">
          <h2 className="page-title info-section-title">Tiện ích nổi bật</h2>
          <p className="page-subtitle page-subtitle--tight info-section-sub">
            Phục vụ lưu trú ngắn và dài ngày — chi tiết giờ hoạt động có thể thay
            đổi theo mùa; vui lòng xác nhận tại lễ tân khi đến.
          </p>
          <div className="info-amenity-grid">
            {TIEN_ICH.map((x) => (
              <article key={x.t} className="info-amenity-tile">
                <h3 className="info-amenity-tile__title">{x.t}</h3>
                <p className="info-amenity-tile__desc">{x.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-section animate-slide-up">
          <h2 className="page-title info-section-title">
            Chính sách &amp; lưu ý
          </h2>
          <div className="info-policy-grid">
            <article className="card info-policy-card">
              <h3 className="card-title">Đặt phòng &amp; thanh toán</h3>
              <p>
                Giữ phòng sau khi thanh toán thành công qua payOS. Điều kiện hủy
                và hoàn tiền theo gói chính sách hủy bạn chọn lúc đặt — kiểm tra
                trong email xác nhận và màn <strong>Đơn của tôi</strong>.
              </p>
            </article>
            <article className="card info-policy-card">
              <h3 className="card-title">An toàn &amp; trật tự</h3>
              <p>
                Không hút thuốc trong phòng và khu vực cấm. Giữ im lặng sau
                22:00 để tôn trọng khách khác. Khách chịu trách nhiệm với tài
                sản đã kê khai khi nhận phòng.
              </p>
            </article>
            <article className="card info-policy-card">
              <h3 className="card-title">Tài sản &amp; thất lạc</h3>
              <p>
                Sử dụng két an toàn cho giấy tờ và vật có giá trị. Đồ thất lạc
                sẽ được lưu giới hạn thời gian — liên hệ lễ tân để nhận lại.
              </p>
            </article>
          </div>
        </section>

        <section className="mb-section info-faq animate-slide-up">
          <h2 className="page-title info-section-title">
            Câu hỏi thường gặp
          </h2>
          <div className="info-faq-list">
            <details className="info-faq-item">
              <summary>Làm sao để đổi ngày hoặc hủy đơn?</summary>
              <p>
                Vào mục Đơn của tôi nếu đơn còn trong thời gian cho phép. Mức phí
                hủy phụ thuộc chính sách đã chọn — hiển thị rõ trước khi bạn xác
                nhận trên hệ thống.
              </p>
            </details>
            <details className="info-faq-item">
              <summary>Tôi có thể thêm giường phụ hoặc bữa sáng không?</summary>
              <p>
                Có — vui lòng đặt trước qua lễ tân hoặc khi nhận phòng. Giá theo
                bảng niêm yết tại khách sạn.
              </p>
            </details>
            <details className="info-faq-item">
              <summary>Khách sạn có đón sân bay không?</summary>
              <p>
                Dịch vụ đưa đón có thể sắp xếp theo yêu cầu (phụ phí). Liên hệ
                hotline hoặc email trước giờ bay để được báo giá và xác nhận xe.
              </p>
            </details>
            <details className="info-faq-item">
              <summary>Trẻ em và giường phụ tính thế nào?</summary>
              <p>
                Trẻ em ngủ chung giường với người lớn theo chính sách từng loại
                phòng. Giường phụ và bữa trẻ em — xin hỏi lễ tân khi đặt hoặc
                nhận phòng.
              </p>
            </details>
          </div>
        </section>

        <section className="info-cta card animate-slide-up">
          <div className="info-cta__copy">
            <h2 className="info-cta__title">Sẵn sàng đặt chỗ?</h2>
            <p className="info-cta__sub">
              Xem phòng trống theo ngày, giữ giá và thanh toán an toàn — hoặc
              đăng nhập để tiếp tục đơn dang dở.
            </p>
          </div>
          <div className="info-cta__actions">
            <Link to="/phong" className="btn btn-lg">
              Xem danh sách phòng
            </Link>
            {isKhachHang ? (
              <>
                <Link to="/dat-phong" className="btn btn-lg btn-secondary">
                  Đặt phòng
                </Link>
                <Link to="/chat" className="btn btn-lg btn-secondary">
                  Chat hỗ trợ
                </Link>
              </>
            ) : (
              <>
                <Link to="/dang-nhap" className="btn btn-lg btn-secondary">
                  Đăng nhập khách
                </Link>
                {!user && (
                  <Link to="/dang-ky" className="btn btn-lg btn-secondary">
                    Đăng ký
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
