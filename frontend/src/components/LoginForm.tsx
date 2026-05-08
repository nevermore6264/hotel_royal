import { useState } from "react";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  /** Giao diện ô đăng nhập nhỏ trên trang chủ */
  laGon?: boolean;
  khiDangNhapThanhCong?: () => void;
};

export default function LoginForm({
  laGon = false,
  khiDangNhapThanhCong,
}: Props) {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [baoLoi, setBaoLoi] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const laDangGon = laGon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBaoLoi("");
    try {
      await login(tenDangNhap, matKhau);
      if (khiDangNhapThanhCong) khiDangNhapThanhCong();
      else navigate("/");
    } catch (err: unknown) {
      setBaoLoi(
        (err as { response?: { data?: { loi?: string } } })?.response?.data
          ?.loi || "Đăng nhập thất bại",
      );
    }
  };

  return (
    <form
      className={laDangGon ? "home-login-form" : undefined}
      onSubmit={handleSubmit}
    >
      {!laDangGon && (
        <>
          <p className="auth-brand">Royal Lotus</p>
          <h1 className="auth-split__title">Đăng nhập</h1>
          <p className="auth-lead">
            Tiếp tục để đặt phòng, xem đơn và quản lý lưu trú.
          </p>
        </>
      )}
      {laDangGon && (
        <p className="home-login-form__title">Đăng nhập</p>
      )}
      <div className="form-group">
        <label>Tên đăng nhập</label>
        <input
          type="text"
          value={tenDangNhap}
          onChange={(e) => setTenDangNhap(e.target.value)}
          autoComplete="username"
          placeholder="Nhập tên đăng nhập"
          required
        />
      </div>
      <div className="form-group">
        <label>Mật khẩu</label>
        <input
          type="password"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          required
        />
      </div>
      {baoLoi && <p className="form-error">{baoLoi}</p>}
      <button
        type="submit"
        className={`btn btn-block ${laDangGon ? "btn-lg btn-landing-main" : "btn-lg"}`}
      >
        <LogIn className="btn-ico" aria-hidden />
        Đăng nhập
      </button>
      <p className={laDangGon ? "home-login-form__footer" : "auth-footer"}>
        Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link>
      </p>
    </form>
  );
}
