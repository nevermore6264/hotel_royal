import { useState, useEffect } from "react";
import { Pencil, Save, X } from "lucide-react";
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

export default function AdminUsers() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [vaiTroLoc, setVaiTroLoc] = useState("");
  const [list, setList] = useState<{
    content: NguoiDung[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [editing, setEditing] = useState<NguoiDung | null>(null);
  const [form, setForm] = useState({
    tenDangNhap: "",
    matKhau: "",
    email: "",
    hoTen: "",
    trangThai: "HOAT_DONG",
    vaiTro: ["ROLE_LE_TAN"] as string[],
  });

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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.vaiTro.length === 0) {
      toast("Chọn ít nhất một vai trò.", "error");
      return;
    }
    try {
      if (editing) {
        const capNhat: Record<string, unknown> = {
          email: form.email,
          hoTen: form.hoTen,
          soDienThoai: "",
          trangThai: form.trangThai,
          vaiTro: form.vaiTro,
        };
        if (form.matKhau) capNhat.matKhau = form.matKhau;
        await api.put(`/nguoi-dung/${editing.id}`, capNhat);
      } else {
        await api.post("/nguoi-dung", {
          tenDangNhap: form.tenDangNhap,
          matKhau: form.matKhau || "changeme123",
          email: form.email,
          hoTen: form.hoTen,
          soDienThoai: "",
          trangThai: form.trangThai,
          vaiTro: form.vaiTro,
        });
      }
      setEditing(null);
      setForm({
        tenDangNhap: "",
        matKhau: "",
        email: "",
        hoTen: "",
        trangThai: "HOAT_DONG",
        vaiTro: ["ROLE_LE_TAN"],
      });
      load();
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi",
        "error",
      );
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý người dùng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tạo tài khoản nhân viên và gán vai trò truy cập.
      </p>
      <div className="card mb-section">
        <h3 className="card-title">{editing ? "Sửa user" : "Thêm user"}</h3>
        <form onSubmit={save}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                value={form.tenDangNhap}
                onChange={(e) =>
                  setForm({ ...form, tenDangNhap: e.target.value })
                }
                placeholder="Tên đăng nhập nhân viên"
                required
                disabled={!!editing}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu {editing && "(để trống nếu không đổi)"}</label>
              <input
                type="password"
                value={form.matKhau}
                onChange={(e) => setForm({ ...form, matKhau: e.target.value })}
                placeholder={
                  editing ? "Để trống nếu không đổi" : "Mật khẩu ban đầu"
                }
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@khachsan.vn"
                required
              />
            </div>
            <div className="form-group">
              <label>Họ tên</label>
              <input
                value={form.hoTen}
                onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                placeholder="Họ và tên"
              />
            </div>
            <div className="form-group">
              <label>Trạng thái tài khoản</label>
              <select
                value={form.trangThai}
                onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
              >
                <option value="HOAT_DONG">{TEN_TRANG_THAI.HOAT_DONG}</option>
                <option value="VO_HIEU">{TEN_TRANG_THAI.VO_HIEU}</option>
                <option value="KHOA">{TEN_TRANG_THAI.KHOA}</option>
              </select>
            </div>
            <div className="form-group form-group--full">
              <label htmlFor="vai-tro-multi">Vai trò</label>
              <p className="text-muted text-sm" style={{ margin: "0 0 0.35rem" }}>
                Giữ Ctrl (Windows) hoặc ⌘ (Mac) và bấm để chọn nhiều vai trò.
              </p>
              <select
                id="vai-tro-multi"
                multiple
                size={5}
                className="select-multiple"
                value={form.vaiTro}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (o) => o.value,
                  );
                  setForm({ ...form, vaiTro: selected });
                }}
              >
                {VAI_TRO_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {TEN_VAI_TRO[r] ?? r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn" style={{ marginTop: "1rem" }}>
            <Save className="btn-ico" aria-hidden />
            Lưu
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginLeft: "0.5rem", marginTop: "1rem" }}
              onClick={() => setEditing(null)}
            >
              <X className="btn-ico" aria-hidden />
              Hủy
            </button>
          )}
        </form>
      </div>
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
        <h3 className="card-title">Danh sách người dùng</h3>
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
                    onClick={() => {
                      setEditing(u);
                      setForm({
                        tenDangNhap: u.tenDangNhap,
                        matKhau: "",
                        email: u.email,
                        hoTen: u.hoTen || "",
                        trangThai: u.trangThai || "HOAT_DONG",
                        vaiTro: u.vaiTro || [],
                      });
                    }}
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
    </div>
  );
}
