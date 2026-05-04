import { Link } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function AuthSplitLayout({ children }: Props) {
  return (
    <div className="auth-split">
      <Link to="/" className="auth-split__skip">
        Về trang chủ
      </Link>
      <div className="auth-split__visual" aria-hidden>
        <div className="auth-split__visual-mesh" />
        <div className="auth-split__visual-glow auth-split__visual-glow--1" />
        <div className="auth-split__visual-glow auth-split__visual-glow--2" />
        <div className="auth-split__visual-inner">
          <p className="auth-split__kicker">Royal Lotus Hotel</p>
          <h2 className="auth-split__headline">
            Mỗi đêm là
            <br />
            <span>một trải nghiệm</span>
          </h2>
          <p className="auth-split__tagline">
            Hệ thống đặt phòng và vận hành — an toàn, minh bạch, luôn đồng hành
            cùng bạn.
          </p>
          <ul className="auth-split__bullets">
            <li>Thanh toán payOS</li>
            <li>Xác nhận tức thì qua email</li>
            <li>Hỗ trợ đa vai trò: khách — lễ tân — quản trị</li>
          </ul>
        </div>
      </div>
      <div className="auth-split__panel">
        <header className="auth-split__panel-head">
          <Link to="/" className="auth-split__logo">
            Royal <span>Lotus</span>
          </Link>
        </header>
        <div className="auth-split__panel-body">{children}</div>
      </div>
    </div>
  );
}
