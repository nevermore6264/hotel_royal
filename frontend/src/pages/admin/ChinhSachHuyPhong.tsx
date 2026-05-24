import { useState, useEffect } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import HopThoaiXacNhan from "../../components/HopThoaiXacNhan";
import ThanhPhanTrang from "../../components/ThanhPhanTrang";
import { dungThongBao } from "../../context/NguCanhThongBao";
import { apiErrorMessage } from "../../lib/apiError";

type ChinhSach = {
  id: number;
  soGioTruocNhanPhong: number;
  tyLeHoanTien: number;
  moTa?: string;
  conHieuLuc?: boolean;
};

const POLICY_FORM_INITIAL = {
  soGioTruocNhanPhong: 24,
  tyLeHoanTien: 100,
  moTa: "",
  conHieuLuc: true,
};

export default function AdminChinhSachHuyPhong() {
  const { toast } = dungThongBao();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [conHieuLucLoc, setConHieuLucLoc] = useState<"" | "true" | "false">(
    "",
  );
  const [list, setList] = useState<{
    content: ChinhSach[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ChinhSach | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState({ ...POLICY_FORM_INITIAL });

  const load = () => {
    const params: Record<string, string | number | boolean> = {
      page,
      size: 12,
    };
    if (q.trim()) params.q = q.trim();
    if (conHieuLucLoc === "true") params.conHieuLuc = true;
    if (conHieuLucLoc === "false") params.conHieuLuc = false;
    api.get("/chinh-sach-huy-phong", { params }).then((r) => setList(r.data));
  };
  useEffect(() => {
    load();
  }, [page, q, conHieuLucLoc]);

  useEffect(() => {
    setPage(0);
  }, [q, conHieuLucLoc]);

  const closeFormModal = () => {
    if (saveBusy) return;
    setFormOpen(false);
    setEditing(null);
    setForm({ ...POLICY_FORM_INITIAL });
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
    setForm({ ...POLICY_FORM_INITIAL });
    setFormOpen(true);
  };

  const openEditModal = (p: ChinhSach) => {
    setEditing(p);
    setForm({
      soGioTruocNhanPhong: Number(p.soGioTruocNhanPhong) || 0,
      tyLeHoanTien: Number(p.tyLeHoanTien) || 0,
      moTa: p.moTa || "",
      conHieuLuc: p.conHieuLuc ?? true,
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveBusy(true);
    try {
      const payload = {
        soGioTruocNhanPhong: form.soGioTruocNhanPhong,
        tyLeHoanTien: form.tyLeHoanTien,
        moTa: form.moTa || undefined,
        conHieuLuc: form.conHieuLuc,
      };
      if (editing) {
        await api.put(`/chinh-sach-huy-phong/${editing.id}`, payload);
        toast("Đã cập nhật chính sách.", "thanhCong");
      } else {
        await api.post("/chinh-sach-huy-phong", payload);
        toast("Đã thêm chính sách.", "thanhCong");
      }
      closeFormModal();
      load();
    } catch (err) {
      toast(apiErrorMessage(err, "Lỗi"), "thatBai");
    } finally {
      setSaveBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/chinh-sach-huy-phong/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
      toast("Đã xóa chính sách.", "thanhCong");
    } catch (err) {
      setPendingDeleteId(null);
      toast(apiErrorMessage(err, "Lỗi"), "thatBai");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Chính sách hủy phòng &amp; hoàn tiền</h1>
      <p className="page-subtitle page-subtitle--tight">
        Quy định % hoàn tiền theo thời điểm hủy so với giờ nhận phòng.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm &amp; lọc
        </h3>
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Tìm trong mô tả</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Từ khóa…"
            />
          </div>
          <div className="form-group">
            <label>Hiệu lực</label>
            <select
              value={conHieuLucLoc}
              onChange={(e) =>
                setConHieuLucLoc(e.target.value as "" | "true" | "false")
              }
            >
              <option value="">Tất cả</option>
              <option value="true">Đang áp dụng</option>
              <option value="false">Đã tắt</option>
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
            Danh sách chính sách
          </h3>
          <button type="button" className="btn" onClick={openCreateModal}>
            <Plus className="btn-ico" aria-hidden />
            Thêm chính sách
          </button>
        </div>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hủy trước (giờ)</th>
              <th>% hoàn tiền</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.content.map((p) => (
              <tr key={p.id}>
                <td>{p.soGioTruocNhanPhong}</td>
                <td>{Number(p.tyLeHoanTien)}%</td>
                <td>{p.moTa || "-"}</td>
                <td>{p.conHieuLuc ? "Áp dụng" : "Tắt"}</td>
                <td>
                  <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(p)}
                    >
                      <Pencil className="btn-ico" aria-hidden />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setPendingDeleteId(p.id)}
                    >
                      <Trash2 className="btn-ico" aria-hidden />
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <ThanhPhanTrang
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
            aria-labelledby="policy-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <h2 id="policy-modal-title" className="card-title" style={{ margin: 0 }}>
                {editing ? "Sửa chính sách" : "Thêm chính sách"}
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
            <form onSubmit={save} className="mt-4">
              <div className="form-inline">
                <div className="form-group">
                  <label>Hủy trước (giờ) so với nhận phòng</label>
                  <input
                    type="number"
                    value={form.soGioTruocNhanPhong}
                    disabled={saveBusy}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        soGioTruocNhanPhong: Number(e.target.value),
                      })
                    }
                    placeholder="Ví dụ: 24"
                  />
                </div>
                <div className="form-group">
                  <label>% hoàn tiền</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.tyLeHoanTien}
                    disabled={saveBusy}
                    onChange={(e) =>
                      setForm({ ...form, tyLeHoanTien: Number(e.target.value) })
                    }
                    placeholder="0–100"
                  />
                </div>
                <div className="form-group" style={{ flex: "2 1 220px" }}>
                  <label>Mô tả</label>
                  <textarea
                    rows={3}
                    value={form.moTa}
                    disabled={saveBusy}
                    onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                    placeholder="VD: Hủy trước 24h hoàn 100%"
                  />
                </div>
              </div>
              <div className="form-row" style={{ alignItems: "center", marginTop: "0.5rem" }}>
                <label className="text-sm" style={{ display: "flex", gap: "0.5rem", alignItems: "center", cursor: "pointer", color: "var(--text-muted)" }}>
                  <input
                    type="checkbox"
                    checked={form.conHieuLuc}
                    disabled={saveBusy}
                    onChange={(e) => setForm({ ...form, conHieuLuc: e.target.checked })}
                  />
                  Đang áp dụng
                </label>
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

      <HopThoaiXacNhan
        open={pendingDeleteId != null}
        title="Xóa chính sách"
        message="Bạn có chắc muốn xóa chính sách hủy phòng này? Thao tác không thể hoàn tác."
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
