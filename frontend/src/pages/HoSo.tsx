import { useState, useEffect, useMemo } from "react";
import { KeyRound, Save } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { dungXacThuc } from "../context/NguCanhXacThuc";
import { dungThongBao } from "../context/NguCanhThongBao";

type HoSo = {
  id: number;
  tenDangNhap: string;
  email: string;
  hoTen: string;
  soDienThoai?: string;
};

type ProfileFieldErrors = Partial<
  Record<"hoTen" | "email" | "soDienThoai", string>
>;

function layLoiApi(err: unknown): string {
  const d = (err as { response?: { data?: { loi?: string; thongDiep?: string } } })
    ?.response?.data;
  return (d?.loi || d?.thongDiep || "").trim();
}

function mapLoiHoSoTuApi(msg: string): ProfileFieldErrors | null {
  const m = msg.toLowerCase();
  if (m.includes("email") && (m.includes("su dung") || m.includes("ton tai"))) {
    return { email: "Email này đã được dùng cho tài khoản khác." };
  }
  if (
    m.includes("dien thoai") &&
    (m.includes("su dung") || m.includes("ton tai"))
  ) {
    return {
      soDienThoai: "Số điện thoại này đã được dùng cho tài khoản khác.",
    };
  }
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hopLeSoDienThoaiTuChon(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  const digits = t.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 11;
}

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
  const { refreshSession, user, isKhachHang } = dungXacThuc();
  const { toast } = dungThongBao();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<HoSo | null>(null);
  const [profileErrors, setProfileErrors] = useState<ProfileFieldErrors>({});
  const [pwd, setPwd] = useState({ cu: "", moi: "", nhapLai: "" });
  const [pwdErrors, setPwdErrors] = useState<{
    nhapLai?: string;
    chung?: string;
  }>({});

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
    const hoTen = (form.hoTen || "").trim();
    const email = (form.email || "").trim();
    const sdtRaw = (form.soDienThoai || "").trim();

    const nextErr: ProfileFieldErrors = {};
    if (!hoTen) nextErr.hoTen = "Vui lòng nhập họ tên.";
    if (!email) nextErr.email = "Vui lòng nhập email.";
    else if (!EMAIL_RE.test(email)) nextErr.email = "Email không hợp lệ.";
    if (!hopLeSoDienThoaiTuChon(sdtRaw)) {
      nextErr.soDienThoai =
        "Số điện thoại không hợp lệ (khoảng 8–11 chữ số).";
    }

    setForm({
      ...form,
      hoTen,
      email,
      soDienThoai: sdtRaw || undefined,
    });
    setProfileErrors(nextErr);
    if (Object.keys(nextErr).length > 0) return;

    try {
      await api.put("/ho-so", {
        hoTen,
        soDienThoai: sdtRaw,
        email,
      });
      await refreshSession();
      setProfileErrors({});
      toast("Đã cập nhật hồ sơ.", "thanhCong");
    } catch (err) {
      const msg = layLoiApi(err);
      const mapped = mapLoiHoSoTuApi(msg);
      if (mapped) {
        setProfileErrors(mapped);
        toast("Vui lòng sửa các trường được đánh dấu.", "thatBai");
      } else {
        toast(msg || "Không lưu được hồ sơ.", "thatBai");
      }
    }
  };

  const savePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErrors({});
    if (!pwd.cu) {
      setPwdErrors({
        chung: "Vui lòng nhập mật khẩu hiện tại.",
      });
      return;
    }
    if (!pwd.moi) {
      setPwdErrors({
        chung: "Vui lòng nhập mật khẩu mới.",
      });
      return;
    }
    if (pwd.moi.length < 6) {
      setPwdErrors({
        chung: "Mật khẩu mới cần ít nhất 6 ký tự.",
      });
      return;
    }
    if (pwd.moi !== pwd.nhapLai) {
      setPwdErrors({
        nhapLai: "Mật khẩu nhập lại không khớp với mật khẩu mới.",
      });
      return;
    }
    try {
      await api.post("/ho-so/doi-mat-khau", {
        matKhauCu: pwd.cu,
        matKhauMoi: pwd.moi,
      });
      setPwd({ cu: "", moi: "", nhapLai: "" });
      setPwdErrors({});
      toast("Đã đổi mật khẩu.", "thanhCong");
    } catch (err) {
      toast(layLoiApi(err) || "Đổi mật khẩu thất bại.", "thatBai");
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
              <form
                noValidate
                onSubmit={saveProfile}
                className="profile-form"
              >
                <div className="profile-form__grid">
                  <div className="form-group profile-form__full profile-username-field">
                    <div className="profile-username-field__label-row">
                      <label htmlFor="profile-ten-dang-nhap">
                        Tên đăng nhập
                      </label>
                      <span
                        className="profile-username-field__badge"
                        title="Trường này không thể chỉnh sửa"
                      >
                        Không chỉnh sửa
                      </span>
                    </div>
                    <input
                      id="profile-ten-dang-nhap"
                      className="profile-username-field__input"
                      value={form.tenDangNhap}
                      disabled
                      autoComplete="username"
                      aria-describedby="profile-ten-dang-nhap-hint"
                    />
                    <span
                      id="profile-ten-dang-nhap-hint"
                      className="profile-field-hint profile-field-hint--username"
                    >
                      Trường này chỉ đọc — tên đăng nhập không thể đổi tại đây.
                    </span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-ho-ten">Họ tên</label>
                    <input
                      id="profile-ho-ten"
                      value={form.hoTen || ""}
                      onChange={(e) => {
                        setProfileErrors((p) => ({ ...p, hoTen: undefined }));
                        setForm({ ...form, hoTen: e.target.value });
                      }}
                      placeholder="Họ và tên"
                      aria-required
                      aria-invalid={Boolean(profileErrors.hoTen)}
                      aria-describedby={
                        profileErrors.hoTen ? "profile-ho-ten-err" : undefined
                      }
                    />
                    {profileErrors.hoTen ? (
                      <span id="profile-ho-ten-err" className="profile-field-error">
                        {profileErrors.hoTen}
                      </span>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-sdt">Số điện thoại</label>
                    <input
                      id="profile-sdt"
                      type="tel"
                      autoComplete="tel"
                      value={form.soDienThoai || ""}
                      onChange={(e) => {
                        setProfileErrors((p) => ({ ...p, soDienThoai: undefined }));
                        setForm({ ...form, soDienThoai: e.target.value });
                      }}
                      placeholder="0xxx xxx xxx (tuỳ chọn)"
                      aria-invalid={Boolean(profileErrors.soDienThoai)}
                      aria-describedby={
                        profileErrors.soDienThoai
                          ? "profile-sdt-err"
                          : undefined
                      }
                    />
                    {profileErrors.soDienThoai ? (
                      <span id="profile-sdt-err" className="profile-field-error">
                        {profileErrors.soDienThoai}
                      </span>
                    ) : null}
                  </div>
                  <div className="form-group profile-form__full">
                    <label htmlFor="profile-email">Email</label>
                    <input
                      id="profile-email"
                      type="text"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={form.email || ""}
                      onChange={(e) => {
                        setProfileErrors((p) => ({ ...p, email: undefined }));
                        setForm({ ...form, email: e.target.value });
                      }}
                      placeholder="email@example.com"
                      aria-required
                      autoComplete="email"
                      aria-invalid={Boolean(profileErrors.email)}
                      aria-describedby={
                        profileErrors.email ? "profile-email-err" : undefined
                      }
                    />
                    {profileErrors.email ? (
                      <span id="profile-email-err" className="profile-field-error">
                        {profileErrors.email}
                      </span>
                    ) : null}
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
                    Nhập mật khẩu hiện tại, mật khẩu mới (tối thiểu 6 ký tự) và xác
                    nhận lại mật khẩu mới.
                  </p>
                </div>
              </div>
              <form
                noValidate
                onSubmit={savePwd}
                className="profile-form profile-form--narrow"
              >
                {pwdErrors.chung ? (
                  <p className="profile-field-error profile-field-error--block" role="alert">
                    {pwdErrors.chung}
                  </p>
                ) : null}
                <div className="form-group">
                  <label htmlFor="profile-mk-cu">Mật khẩu hiện tại</label>
                  <input
                    id="profile-mk-cu"
                    type="password"
                    value={pwd.cu}
                    onChange={(e) => {
                      setPwdErrors((p) => ({ ...p, chung: undefined }));
                      setPwd({ ...pwd, cu: e.target.value });
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-mk-moi">Mật khẩu mới</label>
                  <input
                    id="profile-mk-moi"
                    type="password"
                    value={pwd.moi}
                    onChange={(e) => {
                      setPwdErrors((p) => ({
                        ...p,
                        chung: undefined,
                        nhapLai: undefined,
                      }));
                      setPwd({ ...pwd, moi: e.target.value });
                    }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-mk-nhap-lai">Nhập lại mật khẩu mới</label>
                  <input
                    id="profile-mk-nhap-lai"
                    type="password"
                    value={pwd.nhapLai}
                    onChange={(e) => {
                      setPwdErrors((p) => ({ ...p, nhapLai: undefined }));
                      setPwd({ ...pwd, nhapLai: e.target.value });
                    }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={Boolean(pwdErrors.nhapLai)}
                    aria-describedby={
                      pwdErrors.nhapLai ? "profile-mk-nhap-lai-err" : undefined
                    }
                  />
                  {pwdErrors.nhapLai ? (
                    <span
                      id="profile-mk-nhap-lai-err"
                      className="profile-field-error"
                    >
                      {pwdErrors.nhapLai}
                    </span>
                  ) : null}
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
