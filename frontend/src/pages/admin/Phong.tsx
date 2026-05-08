import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Image, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
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

type FormPhongErrors = {
  soPhong?: string;
  idLoaiPhong?: string;
};

const PHONG_FORM_MAC_DINH = {
  soPhong: "",
  trangThai: "PHONG_TRONG",
  idLoaiPhong: 0,
  anhUrls: [] as string[],
};

function chuanHoaSoPhong(v: string): string {
  return v.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");
}

export default function AdminPhong() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
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
  const [phongDangXemAnh, setPhongDangXemAnh] = useState<Phong | null>(null);
  const [chiSoAnhDangXemTo, setChiSoAnhDangXemTo] = useState<number | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [idChoXoa, setIdChoXoa] = useState<number | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [formPhong, setFormPhong] = useState({ ...PHONG_FORM_MAC_DINH });
  const [formErrors, setFormErrors] = useState<FormPhongErrors>({});

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

  useEffect(() => {
    const raw = searchParams.get("idLoaiPhong");
    if (!raw) {
      setIdLoaiLoc("");
      return;
    }
    const id = Number(raw);
    setIdLoaiLoc(Number.isFinite(id) ? id : "");
  }, [searchParams]);

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
      toast(`Đã tải lên ${urls.length} ảnh.`, "thanhCong");
    } catch (err) {
      toast(
        (err as { response?: { data?: { loi?: string } } })?.response?.data
          ?.loi || "Upload thất bại.",
        "thatBai",
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
    setFormErrors({});
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
    setFormErrors({});
    setFormPhong({
      ...PHONG_FORM_MAC_DINH,
      idLoaiPhong: danhSachLoaiPhong[0]?.id || 0,
    });
    setDangMoForm(true);
  };

  const moModalSua = (r: Phong) => {
    setPhongDangSua(r);
    setFormErrors({});
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

    const soPhongTrim = formPhong.soPhong.trim();
    const loi: FormPhongErrors = {};
    if (!soPhongTrim) loi.soPhong = "Vui lòng nhập số phòng.";
    if (!formPhong.idLoaiPhong) loi.idLoaiPhong = "Vui lòng chọn loại phòng.";
    setFormErrors(loi);
    if (Object.keys(loi).length > 0) return;

    try {
      const { data } = await api.get("/phong", {
        params: { q: soPhongTrim, page: 0, size: 100 },
      });
      const ds = (data?.content || []) as Phong[];
      const biTrung = ds.some(
        (p) =>
          chuanHoaSoPhong(p.soPhong) === chuanHoaSoPhong(soPhongTrim) &&
          (!phongDangSua || p.id !== phongDangSua.id),
      );
      if (biTrung) {
        setFormErrors((prev) => ({
          ...prev,
          soPhong: "Số phòng đã tồn tại. Vui lòng nhập số khác.",
        }));
        return;
      }
    } catch {}

    setDangLuu(true);
    try {
      const payload = {
        soPhong: soPhongTrim,
        trangThai: formPhong.trangThai,
        idLoaiPhong:
          formPhong.idLoaiPhong ||
          phongDangSua?.idLoaiPhong ||
          danhSachLoaiPhong[0]?.id,
        duongDanAnh: formPhong.anhUrls,
      };
      if (phongDangSua) {
        await api.put(`/phong/${phongDangSua.id}`, payload);
        toast("Đã cập nhật phòng.", "thanhCong");
      } else {
        await api.post("/phong", payload);
        toast("Đã thêm phòng.", "thanhCong");
      }
      dongModalForm();
      taiDuLieu();
    } catch (err) {
      toast(apiErrorMessage(err, "Lỗi"), "thatBai");
    } finally {
      setDangLuu(false);
    }
  };

  const xacNhanXoa = async () => {
    if (idChoXoa == null) return;
    const phongCanXoa = danhSachPhong.content.find((p) => p.id === idChoXoa);
    if (phongCanXoa && phongCanXoa.trangThai !== "PHONG_TRONG") {
      setIdChoXoa(null);
      toast("Chỉ được xóa phòng đang ở trạng thái Trống.", "thatBai");
      return;
    }
    setDangXoa(true);
    try {
      await api.delete(`/phong/${idChoXoa}`);
      setIdChoXoa(null);
      taiDuLieu();
      toast("Đã xóa phòng.", "thanhCong");
    } catch (err) {
      setIdChoXoa(null);
      toast(apiErrorMessage(err, "Lỗi"), "thatBai");
    } finally {
      setDangXoa(false);
    }
  };

  const danhSachAnhDangXem = phongDangXemAnh?.duongDanAnh || [];
  const dangMoXemAnhTo =
    chiSoAnhDangXemTo != null &&
    chiSoAnhDangXemTo >= 0 &&
    chiSoAnhDangXemTo < danhSachAnhDangXem.length;

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
                    onClick={() => setPhongDangXemAnh(r)}
                  >
                    <Image className="btn-ico" aria-hidden />
                    Xem ảnh phòng
                  </button>
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
                    disabled={r.trangThai !== "PHONG_TRONG"}
                    title={
                      r.trangThai !== "PHONG_TRONG"
                        ? "Chỉ xóa được phòng đang ở trạng thái Trống"
                        : undefined
                    }
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
            <form onSubmit={luuPhong} noValidate className="form-inline mt-4">
              <div className="form-group">
                <label>Số phòng</label>
                <input
                  value={formPhong.soPhong}
                  disabled={dangLuu}
                  aria-invalid={Boolean(formErrors.soPhong)}
                  aria-describedby={formErrors.soPhong ? "phong-so-phong-err" : undefined}
                  onChange={(e) => {
                    setFormPhong({ ...formPhong, soPhong: e.target.value });
                    setFormErrors((prev) => ({ ...prev, soPhong: undefined }));
                  }}
                  placeholder="Ví dụ: 101"
                  required
                />
                <p
                  id="phong-so-phong-err"
                  className={formErrors.soPhong ? "form-error" : "text-muted text-sm"}
                  style={{
                    margin: "0.35rem 0 0",
                    minHeight: "2.6rem",
                    visibility: formErrors.soPhong ? "visible" : "hidden",
                  }}
                >
                  {formErrors.soPhong || "placeholder"}
                </p>
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
                <p
                  className="text-muted text-sm"
                  style={{
                    margin: "0.35rem 0 0",
                    minHeight: "2.6rem",
                    visibility: "hidden",
                  }}
                >
                  placeholder
                </p>
              </div>
              <div className="form-group">
                <label>Loại phòng</label>
                <select
                  value={formPhong.idLoaiPhong}
                  disabled={dangLuu}
                  aria-invalid={Boolean(formErrors.idLoaiPhong)}
                  aria-describedby={formErrors.idLoaiPhong ? "phong-loai-err" : undefined}
                  onChange={(e) => {
                    setFormPhong({ ...formPhong, idLoaiPhong: Number(e.target.value) });
                    setFormErrors((prev) => ({ ...prev, idLoaiPhong: undefined }));
                  }}
                >
                  {danhSachLoaiPhong.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.ten}
                    </option>
                  ))}
                </select>
                <p
                  id="phong-loai-err"
                  className={formErrors.idLoaiPhong ? "form-error" : "text-muted text-sm"}
                  style={{
                    margin: "0.35rem 0 0",
                    minHeight: "2.6rem",
                    visibility: formErrors.idLoaiPhong ? "visible" : "hidden",
                  }}
                >
                  {formErrors.idLoaiPhong || "placeholder"}
                </p>
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "0.75rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    {formPhong.anhUrls.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        style={{
                          position: "relative",
                          border: "1px solid var(--border)",
                          borderRadius: "0.65rem",
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <img
                          src={url}
                          alt={`Ảnh phòng ${i + 1}`}
                          loading="lazy"
                          style={{
                            display: "block",
                            width: "100%",
                            height: "110px",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            position: "absolute",
                            top: "0.35rem",
                            right: "0.35rem",
                            padding: "0.2rem 0.45rem",
                            minHeight: "unset",
                          }}
                          disabled={dangLuu}
                          onClick={() => xoaAnhTaiViTri(i)}
                          aria-label={`Xóa ảnh ${i + 1}`}
                        >
                          <X className="btn-ico" aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm" style={{ margin: "0.5rem 0 0" }}>
                    Chưa có ảnh. Chọn một hoặc nhiều file để tải lên.
                  </p>
                )}
              </div>
              <div
                className="inline-actions"
                style={{
                  width: "100%",
                  justifyContent: "flex-end",
                  marginTop: "0.85rem",
                  paddingTop: "0.25rem",
                }}
              >
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

      {phongDangXemAnh ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setPhongDangXemAnh(null)}
        >
          <div
            className="card modal-panel"
            style={{ maxWidth: "min(980px, calc(100vw - 2rem))", width: "100%" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="phong-gallery-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <div>
                <h2 id="phong-gallery-title" className="card-title" style={{ margin: 0 }}>
                  Ảnh phòng {phongDangXemAnh.soPhong}
                </h2>
                <p className="text-muted text-sm" style={{ margin: "0.35rem 0 0" }}>
                  {phongDangXemAnh.duongDanAnh?.length || 0} ảnh
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPhongDangXemAnh(null)}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>
            {(phongDangXemAnh.duongDanAnh || []).length > 0 ? (
              <div
                style={{
                  marginTop: "1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "0.9rem",
                }}
              >
                {(phongDangXemAnh.duongDanAnh || []).map((url, i) => (
                  <figure
                    key={`${url}-${i}`}
                    style={{
                      margin: 0,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "rgba(255, 255, 255, 0.03)",
                      cursor: "zoom-in",
                    }}
                    onClick={() => setChiSoAnhDangXemTo(i)}
                  >
                    <img
                      src={url}
                      alt={`Phòng ${phongDangXemAnh.soPhong} - ảnh ${i + 1}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ margin: "1rem 0 0" }}>
                Phòng này chưa có ảnh.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {dangMoXemAnhTo ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setChiSoAnhDangXemTo(null)}
          style={{ zIndex: 1100, background: "rgba(3, 8, 18, 0.9)" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh phòng cỡ lớn"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(96vw, 1200px)",
              maxHeight: "92vh",
              display: "grid",
              gridTemplateRows: "1fr auto",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                position: "relative",
                minHeight: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={danhSachAnhDangXem[chiSoAnhDangXemTo!]}
                alt={`Ảnh phòng ${phongDangXemAnh?.soPhong} - ${chiSoAnhDangXemTo! + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "82vh",
                  objectFit: "contain",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148,163,184,0.28)",
                }}
              />

              {danhSachAnhDangXem.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
                    onClick={() =>
                      setChiSoAnhDangXemTo((prev) =>
                        prev == null
                          ? 0
                          : (prev - 1 + danhSachAnhDangXem.length) % danhSachAnhDangXem.length,
                      )
                    }
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="btn-ico" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
                    onClick={() =>
                      setChiSoAnhDangXemTo((prev) =>
                        prev == null ? 0 : (prev + 1) % danhSachAnhDangXem.length,
                      )
                    }
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight className="btn-ico" aria-hidden />
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}
                onClick={() => setChiSoAnhDangXemTo(null)}
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>

            <div className="text-sm text-muted" style={{ textAlign: "center" }}>
              Ảnh {chiSoAnhDangXemTo! + 1} / {danhSachAnhDangXem.length}
            </div>
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
