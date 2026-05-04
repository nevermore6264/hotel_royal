import { useState, useEffect } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import PaginationBar from "../../components/PaginationBar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../lib/apiError";
import {
  digitsOnlyMoney,
  formatVndIntegerForInput,
  parseVndIntegerInput,
} from "../../lib/vndInput";

type LoaiPhong = {
  id: number;
  ten: string;
  gia: number;
  moTa?: string;
  sucChuaToiDa?: number;
};

const TEN_MAX = 100;
const MO_TA_MAX = 5000;
const GIA_VND_MAX = 999_999_999_999;
const SUC_CHUA_MIN = 1;
const SUC_CHUA_MAX = 50;

type FormFieldKey = "ten" | "giaStr" | "moTa" | "sucChuaToiDa";
type FormFieldErrors = Partial<Record<FormFieldKey, string>>;

function validateLoaiPhongForm(form: {
  ten: string;
  giaStr: string;
  moTa: string;
  sucChuaToiDa: number;
}): FormFieldErrors {
  const err: FormFieldErrors = {};
  const ten = form.ten.trim();
  if (!ten) err.ten = "Vui lòng nhập tên loại phòng.";
  else if (ten.length > TEN_MAX)
    err.ten = `Tên tối đa ${TEN_MAX} ký tự (hiện ${ten.length}).`;

  const giaStrTrim = form.giaStr.trim();
  if (!giaStrTrim) err.giaStr = "Vui lòng nhập giá (VND/đêm).";
  else {
    const gia = parseVndIntegerInput(form.giaStr);
    if (!Number.isFinite(gia) || gia <= 0)
      err.giaStr = "Giá phải là số nguyên dương.";
    else if (gia > GIA_VND_MAX)
      err.giaStr = `Giá không được vượt quá ${formatVndIntegerForInput(GIA_VND_MAX)} VND/đêm.`;
  }

  if (form.moTa.length > MO_TA_MAX)
    err.moTa = `Mô tả tối đa ${MO_TA_MAX} ký tự (hiện ${form.moTa.length}).`;

  const sc = form.sucChuaToiDa;
  if (!Number.isFinite(sc) || !Number.isInteger(sc))
    err.sucChuaToiDa = "Số người tối đa phải là số nguyên.";
  else if (sc < SUC_CHUA_MIN || sc > SUC_CHUA_MAX)
    err.sucChuaToiDa = `Số người tối đa phải từ ${SUC_CHUA_MIN} đến ${SUC_CHUA_MAX}.`;

  return err;
}

const LOAI_PHONG_FORM_INITIAL = {
  ten: "",
  giaStr: "",
  moTa: "",
  sucChuaToiDa: 2,
};

