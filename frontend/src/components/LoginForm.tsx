import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  variant?: "compact" | "full";
  onSuccess?: () => void;
};

export default function LoginForm({ variant = "full", onSuccess }: Props) {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const compact = variant === "compact";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(tenDangNhap, matKhau);
      if (onSuccess) onSuccess();
      else navigate("/");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Đăng nhập thất bại",
      );
    }
  };

  return (
    <form
      className={compact ? "home-login-form" : undefined}
      onSubmit={handleSubmit}
    >
      {!compact && (
        <>
          <p className="auth-brand">Royal Lotus</p>
          <h1 className="auth-split__title">Đăng nhập</h1>
          <p className="auth-lead">
            Tiếp tục để đặt phòng, xem đơn và quản lý lưu trú.
          </p>
        </>
      )}
      {compact && (
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
      {error && <p className="form-error">{error}</p>}
      <button
        type="submit"
        className={`btn btn-block ${compact ? "btn-lg btn-landing-main" : "btn-lg"}`}
      >
        Đăng nhập
      </button>
      <p className={compact ? "home-login-form__footer" : "auth-footer"}>
        Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link>
      </p>
    </form>
  );
}
