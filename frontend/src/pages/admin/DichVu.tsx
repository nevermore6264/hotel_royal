import { useState, useEffect } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";

type DichVu = {
  id: number;
  ten: string;
  gia: number;
  moTa?: string;
};

export default function AdminDichVu() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [list, setList] = useState<{
    content: DichVu[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [editing, setEditing] = useState<DichVu | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [form, setForm] = useState({
    ten: "",
    gia: 0,
    moTa: "",
  });

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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ten: form.ten,
        gia: form.gia,
        moTa: form.moTa || undefined,
      };
      if (editing) await api.put(`/dich-vu/${editing.id}`, payload);
      else await api.post("/dich-vu", payload);
      setEditing(null);
      setForm({ ten: "", gia: 0, moTa: "" });
      load();
      toast("Đã lưu dịch vụ.", "success");
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Lỗi",
        "error",
      );
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/dich-vu/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
      toast("Đã xóa.", "success");
    } catch (err) {
      setPendingDeleteId(null);
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Không xóa được",
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
        Thêm dịch vụ kèm phòng (giặt ủi, đưa đón…); nhân viên gán vào đặt phòng.
      </p>
      <div className="card mb-section">
        <h3 className="card-title">
          {editing ? "Sửa dịch vụ" : "Thêm dịch vụ"}
        </h3>
        <form onSubmit={save}>
          <div className="form-inline">
            <div className="form-group">
              <label>Tên dịch vụ</label>
              <input
                value={form.ten}
                onChange={(e) => setForm({ ...form, ten: e.target.value })}
                placeholder="Ví dụ: Giặt ủi trong ngày"
                required
              />
            </div>
            <div className="form-group">
              <label>Giá (VND)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.gia || ""}
                onChange={(e) =>
                  setForm({ ...form, gia: Number(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="form-group" style={{ flex: "2 1 260px" }}>
              <label>Mô tả</label>
              <textarea
                rows={2}
                value={form.moTa}
                onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                placeholder="Mô tả ngắn (tuỳ chọn)"
              />
            </div>
          </div>
          <div className="inline-actions mt-4">
            <button type="submit" className="btn">
              <Save className="btn-ico" aria-hidden />
              Lưu
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(null);
                  setForm({ ten: "", gia: 0, moTa: "" });
                }}
              >
                <X className="btn-ico" aria-hidden />
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
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
        <h3 className="card-title">Danh sách dịch vụ</h3>
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
                      onClick={() => {
                        setEditing(d);
                        setForm({
                          ten: d.ten,
                          gia: Number(d.gia),
                          moTa: d.moTa || "",
                        });
                      }}
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
