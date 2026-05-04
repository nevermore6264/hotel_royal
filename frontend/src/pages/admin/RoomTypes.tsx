import { useState, useEffect } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import PaginationBar from "../../components/PaginationBar";
import AlertDialog from "../../components/AlertDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
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

export default function AdminRoomTypes() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [list, setList] = useState<{
    content: LoaiPhong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [editing, setEditing] = useState<LoaiPhong | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [form, setForm] = useState({
    ten: "",
    /** Chuỗi hiển thị có dấu chấm; khi lưu parse thành số gửi API. */
    giaStr: "",
    moTa: "",
    sucChuaToiDa: 2,
  });

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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const gia = parseVndIntegerInput(form.giaStr);
    if (!Number.isFinite(gia) || gia <= 0) {
      setNotice({
        title: "Giá không hợp lệ",
        message: "Vui lòng nhập giá hợp lệ (VND/đêm, lớn hơn 0).",
      });
      return;
    }
    const payload = {
      ten: form.ten,
      gia,
      moTa: form.moTa,
      sucChuaToiDa: form.sucChuaToiDa,
    };
    try {
      if (editing) await api.put(`/loai-phong/${editing.id}`, payload);
      else await api.post("/loai-phong", payload);
      setEditing(null);
      setForm({ ten: "", giaStr: "", moTa: "", sucChuaToiDa: 2 });
      load();
    } catch (err) {
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Lỗi"),
      });
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/loai-phong/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
    } catch (err) {
      setPendingDeleteId(null);
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Lỗi"),
      });
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
        <h3 className="card-title">
          {editing ? "Sửa loại phòng" : "Thêm loại phòng"}
        </h3>
        <form onSubmit={save}>
          <div className="form-inline">
          <div className="form-group">
            <label>Tên</label>
            <input
              value={form.ten}
              onChange={(e) => setForm({ ...form, ten: e.target.value })}
              placeholder="Ví dụ: Deluxe, Suite…"
              required
            />
          </div>
          <div className="form-group">
            <label>Giá (VND/đêm)</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.giaStr}
              onChange={(e) => {
                const d = digitsOnlyMoney(e.target.value);
                if (!d) setForm({ ...form, giaStr: "" });
                else setForm({ ...form, giaStr: formatVndIntegerForInput(Number(d)) });
              }}
              placeholder="Ví dụ: 1.850.000"
              required
            />
          </div>
          <div className="form-group">
            <label>Số người tối đa</label>
            <input
              type="number"
              min={1}
              value={form.sucChuaToiDa}
              onChange={(e) =>
                setForm({ ...form, sucChuaToiDa: Number(e.target.value) || 2 })
              }
              placeholder="Số người"
            />
          </div>
          <div className="form-group" style={{ flex: "2 1 220px" }}>
            <label>Mô tả</label>
            <input
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              placeholder="Ghi chú hiển thị cho khách (tuỳ chọn)"
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
                onClick={() => setEditing(null)}
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
        <h3 className="card-title">Danh sách loại phòng</h3>
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
                    onClick={() => {
                      setEditing(r);
                      setForm({
                        ten: r.ten,
                        giaStr: formatVndIntegerForInput(Number(r.gia)),
                        moTa: r.moTa || "",
                        sucChuaToiDa: r.sucChuaToiDa ?? 2,
                      });
                    }}
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

      <AlertDialog
        open={notice != null}
        title={notice?.title}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
