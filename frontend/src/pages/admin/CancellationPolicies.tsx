import { useState, useEffect } from "react";
import api from "../../api/client";
import AlertDialog from "../../components/AlertDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { apiErrorMessage } from "../../lib/apiError";

type ChinhSach = {
  id: number;
  soGioTruocNhanPhong: number;
  tyLeHoanTien: number;
  moTa?: string;
  conHieuLuc?: boolean;
};

export default function AdminPolicies() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [conHieuLucLoc, setConHieuLucLoc] = useState<"" | "true" | "false">(
    "",
  );
  const [list, setList] = useState<{
    content: ChinhSach[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [form, setForm] = useState({
    soGioTruocNhanPhong: 24,
    tyLeHoanTien: 100,
    moTa: "",
    conHieuLuc: true,
    thuTuUuTien: 0,
  });

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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/chinh-sach-huy-phong", {
        soGioTruocNhanPhong: form.soGioTruocNhanPhong,
        tyLeHoanTien: form.tyLeHoanTien,
        moTa: form.moTa || undefined,
        conHieuLuc: form.conHieuLuc,
        thuTuUuTien: form.thuTuUuTien,
      });
      setForm({
        soGioTruocNhanPhong: 24,
        tyLeHoanTien: 100,
        moTa: "",
        conHieuLuc: true,
        thuTuUuTien: 0,
      });
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
      await api.delete(`/chinh-sach-huy-phong/${pendingDeleteId}`);
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
      <h1 className="page-title">Chính sách hủy phòng &amp; hoàn tiền</h1>
      <p className="page-subtitle page-subtitle--tight">
        Quy định % hoàn tiền theo thời điểm hủy so với giờ nhận phòng.
      </p>
      <div className="card mb-section">
        <h3 className="card-title">Thêm chính sách</h3>
        <form onSubmit={save}>
          <div className="form-inline">
          <div className="form-group">
            <label>Hủy trước (giờ) so với nhận phòng</label>
            <input
              type="number"
              value={form.soGioTruocNhanPhong}
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
              onChange={(e) =>
                setForm({ ...form, tyLeHoanTien: Number(e.target.value) })
              }
              placeholder="0–100"
            />
          </div>
          <div className="form-group" style={{ flex: "2 1 220px" }}>
            <label>Mô tả</label>
            <input
              value={form.moTa}
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
              onChange={(e) => setForm({ ...form, conHieuLuc: e.target.checked })}
            />
            Đang áp dụng
          </label>
          </div>
          <div className="inline-actions mt-4">
          <button type="submit" className="btn">
            Thêm
          </button>
          </div>
        </form>
      </div>
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
        <h3 className="card-title">Danh sách chính sách</h3>
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
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setPendingDeleteId(p.id)}
                  >
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
      <AlertDialog
        open={notice != null}
        title={notice?.title}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
