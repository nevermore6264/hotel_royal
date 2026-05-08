import { useEffect, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../lib/apiError";
import { formatNgayVN } from "../../lib/ngayGio";
import {
  digitsOnlyMoney,
  formatVndIntegerForInput,
  parseVndIntegerInput,
} from "../../lib/vndInput";

type LoaiPhong = {
  id: number;
  ten: string;
};

type BangGiaPhong = {
  id: number;
  idLoaiPhong: number;
  tenLoaiPhong?: string;
  tenChinhSach: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  giaApDung: number;
  kichHoat: boolean;
  moTa?: string;
};

type FormBangGiaErrors = Partial<
  Record<
    | "idLoaiPhong"
    | "tenChinhSach"
    | "giaApDungStr"
    | "ngayBatDau"
    | "ngayKetThuc"
    | "moTa",
    string
  >
>;

const TEN_CHINH_SACH_MAX = 120;
const MO_TA_MAX = 5000;
const GIA_MAX = 999_999_999_999;

const emptyForm = {
  idLoaiPhong: "",
  tenChinhSach: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  giaApDungStr: "",
  kichHoat: true,
  moTa: "",
};

export default function AdminBangGiaPhong() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [idLoaiLoc, setIdLoaiLoc] = useState<number | "">("");
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [list, setList] = useState<{
    content: BangGiaPhong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BangGiaPhong | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [fieldErrors, setFieldErrors] = useState<FormBangGiaErrors>({});
  const errorSlotStyle: React.CSSProperties = {
    margin: "0.35rem 0 0",
    minHeight: "1.5rem",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as any,
    WebkitLineClamp: 3 as any,
    overflow: "hidden",
    lineHeight: "1.25rem",
  };

  const loadList = () => {
    const params: Record<string, string | number> = { page, size: 12 };
    if (q.trim()) params.q = q.trim();
    if (idLoaiLoc !== "") params.idLoaiPhong = idLoaiLoc;
    api.get("/bang-gia-phong", { params }).then((r) => setList(r.data));
  };

  const loadRoomTypes = () => {
    api.get("/loai-phong").then((r) => setRoomTypes(r.data));
  };

  const load = () => {
    loadList();
    loadRoomTypes();
  };

  useEffect(() => {
    loadList();
  }, [page, q, idLoaiLoc]);

  useEffect(() => {
    loadRoomTypes();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [q, idLoaiLoc]);

  const closeFormModal = () => {
    if (saveBusy) return;
    setFormOpen(false);
    setEditing(null);
    setForm({ ...emptyForm });
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
    setForm({ ...emptyForm });
    setFieldErrors({});
    setFormOpen(true);
  };

  const openEditModal = (item: BangGiaPhong) => {
    setEditing(item);
    setFieldErrors({});
    setForm({
      idLoaiPhong: String(item.idLoaiPhong),
      tenChinhSach: item.tenChinhSach,
      ngayBatDau: item.ngayBatDau,
      ngayKetThuc: item.ngayKetThuc,
      giaApDungStr: formatVndIntegerForInput(Number(item.giaApDung)),
      kichHoat: Boolean(item.kichHoat),
      moTa: item.moTa || "",
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FormBangGiaErrors = {};
    const ten = form.tenChinhSach.trim();
    const moTa = form.moTa.trim();
    const gia = parseVndIntegerInput(form.giaApDungStr);

    if (!form.idLoaiPhong) nextErrors.idLoaiPhong = "Vui lòng chọn loại phòng.";
    if (!ten) nextErrors.tenChinhSach = "Vui lòng nhập tên chính sách.";
    else if (ten.length > TEN_CHINH_SACH_MAX)
      nextErrors.tenChinhSach = `Tên chính sách tối đa ${TEN_CHINH_SACH_MAX} ký tự.`;

    if (!form.giaApDungStr.trim())
      nextErrors.giaApDungStr = "Vui lòng nhập giá áp dụng.";
    else if (!Number.isFinite(gia) || gia <= 0)
      nextErrors.giaApDungStr = "Giá áp dụng phải là số nguyên dương.";
    else if (gia > GIA_MAX)
      nextErrors.giaApDungStr = `Giá áp dụng không được vượt quá ${formatVndIntegerForInput(GIA_MAX)} VND/đêm.`;

    if (!form.ngayBatDau) nextErrors.ngayBatDau = "Vui lòng chọn ngày bắt đầu.";
    if (!form.ngayKetThuc)
      nextErrors.ngayKetThuc = "Vui lòng chọn ngày kết thúc.";
    if (
      form.ngayBatDau &&
      form.ngayKetThuc &&
      form.ngayBatDau > form.ngayKetThuc
    ) {
      nextErrors.ngayKetThuc =
        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
    }
    if (moTa.length > MO_TA_MAX) {
      nextErrors.moTa = `Mô tả tối đa ${MO_TA_MAX} ký tự.`;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const { data } = await api.get("/bang-gia-phong", {
        params: { idLoaiPhong: Number(form.idLoaiPhong), page: 0, size: 200 },
      });
      const ds = (data?.content || []) as BangGiaPhong[];
      const batDauMoi = new Date(form.ngayBatDau).getTime();
      const ketThucMoi = new Date(form.ngayKetThuc).getTime();
      const biGiaoNhau = ds.some((item) => {
        if (editing && item.id === editing.id) return false;
        const batDauCu = new Date(item.ngayBatDau).getTime();
        const ketThucCu = new Date(item.ngayKetThuc).getTime();
        return batDauMoi <= ketThucCu && batDauCu <= ketThucMoi;
      });
      if (biGiaoNhau) {
        setFieldErrors((prev) => ({
          ...prev,
          ngayBatDau:
            "Khoảng ngày bị trùng với chính sách khác của cùng loại phòng.",
          ngayKetThuc:
            "Khoảng ngày bị trùng với chính sách khác của cùng loại phòng.",
        }));
        return;
      }
    } catch {}

    const payload = {
      tenChinhSach: ten,
      giaApDung: gia,
      moTa: moTa || undefined,
      ngayBatDau: form.ngayBatDau,
      ngayKetThuc: form.ngayKetThuc,
      kichHoat: form.kichHoat,
      idLoaiPhong: Number(form.idLoaiPhong),
    };
    setSaveBusy(true);
    try {
      if (editing) {
        await api.put(`/bang-gia-phong/${editing.id}`, payload);
        toast("Đã cập nhật bảng giá.", "thanhCong");
      } else {
        await api.post("/bang-gia-phong", payload);
        toast("Đã thêm bảng giá.", "thanhCong");
      }
      closeFormModal();
      load();
    } catch (err) {
      toast(apiErrorMessage(err, "Lưu bảng giá thất bại"), "thatBai");
    } finally {
      setSaveBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/bang-gia-phong/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
      toast("Đã xóa bảng giá.", "thanhCong");
    } catch (err) {
      setPendingDeleteId(null);
      toast(apiErrorMessage(err, "Xóa thất bại"), "thatBai");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Bảng giá phòng theo mùa</h1>
      <p className="page-subtitle page-subtitle--tight">
        Tạo giá riêng cho mùa cao điểm, lễ, Tết hoặc chương trình ngắn hạn.
      </p>

      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm &amp; lọc
        </h3>
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Từ khóa (tên chính sách, loại phòng)</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Lọc danh sách…"
            />
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
              {roomTypes.map((rt) => (
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
            Danh sách bảng giá
          </h3>
          <button type="button" className="btn" onClick={openCreateModal}>
            <Plus className="btn-ico" aria-hidden />
            Thêm bảng giá
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Loại phòng</th>
                <th>Chính sách</th>
                <th>Thời gian</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.content.map((item) => (
                <tr key={item.id}>
                  <td>{item.tenLoaiPhong || item.idLoaiPhong}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.tenChinhSach}</div>
                    <div className="text-muted text-sm">{item.moTa || "—"}</div>
                  </td>
                  <td>
                    {formatNgayVN(item.ngayBatDau)} →{" "}
                    {formatNgayVN(item.ngayKetThuc)}
                  </td>
                  <td>
                    {Number(item.giaApDung).toLocaleString("vi-VN")} VND/đêm
                  </td>
                  <td>{item.kichHoat ? "Áp dụng" : "Tắt"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: "0.5rem" }}
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil className="btn-ico" aria-hidden />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setPendingDeleteId(item.id)}
                    >
                      <Trash2 className="btn-ico" aria-hidden />
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {list.content.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Chưa có bảng giá theo mùa nào.
                  </td>
                </tr>
              )}
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
            className="card modal-panel"
            style={{
              maxWidth: "min(720px, calc(100vw - 2rem))",
              width: "100%",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bang-gia-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <h2
                id="bang-gia-modal-title"
                className="card-title"
                style={{ margin: 0 }}
              >
                {editing ? "Sửa bảng giá" : "Thêm bảng giá"}
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
              <div className="form-inline">
                <div className="form-group">
                  <label>Loại phòng</label>
                  <select
                    value={form.idLoaiPhong}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.idLoaiPhong)}
                    aria-describedby={
                      fieldErrors.idLoaiPhong
                        ? "bang-gia-id-loai-err"
                        : undefined
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        idLoaiPhong: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Chọn loại phòng</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.ten}
                      </option>
                    ))}
                  </select>
                  <p
                    id="bang-gia-id-loai-err"
                    className={
                      fieldErrors.idLoaiPhong
                        ? "form-error"
                        : "text-muted text-sm"
                    }
                    style={{
                      ...errorSlotStyle,
                      visibility: fieldErrors.idLoaiPhong
                        ? "visible"
                        : "hidden",
                    }}
                  >
                    {fieldErrors.idLoaiPhong || "placeholder"}
                  </p>
                </div>
                <div className="form-group">
                  <label>Tên chính sách</label>
                  <input
                    value={form.tenChinhSach}
                    disabled={saveBusy}
                    maxLength={TEN_CHINH_SACH_MAX}
                    aria-invalid={Boolean(fieldErrors.tenChinhSach)}
                    aria-describedby={
                      fieldErrors.tenChinhSach ? "bang-gia-ten-err" : undefined
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tenChinhSach: e.target.value,
                      }))
                    }
                    placeholder="VD: Giá lễ 30/4"
                    required
                  />
                  <p
                    id="bang-gia-ten-err"
                    className={
                      fieldErrors.tenChinhSach
                        ? "form-error"
                        : "text-muted text-sm"
                    }
                    style={{
                      ...errorSlotStyle,
                      visibility: fieldErrors.tenChinhSach
                        ? "visible"
                        : "hidden",
                    }}
                  >
                    {fieldErrors.tenChinhSach || "placeholder"}
                  </p>
                </div>
                <div className="form-group">
                  <label>Giá áp dụng (VND/đêm)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.giaApDungStr}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.giaApDungStr)}
                    aria-describedby={
                      fieldErrors.giaApDungStr ? "bang-gia-gia-err" : undefined
                    }
                    onChange={(e) =>
                      setForm((prev) => {
                        const d = digitsOnlyMoney(e.target.value);
                        return {
                          ...prev,
                          giaApDungStr: d
                            ? formatVndIntegerForInput(Number(d))
                            : "",
                        };
                      })
                    }
                    placeholder="Ví dụ: 2.500.000"
                    required
                  />
                  <p
                    id="bang-gia-gia-err"
                    className={
                      fieldErrors.giaApDungStr
                        ? "form-error"
                        : "text-muted text-sm"
                    }
                    style={{
                      ...errorSlotStyle,
                      visibility: fieldErrors.giaApDungStr
                        ? "visible"
                        : "hidden",
                    }}
                  >
                    {fieldErrors.giaApDungStr || "placeholder"}
                  </p>
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.ngayBatDau}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.ngayBatDau)}
                    aria-describedby={
                      fieldErrors.ngayBatDau
                        ? "bang-gia-bat-dau-err"
                        : undefined
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ngayBatDau: e.target.value,
                      }))
                    }
                    placeholder="Bắt đầu áp dụng"
                    required
                  />
                  <p
                    id="bang-gia-bat-dau-err"
                    className={
                      fieldErrors.ngayBatDau
                        ? "form-error"
                        : "text-muted text-sm"
                    }
                    style={{
                      ...errorSlotStyle,
                      visibility: fieldErrors.ngayBatDau ? "visible" : "hidden",
                    }}
                  >
                    {fieldErrors.ngayBatDau || "placeholder"}
                  </p>
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={form.ngayKetThuc}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.ngayKetThuc)}
                    aria-describedby={
                      fieldErrors.ngayKetThuc
                        ? "bang-gia-ket-thuc-err"
                        : undefined
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ngayKetThuc: e.target.value,
                      }))
                    }
                    placeholder="Kết thúc áp dụng"
                    required
                  />
                  <p
                    id="bang-gia-ket-thuc-err"
                    className={
                      fieldErrors.ngayKetThuc
                        ? "form-error"
                        : "text-muted text-sm"
                    }
                    style={{
                      ...errorSlotStyle,
                      visibility: fieldErrors.ngayKetThuc
                        ? "visible"
                        : "hidden",
                    }}
                  >
                    {fieldErrors.ngayKetThuc || "placeholder"}
                  </p>
                </div>
                <div
                  className="form-group"
                  style={{ flex: "1 1 100%", minWidth: "100%" }}
                >
                  <label>Mô tả</label>
                  <textarea
                    rows={3}
                    value={form.moTa}
                    disabled={saveBusy}
                    maxLength={MO_TA_MAX}
                    aria-invalid={Boolean(fieldErrors.moTa)}
                    aria-describedby={
                      fieldErrors.moTa ? "bang-gia-mo-ta-err" : undefined
                    }
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, moTa: e.target.value }))
                    }
                    placeholder="Ghi chú cho lễ tân hoặc quản trị"
                  />
                  {fieldErrors.moTa ? (
                    <p
                      id="bang-gia-mo-ta-err"
                      className="form-error"
                      style={{ margin: "0.35rem 0 0" }}
                    >
                      {fieldErrors.moTa}
                    </p>
                  ) : (
                    <p
                      className="text-muted text-sm"
                      style={{ margin: "0.35rem 0 0" }}
                    >
                      {form.moTa.length}/{MO_TA_MAX} ký tự
                    </p>
                  )}
                </div>
              </div>

              <label
                className="text-sm"
                style={{
                  display: "inline-flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  marginTop: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.kichHoat}
                  disabled={saveBusy}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, kichHoat: e.target.checked }))
                  }
                />
                Đang áp dụng
              </label>

              <div
                className="inline-actions mt-4"
                style={{ justifyContent: "flex-end" }}
              >
                <button type="submit" className="btn" disabled={saveBusy}>
                  <Save className="btn-ico" aria-hidden />
                  {saveBusy ? "Đang lưu…" : "Lưu bảng giá"}
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

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Xóa bảng giá"
        message="Bạn có chắc muốn xóa dòng bảng giá này? Thao tác không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        danger
        busy={deleteBusy}
        onCancel={() => {
          if (!deleteBusy) setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
