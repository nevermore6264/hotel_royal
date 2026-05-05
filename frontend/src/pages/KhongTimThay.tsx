import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function KhongTimThay() {
  return (
    <div className="container page-shell">
      <div className="card empty-state-card animate-fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
        <div className="empty-state-card__icon" aria-hidden>
          404
        </div>
        <h1 className="page-title" style={{ marginTop: "1rem" }}>
          Không tìm thấy trang
        </h1>
        <p className="text-muted">
          Đường dẫn không tồn tại hoặc đã được đổi. Quay về trang chủ để tiếp tục.
        </p>
        <Link to="/" className="btn mt-4">
          <Home className="btn-ico" aria-hidden />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
