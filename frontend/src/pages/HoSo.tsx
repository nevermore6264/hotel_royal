import { useState, useEffect, useMemo } from "react";
import { KeyRound, Save } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

type HoSo = {
  id: number;
  tenDangNhap: string;
  email: string;
  hoTen: string;
  soDienThoai?: string;
};

function initials(hoTen: string, tenDangNhap: string): string {
  const s = hoTen?.trim() || tenDangNhap || "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

function vaiTroLabel(ma: string): string {
  const m: Record<string, string> = {
    ROLE_KHACH_HANG: "Khách hàng",
    ROLE_QUAN_TRI: "Quản trị",
    ROLE_LE_TAN: "Lễ tân",
    ROLE_BUONG_PHONG: "Buồng phòng",
    ROLE_VANG_LAI: "Vãng lai",
  };
  return m[ma] ?? ma.replace(/^ROLE_/, "");
}

function IconUserCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.2L17 7l-3.8 1.8L12 13l-1.2-4.2L7 7l3.8-1.8L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function HoSo() {
  const { refreshSession, user, isKhachHang } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<HoSo | null>(null);
  const [pwd, setPwd] = useState({ cu: "", moi: "" });

  useEffect(() => {
    api
      .get("/ho-so")
      .then((r) => setForm(r.data))
      .finally(() => setLoading(false));
  }, []);

  const ch = initials(form?.hoTen ?? "", form?.tenDangNhap ?? "");

  const vaiTroHienThi = useMemo(() => {
    if (!user?.vaiTro?.length) return [];
    return user.vaiTro.map(vaiTroLabel);
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      await api.put("/ho-so", {
        hoTen: form.hoTen,
        soDienThoai: form.soDienThoai,
        email: form.email,
      });
      await refreshSession();
      toast("Đã cập nhật hồ sơ.", "success");
    } catch (err) {
      toast(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không lưu được hồ sơ.",
        "error",
      );
    }
  };

  const savePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/ho-so/doi-mat-khau", {
        matKhauCu: pwd.cu,
        matKhauMoi: pwd.moi,
      });
      setPwd({ cu: "", moi: "" });
      toast("Đã đổi mật khẩu.", "success");
    } catch (err) {
      toast(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đổi mật khẩu thất bại.",
        "error",
      );
    }
  };

  if (loading || !form) {
    return (
      <div className="profile-page">
        <div className="profile-hero profile-hero--loading">
          <div className="container profile-hero__inner">
            <div className="profile-skeleton profile-skeleton--hero" />
          </div>
        </div>
        <div className="container page-shell profile-body">
          <div className="profile-layout">
            <div className="profile-skeleton profile-skeleton--aside" />
            <div className="profile-skeleton profile-skeleton--main" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-hero" aria-labelledby="profile-heading">
        <div className="profile-hero__mesh" aria-hidden />
        <div className="profile-hero__glow profile-hero__glow--1" aria-hidden />
        <div className="container profile-hero__inner">
          <p className="profile-hero__eyebrow">
            <IconSpark /> Tài khoản Royal Lotus
          </p>
          <h1 id="profile-heading" className="profile-hero__title">
            Hồ sơ của bạn
          </h1>
          <p className="profile-hero__lead">
            Cập nhật họ tên, email và số điện thoại để lễ tân liên hệ đúng người.
            Đổi mật khẩu định kỳ để bảo vệ tài khoản.
          </p>
        </div>
        <div className="profile-hero__accent" aria-hidden />
      </section>

      <div className="container page-shell profile-body">
        <div className="profile-layout">
          <aside className="profile-aside card animate-slide-up">
            <div className="profile-avatar" aria-hidden>
              {ch}
            </div>
            <p className="profile-aside__name">
              {form.hoTen?.trim() || form.tenDangNhap}
            </p>
            <p className="profile-aside__user">@{form.tenDangNhap}</p>
            <p className="profile-aside__email">{form.email}</p>
            {vaiTroHienThi.length > 0 && (
              <ul className="profile-roles" aria-label="Vai trò">
                {vaiTroHienThi.map((v) => (
                  <li key={v} className="profile-role-pill">
                    {v}
                  </li>
                ))}
              </ul>
            )}
            <nav className="profile-quick" aria-label="Liên kết nhanh">
              {isKhachHang && (
                <>
                  <Link to="/don-cua-toi" className="profile-quick__link">
                    Đơn của tôi
                  </Link>
                  <Link to="/dat-phong" className="profile-quick__link">
                    Đặt phòng
                  </Link>
                  <Link to="/chat" className="profile-quick__link">
                    Chat hỗ trợ
                  </Link>
                </>
              )}
              <Link to="/thong-tin" className="profile-quick__link">
                Thông tin khách sạn
              </Link>
              <Link to="/phong" className="profile-quick__link">
                Danh sách phòng
              </Link>
            </nav>
          </aside>

          <div className="profile-main">
            <section className="profile-card card animate-slide-up animate-delay-1">
              <div className="profile-card__head">
                <span className="profile-card__icon" aria-hidden>
                  <IconUserCircle />
                </span>
                <div>
                  <h2 className="profile-card__title">Thông tin liên hệ</h2>
                  <p className="profile-card__sub">
                    Dùng cho xác nhận đặt phòng và liên lạc khi cần.
                  </p>
                </div>
              </div>
              <form onSubmit={saveProfile} className="profile-form">
                <div className="profile-form__grid">
                  <div className="form-group profile-form__full">
                    <label>Tên đăng nhập</label>
                    <input value={form.tenDangNhap} disabled />
                    <span className="profile-field-hint">
                      Không thể đổi tên đăng nhập.
                    </span>
                  </div>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      value={form.hoTen || ""}
                      onChange={(e) =>
                        setForm({ ...form, hoTen: e.target.value })
                      }
                      placeholder="Họ và tên"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      value={form.soDienThoai || ""}
                      onChange={(e) =>
                        setForm({ ...form, soDienThoai: e.target.value })
                      }
                      placeholder="0xxx xxx xxx"
                    />
                  </div>
                  <div className="form-group profile-form__full">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email || ""}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-lg profile-save">
                  <Save className="btn-ico" aria-hidden />
                  Lưu thông tin
                </button>
              </form>
            </section>

            <section className="profile-card profile-card--security card animate-slide-up animate-delay-2">
              <div className="profile-card__head">
                <span className="profile-card__icon" aria-hidden>
                  <IconLock />
                </span>
                <div>
                  <h2 className="profile-card__title">Bảo mật</h2>
                  <p className="profile-card__sub">
                    Nhập mật khẩu hiện tại và mật khẩu mới (tối thiểu 6 ký tự).
                  </p>
                </div>
              </div>
              <form onSubmit={savePwd} className="profile-form profile-form--narrow">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={pwd.cu}
                    onChange={(e) => setPwd({ ...pwd, cu: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={pwd.moi}
                    onChange={(e) => setPwd({ ...pwd, moi: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-lg btn-secondary profile-save">
                  <KeyRound className="btn-ico" aria-hidden />
                  Đổi mật khẩu
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
