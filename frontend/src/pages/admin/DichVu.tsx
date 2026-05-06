import { useState, useEffect } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";
import {
  digitsOnlyMoney,
  formatVndIntegerForInput,
  parseVndIntegerInput,
} from "../../lib/vndInput";

type DichVu = {
  id: number;
  ten: string;
  gia: number;
  moTa?: string;
};

type FormErrors = Partial<Record<"ten" | "giaStr" | "moTa", string>>;

const TEN_MAX = 120;
const MO_TA_MAX = 2000;
const GIA_MAX = 999_999_999_999;

const FORM_INITIAL = { ten: "", giaStr: "", moTa: "" };

function normalizeTenDichVu(v: string): string {
  return v.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");
}

export default function AdminDichVu() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [list, setList] = useState<{
    content: DichVu[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DichVu | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState({ ...FORM_INITIAL });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const load = () => {
    const params: Record<string, string | number> = { page, size: 12 };
    if (q.trim()) params.q = q.trim();
    api.get("/dich-vu", { params }).then((r) => setList(r.data));
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
    setForm({ ...FORM_INITIAL });
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
    setForm({ ...FORM_INITIAL });
    setFieldErrors({});
    setFormOpen(true);
  };

  const openEditModal = (d: DichVu) => {
    setEditing(d);
    setForm({
      ten: d.ten,
      giaStr: formatVndIntegerForInput(Number(d.gia)),
      moTa: d.moTa || "",
    });
    setFieldErrors({});
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const ten = form.ten.trim();
    const gia = parseVndIntegerInput(form.giaStr);
    const moTa = form.moTa.trim();
    const errs: FormErrors = {};
    if (!ten) errs.ten = "Vui lòng nhập tên dịch vụ.";
    else if (ten.length > TEN_MAX)
      errs.ten = `Tên dịch vụ tối đa ${TEN_MAX} ký tự.`;
    if (!form.giaStr.trim()) errs.giaStr = "Vui lòng nhập giá dịch vụ.";
    else if (!Number.isFinite(gia) || gia <= 0)
      errs.giaStr = "Giá phải là số nguyên dương.";
    else if (gia > GIA_MAX)
      errs.giaStr = `Giá không vượt quá ${formatVndIntegerForInput(GIA_MAX)} VND.`;
    if (moTa.length > MO_TA_MAX) errs.moTa = `Mô tả tối đa ${MO_TA_MAX} ký tự.`;
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const { data } = await api.get("/dich-vu", {
        params: { q: ten, page: 0, size: 200 },
      });
      const ds = (data?.content || []) as DichVu[];
      const biTrung = ds.some(
        (item) =>
          normalizeTenDichVu(item.ten) === normalizeTenDichVu(ten) &&
          (!editing || item.id !== editing.id),
      );
      if (biTrung) {
        setFieldErrors((prev) => ({
          ...prev,
          ten: "Tên dịch vụ đã tồn tại. Vui lòng nhập tên khác.",
        }));
        return;
      }
    } catch {}

    setSaveBusy(true);
    try {
      const payload = {
        ten,
        gia,
        moTa: moTa || undefined,
      };
      if (editing) {
        await api.put(`/dich-vu/${editing.id}`, payload);
        toast("Đã cập nhật dịch vụ.", "success");
      } else {
        await api.post("/dich-vu", payload);
        toast("Đã thêm dịch vụ.", "success");
      }
      closeFormModal();
      load();
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lưu dịch vụ thất bại.",
        "error",
      );
    } finally {
      setSaveBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/dich-vu/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
      toast("Đã xóa dịch vụ.", "success");
    } catch (err) {
      setPendingDeleteId(null);
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Xóa dịch vụ thất bại.",
        "error",
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Dịch vụ</h1>
      <p className="page-subtitle page-subtitle--tight">
        Thêm dịch vụ kèm phòng (giặt ủi, đưa đón…)
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
        <div
          className="form-row form-row--between"
          style={{ alignItems: "center", marginBottom: "0.75rem" }}
        >
          <h3 className="card-title" style={{ margin: 0 }}>
            Danh sách dịch vụ
          </h3>
          <button type="button" className="btn" onClick={openCreateModal}>
            <Plus className="btn-ico" aria-hidden />
            Thêm dịch vụ
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Giá (VND)</th>
                <th>Mô tả</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.content.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.ten}</td>
                  <td>{Number(d.gia).toLocaleString("vi-VN")}</td>
                  <td className="cell-wrap-text">{d.moTa || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: "0.35rem" }}
                      onClick={() => openEditModal(d)}
                    >
                      <Pencil className="btn-ico" aria-hidden />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setPendingDeleteId(d.id)}
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
            style={{
              maxWidth: "min(520px, calc(100vw - 2rem))",
              width: "100%",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dich-vu-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <h2
                id="dich-vu-modal-title"
                className="card-title"
                style={{ margin: 0 }}
              >
                {editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}
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
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tên dịch vụ</label>
                  <input
                    value={form.ten}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.ten)}
                    aria-describedby={
                      fieldErrors.ten ? "dich-vu-ten-err" : undefined
                    }
                    onChange={(e) => {
                      setForm({ ...form, ten: e.target.value });
                      setFieldErrors((prev) => ({ ...prev, ten: undefined }));
                    }}
                    placeholder="Ví dụ: Giặt ủi trong ngày"
                    required
                  />
                  {fieldErrors.ten ? (
                    <p
                      id="dich-vu-ten-err"
                      className="form-error"
                      style={{ margin: "0.35rem 0 0" }}
                    >
                      {fieldErrors.ten}
                    </p>
                  ) : null}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Giá (VND)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.giaStr}
                    disabled={saveBusy}
                    aria-invalid={Boolean(fieldErrors.giaStr)}
                    aria-describedby={
                      fieldErrors.giaStr ? "dich-vu-gia-err" : undefined
                    }
                    onChange={(e) => {
                      const d = digitsOnlyMoney(e.target.value);
                      setForm({
                        ...form,
                        giaStr: d ? formatVndIntegerForInput(Number(d)) : "",
                      });
                      setFieldErrors((prev) => ({
                        ...prev,
                        giaStr: undefined,
                      }));
                    }}
                    placeholder="Ví dụ: 250.000"
                    required
                  />
                  {fieldErrors.giaStr ? (
                    <p
                      id="dich-vu-gia-err"
                      className="form-error"
                      style={{ margin: "0.35rem 0 0" }}
                    >
                      {fieldErrors.giaStr}
                    </p>
                  ) : null}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Mô tả</label>
                  <textarea
                    rows={3}
                    value={form.moTa}
                    disabled={saveBusy}
                    maxLength={MO_TA_MAX}
                    aria-invalid={Boolean(fieldErrors.moTa)}
                    aria-describedby={
                      fieldErrors.moTa ? "dich-vu-mo-ta-err" : undefined
                    }
                    onChange={(e) => {
                      setForm({ ...form, moTa: e.target.value });
                      setFieldErrors((prev) => ({ ...prev, moTa: undefined }));
                    }}
                    placeholder="Mô tả ngắn (tuỳ chọn)"
                  />
                  {fieldErrors.moTa ? (
                    <p
                      id="dich-vu-mo-ta-err"
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

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Xóa dịch vụ"
        message="Bạn có chắc muốn xóa dịch vụ này? Thao tác không thể hoàn tác."
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
