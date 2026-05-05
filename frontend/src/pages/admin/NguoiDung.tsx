import { useState, useEffect, type CSSProperties } from "react";
import { Pencil, Plus, Save, X } from "lucide-react";
import api from "../../api/client";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";

type NguoiDung = {
  id: number;
  tenDangNhap: string;
  email: string;
  hoTen?: string;
  trangThai?: string;
  vaiTro: string[];
};

const VAI_TRO_OPTIONS = [
  "ROLE_QUAN_TRI",
  "ROLE_LE_TAN",
  "ROLE_KHACH_HANG",
  "ROLE_VANG_LAI",
  "ROLE_BUONG_PHONG",
] as const;

const TEN_VAI_TRO: Record<string, string> = {
  ROLE_QUAN_TRI: "Quản trị",
  ROLE_LE_TAN: "Lễ tân",
  ROLE_KHACH_HANG: "Khách hàng",
  ROLE_VANG_LAI: "Vãng lai",
  ROLE_BUONG_PHONG: "Buồng phòng",
};

const TEN_TRANG_THAI: Record<string, string> = {
  HOAT_DONG: "Hoạt động",
  VO_HIEU: "Vô hiệu",
  KHOA: "Khóa",
};

const USER_FORM_INITIAL = {
  tenDangNhap: "",
  matKhau: "",
  email: "",
  hoTen: "",
  trangThai: "HOAT_DONG",
  vaiTro: "ROLE_LE_TAN" as string,
};

const TEN_DANG_NHAP_MAX = 80;
const HO_TEN_MAX = 120;
const MAT_KHAU_MIN = 6;

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

type FormErrors = Partial<
  Record<"tenDangNhap" | "matKhau" | "email" | "hoTen" | "vaiTro", string>
>;

function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

function errorSlotStyle(): CSSProperties {
  return {
    minHeight: "2.6rem",
    marginTop: "0.35rem",
    display: "flex",
    alignItems: "flex-start",
  };
}

