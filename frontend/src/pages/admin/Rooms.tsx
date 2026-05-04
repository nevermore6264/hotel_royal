import { useState, useEffect, useRef } from "react";
import { Pencil, Save, Trash2, Upload, X } from "lucide-react";
import api from "../../api/client";
import AlertDialog from "../../components/AlertDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../lib/apiError";

type LoaiPhong = { id: number; ten: string };
type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  idLoaiPhong: number;
  tenLoaiPhong: string;
  duongDanAnh?: string[];
};

export default function AdminRooms() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [idLoaiLoc, setIdLoaiLoc] = useState<number | "">("");
  const [rooms, setRooms] = useState<{
    content: Phong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [editing, setEditing] = useState<Phong | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [form, setForm] = useState({
    soPhong: "",
    trangThai: "PHONG_TRONG",
    idLoaiPhong: 0,
    anhUrls: "",
  });

  const loadRooms = () => {
    const params: Record<string, string | number> = { page, size: 12 };
    if (q.trim()) params.q = q.trim();
    if (trangThaiLoc) params.trangThai = trangThaiLoc;
    if (idLoaiLoc !== "") params.idLoaiPhong = idLoaiLoc;
    api.get("/phong", { params }).then((r) => setRooms(r.data));
  };

  const loadRoomTypes = () => {
    api.get("/loai-phong").then((r) => setRoomTypes(r.data));
  };

  useEffect(() => {
    loadRooms();
  }, [page, q, trangThaiLoc, idLoaiLoc]);

  useEffect(() => {
    loadRoomTypes();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [q, trangThaiLoc, idLoaiLoc]);

  const load = () => {
    loadRooms();
    loadRoomTypes();
  };

  const appendUrlsToAnh = (urls: string[]) => {
    if (urls.length === 0) return;
    setForm((prev) => {
      const cur = prev.anhUrls.trim();
      const next = [cur, ...urls].filter(Boolean).join("\n");
      return { ...prev, anhUrls: next };
    });
  };

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < list.length; i++) fd.append("files", list[i]);
      const { data } = await api.post<{ tep: { duongDan: string }[] }>(
        "/tap-tin/phong-anh-nhieu",
        fd,
      );
      const urls = (data.tep || []).map((x) => x.duongDan);
      appendUrlsToAnh(urls);
      toast(`Đã tải lên ${urls.length} ảnh.`, "success");
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Upload thất bại.",
        "error",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const urls = form.anhUrls
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        soPhong: form.soPhong,
        trangThai: form.trangThai,
        idLoaiPhong: form.idLoaiPhong || editing?.idLoaiPhong || roomTypes[0]?.id,
        duongDanAnh: urls,
      };
      if (editing) {
        await api.put(`/phong/${editing.id}`, payload);
      } else {
        await api.post("/phong", payload);
      }
      setEditing(null);
      setForm({
        soPhong: "",
        trangThai: "PHONG_TRONG",
        idLoaiPhong: roomTypes[0]?.id || 0,
        anhUrls: "",
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
      await api.delete(`/phong/${pendingDeleteId}`);
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
      <h1 className="page-title">Quản lý phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Thêm, sửa hoặc xóa phòng theo loại và trạng thái.
      </p>
      <div className="card mb-section">
        <h3 className="card-title">
          {editing ? "Sửa phòng" : "Thêm phòng"}
        </h3>
        <form onSubmit={save} className="form-inline">
          <div className="form-group">
            <label>Số phòng</label>
            <input
              value={form.soPhong}
              onChange={(e) => setForm({ ...form, soPhong: e.target.value })}
              placeholder="Ví dụ: 101"
              required
            />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
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
              value={form.idLoaiPhong}
              onChange={(e) =>
                setForm({ ...form, idLoaiPhong: Number(e.target.value) })
              }
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.ten}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Ảnh phòng (URL hoặc tải file từ máy)</label>
            <div className="form-row" style={{ alignItems: "center", gap: "0.75rem" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="visually-hidden"
                onChange={onPickFiles}
                disabled={uploading}
                aria-hidden
                tabIndex={-1}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={uploading}
                aria-busy={uploading}
                aria-label="Tải ảnh phòng từ máy tính"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="btn-ico" aria-hidden />
                {uploading ? "Đang tải…" : "Tải ảnh từ máy"}
              </button>
            </div>
            <p className="text-muted text-sm" style={{ margin: "0.35rem 0 0.75rem" }}>
              Ảnh lưu trong thư mục <code>uploads/phong</code> trên server (không dùng cloud).
              Có thể chọn nhiều file; đường dẫn sẽ được thêm vào ô bên dưới.
            </p>
            <textarea
              rows={4}
              value={form.anhUrls}
              onChange={(e) => setForm({ ...form, anhUrls: e.target.value })}
              placeholder="https://... hoặc /api/uploads/phong/... sau khi upload"
            />
          </div>
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
        </form>
      </div>
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
              <option value="PHONG_TRONG">PHONG_TRONG</option>
              <option value="DANG_SU_DUNG">DANG_SU_DUNG</option>
              <option value="BAO_TRI">BAO_TRI</option>
              <option value="DA_GIU">DA_GIU</option>
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
        <h3 className="card-title">Danh sách phòng</h3>
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
            {rooms.content.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.soPhong}</td>
                <td>{r.tenLoaiPhong}</td>
                <td>{r.trangThai}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginRight: "0.5rem" }}
                    onClick={() => {
                      setEditing(r);
                      setForm({
                        soPhong: r.soPhong,
                        trangThai: r.trangThai,
                        idLoaiPhong: r.idLoaiPhong,
                        anhUrls: (r.duongDanAnh || []).join("\n"),
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
          totalPages={rooms.totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      </div>

      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Xóa phòng"
        message="Bạn có chắc muốn xóa phòng này? Thao tác không thể hoàn tác."
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
