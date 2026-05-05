import { useState, useEffect, useRef } from "react";
import { Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import api from "../../api/client";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../lib/apiError";
import { classBadgePhong, tenTrangThaiPhong } from "../../lib/trangThai";

type LoaiPhong = { id: number; ten: string };
type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  idLoaiPhong: number;
  tenLoaiPhong: string;
  duongDanAnh?: string[];
};

const PHONG_FORM_MAC_DINH = {
  soPhong: "",
  trangThai: "PHONG_TRONG",
  idLoaiPhong: 0,
  anhUrls: [] as string[],
};

export default function AdminPhong() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [idLoaiLoc, setIdLoaiLoc] = useState<number | "">("");
  const [danhSachPhong, setDanhSachPhong] = useState<{
    content: Phong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [danhSachLoaiPhong, setDanhSachLoaiPhong] = useState<LoaiPhong[]>([]);
  const [dangMoForm, setDangMoForm] = useState(false);
  const [phongDangSua, setPhongDangSua] = useState<Phong | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [idChoXoa, setIdChoXoa] = useState<number | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [formPhong, setFormPhong] = useState({ ...PHONG_FORM_MAC_DINH });

  const taiDanhSachPhong = () => {
    const params: Record<string, string | number> = { page, size: 12 };
    if (q.trim()) params.q = q.trim();
    if (trangThaiLoc) params.trangThai = trangThaiLoc;
    if (idLoaiLoc !== "") params.idLoaiPhong = idLoaiLoc;
    api.get("/phong", { params }).then((r) => setDanhSachPhong(r.data));
  };

  const taiDanhSachLoaiPhong = () => {
    api.get("/loai-phong").then((r) => setDanhSachLoaiPhong(r.data));
  };

  useEffect(() => {
    taiDanhSachPhong();
  }, [page, q, trangThaiLoc, idLoaiLoc]);

  useEffect(() => {
    taiDanhSachLoaiPhong();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [q, trangThaiLoc, idLoaiLoc]);

  const taiDuLieu = () => {
    taiDanhSachPhong();
    taiDanhSachLoaiPhong();
  };

  const themAnhVaoForm = (urls: string[]) => {
    if (urls.length === 0) return;
    setFormPhong((prev) => ({
      ...prev,
      anhUrls: [...prev.anhUrls, ...urls],
    }));
  };

  const xoaAnhTaiViTri = (index: number) => {
    setFormPhong((prev) => ({
      ...prev,
      anhUrls: prev.anhUrls.filter((_, i) => i !== index),
    }));
  };

  const chonVaTaiAnh = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    setDangTaiAnh(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < list.length; i++) fd.append("files", list[i]);
      const { data } = await api.post<{ tep: { duongDan: string }[] }>(
        "/tap-tin/phong-anh-nhieu",
        fd,
      );
      const urls = (data.tep || []).map((x) => x.duongDan);
      themAnhVaoForm(urls);
      toast(`Đã tải lên ${urls.length} ảnh.`, "success");
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Upload thất bại.",
        "error",
      );
    } finally {
      setDangTaiAnh(false);
      e.target.value = "";
    }
  };

  const dongModalForm = () => {
    if (dangLuu || dangTaiAnh) return;
    setDangMoForm(false);
    setPhongDangSua(null);
    setFormPhong({
      ...PHONG_FORM_MAC_DINH,
      idLoaiPhong: danhSachLoaiPhong[0]?.id || 0,
    });
  };

  useEffect(() => {
    if (!dangMoForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || dangLuu || dangTaiAnh) return;
      dongModalForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dangMoForm, dangLuu, dangTaiAnh, danhSachLoaiPhong]);

  const moModalThem = () => {
    setPhongDangSua(null);
    setFormPhong({
      ...PHONG_FORM_MAC_DINH,
      idLoaiPhong: danhSachLoaiPhong[0]?.id || 0,
    });
    setDangMoForm(true);
  };

  const moModalSua = (r: Phong) => {
    setPhongDangSua(r);
    setFormPhong({
      soPhong: r.soPhong,
      trangThai: r.trangThai,
      idLoaiPhong: r.idLoaiPhong,
      anhUrls: [...(r.duongDanAnh || [])],
    });
    setDangMoForm(true);
  };

  const luuPhong = async (e: React.FormEvent) => {
    e.preventDefault();
    setDangLuu(true);
    try {
      const payload = {
        soPhong: formPhong.soPhong,
        trangThai: formPhong.trangThai,
        idLoaiPhong:
          formPhong.idLoaiPhong ||
          phongDangSua?.idLoaiPhong ||
          danhSachLoaiPhong[0]?.id,
        duongDanAnh: formPhong.anhUrls,
      };
      if (phongDangSua) {
        await api.put(`/phong/${phongDangSua.id}`, payload);
        toast("Đã cập nhật phòng.", "success");
      } else {
        await api.post("/phong", payload);
        toast("Đã thêm phòng.", "success");
      }
      dongModalForm();
      taiDuLieu();
    } catch (err) {
      toast(apiErrorMessage(err, "Lỗi"), "error");
    } finally {
      setDangLuu(false);
    }
  };

  const xacNhanXoa = async () => {
    if (idChoXoa == null) return;
    setDangXoa(true);
    try {
      await api.delete(`/phong/${idChoXoa}`);
      setIdChoXoa(null);
      taiDuLieu();
      toast("Đã xóa phòng.", "success");
    } catch (err) {
      setIdChoXoa(null);
      toast(apiErrorMessage(err, "Lỗi"), "error");
    } finally {
      setDangXoa(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Thêm, sửa hoặc xóa phòng theo loại và trạng thái.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm &amp; lọc
        </h3>
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Số phòng / loại phòng</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ví dụ: 101, Deluxe…"
            />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              value={trangThaiLoc}
              onChange={(e) => setTrangThaiLoc(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="PHONG_TRONG">{tenTrangThaiPhong("PHONG_TRONG")}</option>
              <option value="DANG_SU_DUNG">{tenTrangThaiPhong("DANG_SU_DUNG")}</option>
              <option value="BAO_TRI">{tenTrangThaiPhong("BAO_TRI")}</option>
              <option value="DA_GIU">{tenTrangThaiPhong("DA_GIU")}</option>
            </select>
          </div>
          <div className="form-group">
            <label>Loại phòng</label>
            <select
              value={idLoaiLoc === "" ? "" : String(idLoaiLoc)}
              onChange={(e) =>
                setIdLoaiLoc(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Tất cả</option>
              {danhSachLoaiPhong.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.ten}
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
            Danh sách phòng
          </h3>
          <button type="button" className="btn" onClick={moModalThem}>
            <Plus className="btn-ico" aria-hidden />
            Thêm phòng
          </button>
        </div>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Số phòng</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {danhSachPhong.content.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.soPhong}</td>
                <td>{r.tenLoaiPhong}</td>
                <td>
                  <span className={classBadgePhong(r.trangThai)}>
                    {tenTrangThaiPhong(r.trangThai)}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => moModalSua(r)}
                  >
                    <Pencil className="btn-ico" aria-hidden />
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setIdChoXoa(r.id)}
                  >
                    <Trash2 className="btn-ico" aria-hidden />
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <PaginationBar
          page={page}
          totalPages={danhSachPhong.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      </div>

      {dangMoForm ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!dangLuu && !dangTaiAnh) dongModalForm();
          }}
        >
          <div
            className="card modal-panel"
            style={{
              maxWidth: "min(720px, calc(100vw - 2rem))",
              width: "100%",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="phong-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <h2 id="phong-modal-title" className="card-title" style={{ margin: 0 }}>
                {phongDangSua ? "Sửa phòng" : "Thêm phòng"}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={dangLuu || dangTaiAnh}
                onClick={dongModalForm}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>
            <form onSubmit={luuPhong} className="form-inline mt-4">
              <div className="form-group">
                <label>Số phòng</label>
                <input
                  value={formPhong.soPhong}
                  disabled={dangLuu}
                  onChange={(e) =>
                    setFormPhong({ ...formPhong, soPhong: e.target.value })
                  }
                  placeholder="Ví dụ: 101"
                  required
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formPhong.trangThai}
                  disabled={dangLuu}
                  onChange={(e) =>
                    setFormPhong({ ...formPhong, trangThai: e.target.value })
                  }
                >
                  <option value="PHONG_TRONG">Trống</option>
                  <option value="DANG_SU_DUNG">Đang dùng</option>
                  <option value="BAO_TRI">Bảo trì</option>
                  <option value="DA_GIU">Đã giữ</option>
                </select>
              </div>
              <div className="form-group">
                <label>Loại phòng</label>
                <select
                  value={formPhong.idLoaiPhong}
                  disabled={dangLuu}
                  onChange={(e) =>
                    setFormPhong({ ...formPhong, idLoaiPhong: Number(e.target.value) })
                  }
                >
                  {danhSachLoaiPhong.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.ten}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Ảnh phòng</label>
                <div className="form-row" style={{ alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="visually-hidden"
                    onChange={chonVaTaiAnh}
                    disabled={dangTaiAnh || dangLuu}
                    aria-hidden
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={dangTaiAnh || dangLuu}
                    aria-busy={dangTaiAnh}
                    aria-label="Chọn ảnh từ máy (có thể nhiều file)"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="btn-ico" aria-hidden />
                    {dangTaiAnh ? "Đang tải…" : "Chọn ảnh từ máy"}
                  </button>
                </div>
                {formPhong.anhUrls.length > 0 ? (
                  <ul
                    className="text-sm"
                    style={{
                      margin: "0.75rem 0 0",
                      paddingLeft: "1.25rem",
                      listStyle: "disc",
                    }}
                  >
                    {formPhong.anhUrls.map((url, i) => (
                      <li key={`${url}-${i}`} style={{ marginBottom: "0.35rem" }}>
                        <span className="cell-wrap-text" style={{ verticalAlign: "middle" }}>
                          {url}
                        </span>{" "}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ marginLeft: "0.35rem", verticalAlign: "middle" }}
                          disabled={dangLuu}
                          onClick={() => xoaAnhTaiViTri(i)}
                          aria-label={`Xóa ảnh ${i + 1}`}
                        >
                          <X className="btn-ico" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted text-sm" style={{ margin: "0.5rem 0 0" }}>
                    Chưa có ảnh. Chọn một hoặc nhiều file để tải lên.
                  </p>
                )}
              </div>
              <div className="inline-actions" style={{ gridColumn: "1 / -1" }}>
                <button type="submit" className="btn" disabled={dangLuu || dangTaiAnh}>
                  <Save className="btn-ico" aria-hidden />
                  {dangLuu ? "Đang lưu…" : "Lưu"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={dangLuu || dangTaiAnh}
                  onClick={dongModalForm}
                >
                  <X className="btn-ico" aria-hidden />
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={idChoXoa != null}
        title="Xóa phòng"
        message="Bạn có chắc muốn xóa phòng này? Thao tác không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        danger
        busy={dangXoa}
        onCancel={() => {
          if (!dangXoa) setIdChoXoa(null);
        }}
        onConfirm={xacNhanXoa}
      />
    </div>
  );
}
