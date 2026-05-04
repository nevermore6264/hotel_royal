import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="container page-shell">
      <div className="card empty-state-card animate-fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
        <div className="empty-state-card__icon" aria-hidden>
          403
        </div>
        <h1 className="page-title" style={{ marginTop: "1rem" }}>
          Không có quyền truy cập
        </h1>
        <p className="text-muted">
          Bạn không được phép xem trang này với tài khoản hiện tại.
        </p>
        <Link to="/" className="btn mt-4">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
