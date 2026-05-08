import { useState, useEffect, useCallback } from "react";
import { Pencil, Save, X } from "lucide-react";
import api from "../../api/client";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../lib/apiError";

type KhachHang = {
  id: number;
  hoTen: string;
  soDienThoai?: string;
  email?: string;
  soCanCuoc?: string;
  idNguoiDung?: number;
};

type PhieuSuaKhach = {
  hoTen: string;
  soDienThoai: string;
  email: string;
  soCanCuoc: string;
};

const PHIEU_RONG: PhieuSuaKhach = {
  hoTen: "",
  soDienThoai: "",
  email: "",
  soCanCuoc: "",
};

export default function KhachHangLeTan() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [list, setList] = useState<{
    content: KhachHang[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [q, setQ] = useState("");
  const [khachDangSua, setKhachDangSua] = useState<KhachHang | null>(null);
  const [phieuSua, setPhieuSua] = useState<PhieuSuaKhach>(PHIEU_RONG);
  const [dangTaiChiTiet, setDangTaiChiTiet] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);

  const taiDanhSach = useCallback(() => {
    const params: Record<string, string | number> = {
      page,
      size: 15,
    };
    if (q.trim()) params.q = q.trim();
    return api.get("/khach-hang", { params }).then((r) => setList(r.data));
  }, [page, q]);

  useEffect(() => {
    void taiDanhSach();
  }, [taiDanhSach]);

  useEffect(() => {
    setPage(0);
  }, [q]);

  const moSuaKhach = async (dong: KhachHang) => {
    setDangTaiChiTiet(true);
    try {
      const { data } = await api.get<KhachHang>(`/khach-hang/${dong.id}`);
      setPhieuSua({
        hoTen: data.hoTen ?? "",
        soDienThoai: data.soDienThoai ?? "",
        email: data.email ?? "",
        soCanCuoc: data.soCanCuoc ?? "",
      });
      setKhachDangSua(data);
    } catch (e) {
      toast(apiErrorMessage(e, "Không tải được thông tin khách."), "thatBai");
    } finally {
      setDangTaiChiTiet(false);
    }
  };

  const dongModalSua = () => {
    setKhachDangSua(null);
    setPhieuSua(PHIEU_RONG);
  };

  const luuKhach = async () => {
    if (!khachDangSua) return;
    const hoTen = phieuSua.hoTen.trim();
    if (!hoTen) {
      toast("Vui lòng nhập họ tên.", "thatBai");
      return;
    }
    setDangLuu(true);
    try {
      await api.put(`/khach-hang/${khachDangSua.id}`, {
        hoTen,
        soDienThoai: phieuSua.soDienThoai.trim() || undefined,
        email: phieuSua.email.trim() || undefined,
        soCanCuoc: phieuSua.soCanCuoc.trim() || undefined,
      });
      toast("Đã cập nhật thông tin khách hàng.", "thanhCong");
      dongModalSua();
      await taiDanhSach();
    } catch (e) {
      toast(apiErrorMessage(e, "Không lưu được thay đổi."), "thatBai");
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý khách hàng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tìm theo tên, số điện thoại hoặc email — có phân trang.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm kiếm
        </h3>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Từ khóa (tên, SĐT, email)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nhập để lọc danh sách…"
          />
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Danh sách khách</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>CMND/CCCD</th>
                <th style={{ width: "8rem" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.content.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.hoTen}</td>
                  <td>{c.soDienThoai || "-"}</td>
                  <td>{c.email || "-"}</td>
                  <td>{c.soCanCuoc || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      disabled={dangTaiChiTiet}
                      onClick={() => void moSuaKhach(c)}
                    >
                      <Pencil className="btn-ico" aria-hidden />
                      Cập nhật
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

      {khachDangSua != null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sua-khach-title"
          onClick={dongModalSua}
        >
          <div
            className="card modal-panel counter-booking-modal"
            style={{ maxWidth: "min(520px, calc(100vw - 2rem))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <h2 id="sua-khach-title" className="card-title" style={{ margin: 0 }}>
                Cập nhật khách · #{khachDangSua.id}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={dongModalSua}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
              </button>
            </div>
            {khachDangSua.idNguoiDung != null ? (
              <p className="text-muted text-sm" style={{ marginTop: 0 }}>
                Khách có tài khoản đăng nhập liên kết (người dùng #
                {khachDangSua.idNguoiDung}). Thông tin lưu ở hồ sơ khách; đăng
                nhập vẫn dùng email tài khoản nếu khác.
              </p>
            ) : null}
            <div className="form-group">
              <label>Họ tên *</label>
              <input
                value={phieuSua.hoTen}
                onChange={(e) =>
                  setPhieuSua((p) => ({ ...p, hoTen: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                value={phieuSua.soDienThoai}
                onChange={(e) =>
                  setPhieuSua((p) => ({ ...p, soDienThoai: e.target.value }))
                }
                placeholder="Tùy chọn"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={phieuSua.email}
                onChange={(e) =>
                  setPhieuSua((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Tùy chọn"
              />
            </div>
            <div className="form-group">
              <label>CMND / CCCD</label>
              <input
                value={phieuSua.soCanCuoc}
                onChange={(e) =>
                  setPhieuSua((p) => ({ ...p, soCanCuoc: e.target.value }))
                }
                placeholder="Tùy chọn"
              />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "flex-end",
                marginTop: "1.25rem",
              }}
            >
              <button
                type="button"
                className="btn"
                disabled={dangLuu}
                onClick={() => void luuKhach()}
              >
                <Save className="btn-ico" aria-hidden />
                {dangLuu ? "Đang lưu…" : "Lưu"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={dangLuu}
                onClick={dongModalSua}
              >
                <X className="btn-ico" aria-hidden />
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
