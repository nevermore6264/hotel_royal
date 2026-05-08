import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function DangKy() {
  const [form, setForm] = useState({
    tenDangNhap: "",
    matKhau: "",
    email: "",
    hoTen: "",
    soDienThoai: "",
    loaiTaiKhoan: "" as "" | "VANG_LAI",
  });
  const [baoLoi, setBaoLoi] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBaoLoi("");
    try {
      await register({
        tenDangNhap: form.tenDangNhap,
        matKhau: form.matKhau,
        email: form.email,
        hoTen: form.hoTen,
        soDienThoai: form.soDienThoai || undefined,
        loaiTaiKhoan: form.loaiTaiKhoan === "VANG_LAI" ? "VANG_LAI" : undefined,
      });
      navigate("/");
    } catch (err: unknown) {
      setBaoLoi(
        (err as { response?: { data?: { loi?: string } } })?.response?.data?.loi ||
          "Đăng ký thất bại",
      );
    }
  };

  return (
    <AuthSplitLayout>
      <div className="auth-split-card auth-split-card--wide animate-scale-in">
        <p className="auth-brand">Royal Lotus</p>
        <h1 className="auth-split__title">Đăng ký</h1>
        <p className="auth-lead">
          Tạo tài khoản để đặt phòng và nhận xác nhận qua email.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Họ tên</label>
              <input
                value={form.hoTen}
                onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                placeholder="Họ và tên đầy đủ"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                value={form.soDienThoai}
                onChange={(e) =>
                  setForm({ ...form, soDienThoai: e.target.value })
                }
                autoComplete="tel"
                placeholder="09xx xxx xxx (tuỳ chọn)"
              />
            </div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                value={form.tenDangNhap}
                onChange={(e) =>
                  setForm({ ...form, tenDangNhap: e.target.value })
                }
                autoComplete="username"
                placeholder="Tên đăng nhập (không dấu cách)"
                required
              />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={form.matKhau}
                onChange={(e) => setForm({ ...form, matKhau: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div className="form-group">
              <label>Loại tài khoản</label>
              <select
                value={form.loaiTaiKhoan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    loaiTaiKhoan: e.target.value as "" | "VANG_LAI",
                  })
                }
              >
                <option value="">Khách đặt phòng</option>
                <option value="VANG_LAI">Khách vãng lai (chỉ xem phòng)</option>
              </select>
            </div>
          </div>
          {baoLoi && <p className="form-error">{baoLoi}</p>}
          <button type="submit" className="btn btn-block btn-lg">
            <UserPlus className="btn-ico" aria-hidden />
            Đăng ký
          </button>
        </form>
        <p className="auth-footer">
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