export default function AdminRoomTypes() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [list, setList] = useState<{
    content: LoaiPhong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LoaiPhong | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState({ ...LOAI_PHONG_FORM_INITIAL });
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});

  const load = () => {
    const params: Record<string, string | number> = { page, size: 12 };
    if (q.trim()) params.q = q.trim();
    api.get("/loai-phong", { params }).then((r) => setList(r.data));
  };
  useEffect(() => {
    load();
  }, [page, q]);

  useEffect(() => {
    setPage(0);
  }, [q]);

  const closeFormModal = () => {
    if (saveBusy) return;
    setFormOpen(false);
    setEditing(null);
    setForm({ ...LOAI_PHONG_FORM_INITIAL });
    setFieldErrors({});
  };

  useEffect(() => {
    if (!formOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || saveBusy) return;
      setFormOpen(false);
      setEditing(null);
      setForm({ ...LOAI_PHONG_FORM_INITIAL });
      setFieldErrors({});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formOpen, saveBusy]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({ ...LOAI_PHONG_FORM_INITIAL });
    setFieldErrors({});
    setFormOpen(true);
  };

  const openEditModal = (r: LoaiPhong) => {
    setEditing(r);
    setFieldErrors({});
    setForm({
      ten: r.ten,
      giaStr: formatVndIntegerForInput(Number(r.gia)),
      moTa: r.moTa || "",
      sucChuaToiDa: r.sucChuaToiDa ?? 2,
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLoaiPhongForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const gia = parseVndIntegerInput(form.giaStr);
    const payload = {
      ten: form.ten.trim(),
      gia,
      moTa: form.moTa.trim() || undefined,
      sucChuaToiDa: form.sucChuaToiDa,
    };
    setSaveBusy(true);
    try {
      if (editing) {
        await api.put(`/loai-phong/${editing.id}`, payload);
        toast("Đã cập nhật loại phòng.", "success");
      } else {
        await api.post("/loai-phong", payload);
        toast("Đã thêm loại phòng.", "success");
      }
      setFormOpen(false);
      setEditing(null);
      setForm({ ...LOAI_PHONG_FORM_INITIAL });
      setFieldErrors({});
      load();
    } catch (err) {
      toast(apiErrorMessage(err, "Lưu loại phòng thất bại."), "error");
    } finally {
      setSaveBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/loai-phong/${pendingDeleteId}`);
      setPendingDeleteId(null);
      toast("Đã xóa loại phòng.", "success");
      load();
    } catch (err) {
      setPendingDeleteId(null);
      toast(apiErrorMessage(err, "Xóa loại phòng thất bại."), "error");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý loại phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Định nghĩa giá cơ sở, sức chứa và mô tả cho từng loại phòng.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm theo tên / mô tả
        </h3>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Từ khóa</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Lọc danh sách…"
          />
        </div>
      </div>
      <div className="card">
        <div className="form-row form-row--between" style={{ alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            Danh sách loại phòng
          </h3>
          <button type="button" className="btn" onClick={openCreateModal}>
            <Plus className="btn-ico" aria-hidden />
            Thêm loại phòng
          </button>
        </div>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Người</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.content.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.ten}</td>
                <td
                  style={{ maxWidth: "18rem", wordBreak: "break-word" }}
                  title={r.moTa?.trim() || undefined}
                >
                  {r.moTa?.trim() ? r.moTa : "—"}
                </td>
                <td>{Number(r.gia).toLocaleString("vi-VN")} VND</td>
                <td>{r.sucChuaToiDa ?? "-"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => openEditModal(r)}
                  >
                    <Pencil className="btn-ico" aria-hidden />
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setPendingDeleteId(r.id)}
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
            style={{ maxWidth: "min(560px, calc(100vw - 2rem))", width: "100%" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loai-phong-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="form-row form-row--between" style={{ alignItems: "flex-start", gap: "1rem" }}>
              <h2 id="loai-phong-modal-title" className="card-title" style={{ margin: 0 }}>
                {editing ? "Sửa loại phòng" : "Thêm loại phòng"}
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
              <div className="form-group">
                <label htmlFor="loai-phong-ten">Tên</label>
                <input
                  id="loai-phong-ten"
                  value={form.ten}
                  maxLength={TEN_MAX}
                  disabled={saveBusy}
                  aria-invalid={Boolean(fieldErrors.ten)}
                  aria-describedby={fieldErrors.ten ? "loai-phong-ten-err" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, ten: e.target.value });
                    setFieldErrors((prev) => ({ ...prev, ten: undefined }));
                  }}
                  placeholder="Ví dụ: Deluxe, Suite…"
                />
                {fieldErrors.ten ? (
                  <p id="loai-phong-ten-err" className="form-error" style={{ margin: "0.35rem 0 0" }}>
                    {fieldErrors.ten}
                  </p>
                ) : null}
              </div>
              <div className="form-group">
                <label htmlFor="loai-phong-gia">Giá (VND/đêm)</label>
                <input
                  id="loai-phong-gia"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.giaStr}
                  disabled={saveBusy}
                  aria-invalid={Boolean(fieldErrors.giaStr)}
                  aria-describedby={fieldErrors.giaStr ? "loai-phong-gia-err" : undefined}
                  onChange={(e) => {
                    const d = digitsOnlyMoney(e.target.value);
                    if (!d) setForm({ ...form, giaStr: "" });
                    else setForm({ ...form, giaStr: formatVndIntegerForInput(Number(d)) });
                    setFieldErrors((prev) => ({ ...prev, giaStr: undefined }));
                  }}
                  placeholder="Ví dụ: 1.850.000"
                />
                {fieldErrors.giaStr ? (
                  <p id="loai-phong-gia-err" className="form-error" style={{ margin: "0.35rem 0 0" }}>
                    {fieldErrors.giaStr}
                  </p>
                ) : null}
              </div>
              <div className="form-group">
                <label htmlFor="loai-phong-suc-chua">Số người tối đa</label>
                <input
                  id="loai-phong-suc-chua"
                  type="number"
                  min={SUC_CHUA_MIN}
                  max={SUC_CHUA_MAX}
                  value={form.sucChuaToiDa}
                  disabled={saveBusy}
                  aria-invalid={Boolean(fieldErrors.sucChuaToiDa)}
                  aria-describedby={
                    fieldErrors.sucChuaToiDa ? "loai-phong-suc-chua-err" : undefined
                  }
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setForm({
                      ...form,
                      sucChuaToiDa: Number.isFinite(n) ? Math.trunc(n) : SUC_CHUA_MIN,
                    });
                    setFieldErrors((prev) => ({ ...prev, sucChuaToiDa: undefined }));
                  }}
                  placeholder="Số người"
                />
                {fieldErrors.sucChuaToiDa ? (
                  <p
                    id="loai-phong-suc-chua-err"
                    className="form-error"
                    style={{ margin: "0.35rem 0 0" }}
                  >
                    {fieldErrors.sucChuaToiDa}
                  </p>
                ) : null}
              </div>
              <div className="form-group">
                <label htmlFor="loai-phong-mo-ta">Mô tả</label>
                <textarea
                  id="loai-phong-mo-ta"
                  rows={3}
                  value={form.moTa}
                  maxLength={MO_TA_MAX}
                  disabled={saveBusy}
                  aria-invalid={Boolean(fieldErrors.moTa)}
                  aria-describedby={fieldErrors.moTa ? "loai-phong-mo-ta-err" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, moTa: e.target.value });
                    setFieldErrors((prev) => ({ ...prev, moTa: undefined }));
                  }}
                  placeholder="Ghi chú hiển thị cho khách (tuỳ chọn)"
                />
                {fieldErrors.moTa ? (
                  <p id="loai-phong-mo-ta-err" className="form-error" style={{ margin: "0.35rem 0 0" }}>
                    {fieldErrors.moTa}
                  </p>
                ) : (
                  <p className="text-muted text-sm" style={{ margin: "0.35rem 0 0" }}>
                    {form.moTa.length}/{MO_TA_MAX} ký tự
                  </p>
                )}
              </div>
              <div className="inline-actions mt-4">
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

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Xóa loại phòng"
        message="Bạn có chắc muốn xóa loại phòng này? Thao tác không thể hoàn tác."
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