export default function AdminNguoiDung() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [vaiTroLoc, setVaiTroLoc] = useState("");
  const [list, setList] = useState<{
    content: NguoiDung[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NguoiDung | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [form, setForm] = useState({ ...USER_FORM_INITIAL });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const load = () => {
    const params: Record<string, string | number> = {
      page,
      size: 12,
    };
    if (q.trim()) params.q = q.trim();
    if (trangThaiLoc) params.trangThai = trangThaiLoc;
    if (vaiTroLoc) params.vaiTro = vaiTroLoc;
    api.get("/nguoi-dung", { params }).then((r) => setList(r.data));
  };
  useEffect(() => {
    load();
  }, [page, q, trangThaiLoc, vaiTroLoc]);

  useEffect(() => {
    setPage(0);
  }, [q, trangThaiLoc, vaiTroLoc]);

  const closeFormModal = () => {
    if (saveBusy) return;
    setFormOpen(false);
    setEditing(null);
    setForm({ ...USER_FORM_INITIAL });
    setFieldErrors({});
  };

  useEffect(() => {
    if (!formOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || saveBusy) return;
      closeFormModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formOpen, saveBusy]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...USER_FORM_INITIAL });
    setFieldErrors({});
    setFormOpen(true);
  };

  const openEditModal = (u: NguoiDung) => {
    setEditing(u);
    const roles = u.vaiTro || [];
    const vaiMacDinh =
      roles.find((r) =>
        (VAI_TRO_OPTIONS as readonly string[]).includes(r),
      ) || "ROLE_LE_TAN";
    setForm({
      tenDangNhap: u.tenDangNhap,
      matKhau: "",
      email: u.email,
      hoTen: u.hoTen || "",
      trangThai: u.trangThai || "HOAT_DONG",
      vaiTro: vaiMacDinh,
    });
    setFieldErrors({});
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenDangNhap = form.tenDangNhap.trim();
    const emailTrim = form.email.trim();
    const hoTen = form.hoTen.trim();
    const matKhau = form.matKhau.trim();

    const errs: FormErrors = {};

    if (!tenDangNhap) errs.tenDangNhap = "Vui lòng nhập tên đăng nhập.";
    else if (tenDangNhap.length > TEN_DANG_NHAP_MAX)
      errs.tenDangNhap = `Tên đăng nhập tối đa ${TEN_DANG_NHAP_MAX} ký tự.`;

    if (!editing) {
      if (!matKhau) errs.matKhau = "Vui lòng nhập mật khẩu.";
      else if (matKhau.length < MAT_KHAU_MIN)
        errs.matKhau = `Mật khẩu ít nhất ${MAT_KHAU_MIN} ký tự.`;
    } else if (matKhau && matKhau.length < MAT_KHAU_MIN) {
      errs.matKhau = `Mật khẩu mới ít nhất ${MAT_KHAU_MIN} ký tự.`;
    }

    if (!emailTrim) errs.email = "Vui lòng nhập email.";
    else if (!EMAIL_RE.test(emailTrim))
      errs.email = "Email không hợp lệ.";

    if (hoTen.length > HO_TEN_MAX)
      errs.hoTen = `Họ tên tối đa ${HO_TEN_MAX} ký tự.`;

    if (!form.vaiTro) errs.vaiTro = "Vui lòng chọn vai trò.";

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const vaiTroPayload = [form.vaiTro];

    try {
      if (!editing) {
        const { data } = await api.get("/nguoi-dung", {
          params: { q: tenDangNhap, page: 0, size: 200 },
        });
        const ds = (data?.content || []) as NguoiDung[];
        const trungTen = ds.some((item) => item.tenDangNhap.trim() === tenDangNhap);
        if (trungTen) {
          setFieldErrors((prev) => ({
            ...prev,
            tenDangNhap: "Tên đăng nhập đã tồn tại.",
          }));
          return;
        }
      }

      const { data } = await api.get("/nguoi-dung", {
        params: { q: emailTrim, page: 0, size: 200 },
      });
      const ds = (data?.content || []) as NguoiDung[];
      const ne = normalizeEmail(emailTrim);
      const trungEmail = ds.some(
        (item) =>
          normalizeEmail(item.email || "") === ne &&
          (!editing || item.id !== editing.id),
      );
      if (trungEmail) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Email đã được sử dụng cho tài khoản khác.",
        }));
        return;
      }
    } catch {
      // Không chặn lưu nếu lỗi mạng khi kiểm tra trùng; backend vẫn kiểm tra.
    }

    setSaveBusy(true);
    try {
      if (editing) {
        const capNhat: Record<string, unknown> = {
          email: emailTrim,
          hoTen: hoTen || undefined,
          soDienThoai: "",
          trangThai: form.trangThai,
          vaiTro: vaiTroPayload,
        };
        if (matKhau) capNhat.matKhau = matKhau;
        await api.put(`/nguoi-dung/${editing.id}`, capNhat);
        toast("Đã cập nhật người dùng.", "success");
      } else {
        await api.post("/nguoi-dung", {
          tenDangNhap,
          matKhau,
          email: emailTrim,
          hoTen: hoTen || undefined,
          soDienThoai: "",
          trangThai: form.trangThai,
          vaiTro: vaiTroPayload,
        });
        toast("Đã thêm người dùng.", "success");
      }
      closeFormModal();
      load();
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi",
        "error",
      );
    } finally {
      setSaveBusy(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý người dùng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tạo tài khoản nhân viên và gán vai trò truy cập.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm &amp; lọc
        </h3>
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Từ khóa (tên đăng nhập, email, họ tên)</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nhập để tìm…"
            />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              value={trangThaiLoc}
              onChange={(e) => setTrangThaiLoc(e.target.value)}
            >
              <option value="">Tất cả</option>
              {Object.entries(TEN_TRANG_THAI).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Có vai trò</label>
            <select
              value={vaiTroLoc}
              onChange={(e) => setVaiTroLoc(e.target.value)}
            >
              <option value="">(bất kỳ)</option>
              {VAI_TRO_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {TEN_VAI_TRO[r] ?? r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <div
          className="form-row form-row--between"
          style={{ alignItems: "center", marginBottom: "0.75rem" }}
        >
          <h3 className="card-title" style={{ margin: 0 }}>
            Danh sách người dùng
          </h3>
          <button type="button" className="btn" onClick={openCreateModal}>
            <Plus className="btn-ico" aria-hidden />
            Thêm người dùng
          </button>
        </div>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Vai trò</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.content.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.tenDangNhap}</td>
                <td>{u.email}</td>
                <td>
                  {u.trangThai
                    ? TEN_TRANG_THAI[u.trangThai] ?? u.trangThai
                    : "—"}
                </td>
                <td className="cell-wrap-text">
                  {(u.vaiTro || [])
                    .map((r) => TEN_VAI_TRO[r] ?? r)
                    .join(", ")}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(u)}
                  >
                    <Pencil className="btn-ico" aria-hidden />
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <PaginationBar
          page={page}
          totalPages={list.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      </div>

      {formOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!saveBusy) closeFormModal();
          }}
        >
          <div
            className="card modal-panel nd-modal-nguoi-dung"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <h2 id="user-modal-title" className="card-title" style={{ margin: 0 }}>
                {editing ? "Sửa người dùng" : "Thêm người dùng"}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={saveBusy}
                onClick={closeFormModal}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>
            <form onSubmit={save} noValidate className="mt-4">
              <div
                className="nd-modal-nguoi-dung__grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "0.65rem",
                }}
              >
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    value={form.tenDangNhap}
                    disabled={saveBusy || !!editing}
                    aria-invalid={Boolean(fieldErrors.tenDangNhap)}
                    aria-describedby={
                      fieldErrors.tenDangNhap ? "nd-ten-err" : undefined
                    }
                    onChange={(e) => {
                      setForm({ ...form, tenDangNhap: e.target.value });
                      setFieldErrors((prev) => ({
                        ...prev,
                        tenDangNhap: undefined,
                      }));
                    }}
                    placeholder="Tên đăng nhập nhân viên"
                    autoComplete="username"
                  />
                  <div style={errorSlotStyle()}>
                    {fieldErrors.tenDangNhap ? (
                      <p
                        id="nd-ten-err"
                        className="form-error"
                        style={{
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {fieldErrors.tenDangNhap}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu {editing && "(để trống nếu không đổi)"}</label>
                  <input
                    type="password"
                    value={form.matKhau}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.matKhau)}
                    aria-describedby={
                      fieldErrors.matKhau ? "nd-mk-err" : undefined
                    }
                    onChange={(e) => {
                      setForm({ ...form, matKhau: e.target.value });
                      setFieldErrors((prev) => ({ ...prev, matKhau: undefined }));
                    }}
                    placeholder={
                      editing ? "Để trống nếu không đổi" : "Mật khẩu ban đầu"
                    }
                    autoComplete="new-password"
                  />
                  <div style={errorSlotStyle()}>
                    {fieldErrors.matKhau ? (
                      <p id="nd-mk-err" className="form-error" style={{ margin: 0 }}>
                        {fieldErrors.matKhau}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "nd-email-err" : undefined
                    }
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="email@khachsan.vn"
                    autoComplete="email"
                  />
                  <div style={errorSlotStyle()}>
                    {fieldErrors.email ? (
                      <p
                        id="nd-email-err"
                        className="form-error"
                        style={{
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input
                    value={form.hoTen}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.hoTen)}
                    aria-describedby={
                      fieldErrors.hoTen ? "nd-hoten-err" : undefined
                    }
                    onChange={(e) => {
                      setForm({ ...form, hoTen: e.target.value });
                      setFieldErrors((prev) => ({ ...prev, hoTen: undefined }));
                    }}
                    placeholder="Họ và tên"
                    autoComplete="name"
                  />
                  <div style={errorSlotStyle()}>
                    {fieldErrors.hoTen ? (
                      <p id="nd-hoten-err" className="form-error" style={{ margin: 0 }}>
                        {fieldErrors.hoTen}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="form-group">
                  <label>Trạng thái tài khoản</label>
                  <select
                    value={form.trangThai}
                    disabled={saveBusy}
                    onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                  >
                    <option value="HOAT_DONG">{TEN_TRANG_THAI.HOAT_DONG}</option>
                    <option value="VO_HIEU">{TEN_TRANG_THAI.VO_HIEU}</option>
                    <option value="KHOA">{TEN_TRANG_THAI.KHOA}</option>
                  </select>
                  <div style={{ ...errorSlotStyle(), minHeight: 0 }} />
                </div>
                <div className="form-group">
                  <label htmlFor="vai-tro-modal">Vai trò</label>
                  <select
                    id="vai-tro-modal"
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.vaiTro)}
                    aria-describedby={
                      fieldErrors.vaiTro ? "nd-vt-err" : undefined
                    }
                    value={form.vaiTro}
                    onChange={(e) => {
                      setForm({ ...form, vaiTro: e.target.value });
                      setFieldErrors((prev) => ({ ...prev, vaiTro: undefined }));
                    }}
                  >
                    {VAI_TRO_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {TEN_VAI_TRO[r] ?? r}
                      </option>
                    ))}
                  </select>
                  <div style={errorSlotStyle()}>
                    {fieldErrors.vaiTro ? (
                      <p id="nd-vt-err" className="form-error" style={{ margin: 0 }}>
                        {fieldErrors.vaiTro}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div
                className="inline-actions mt-4"
                style={{ justifyContent: "flex-end" }}
              >
                <button type="submit" className="btn" disabled={saveBusy}>
                  <Save className="btn-ico" aria-hidden />
                  {saveBusy ? "Đang lưu…" : "Lưu"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={saveBusy}
                  onClick={closeFormModal}
                >
                  <X className="btn-ico" aria-hidden />
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
