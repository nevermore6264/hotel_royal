import { useSearchParams, Link } from "react-router-dom";

export default function BookingSuccess() {
  const [params] = useSearchParams();
  const idDatPhong = params.get("idDatPhong");

  return (
    <div className="container page-auth page-success page-shell">
      <div className="card auth-card animate-scale-in">
        <p className="auth-brand">Hoàn tất</p>
        <div className="page-success-icon" aria-hidden>
          ✓
        </div>
        <h1>Đặt phòng thành công</h1>
        {idDatPhong && (
          <p>
            Mã đơn:{" "}
            <strong className="text-accent" style={{ fontSize: "1.1rem" }}>
              #{idDatPhong}
            </strong>
          </p>
        )}
        <p className="text-muted">
          Email xác nhận đã được gửi đến hộp thư của bạn.
        </p>
        <Link to="/don-cua-toi" className="btn btn-lg btn-block mt-4">
          Xem đơn của tôi
        </Link>
        <p className="auth-footer" style={{ marginBottom: 0 }}>
          <Link to="/">Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
