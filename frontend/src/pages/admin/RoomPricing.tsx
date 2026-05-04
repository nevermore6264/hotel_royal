import { useEffect, useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import api from "../../api/client";
import AlertDialog from "../../components/AlertDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import PaginationBar from "../../components/PaginationBar";
import { apiErrorMessage } from "../../lib/apiError";

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
  uuTien: number;
  kichHoat: boolean;
  moTa?: string;
};

const emptyForm = {
  idLoaiPhong: "",
  tenChinhSach: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  giaApDung: 0,
  uuTien: 0,
  kichHoat: true,
  moTa: "",
};

export default function AdminRoomPricing() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [idLoaiLoc, setIdLoaiLoc] = useState<number | "">("");
  const [roomTypes, setRoomTypes] = useState<LoaiPhong[]>([]);
  const [list, setList] = useState<{
    content: BangGiaPhong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [editing, setEditing] = useState<BangGiaPhong | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);

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

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      idLoaiPhong: Number(form.idLoaiPhong),
    };
    try {
      if (editing) {
        await api.put(`/bang-gia-phong/${editing.id}`, payload);
      } else {
        await api.post("/bang-gia-phong", payload);
      }
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Lưu bảng giá thất bại"),
      });
    }
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/bang-gia-phong/${pendingDeleteId}`);
      setPendingDeleteId(null);
      load();
    } catch (err) {
      setPendingDeleteId(null);
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Xóa thất bại"),
      });
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
        <h3 className="card-title">
          {editing ? "Sửa bảng giá" : "Thêm bảng giá"}
        </h3>
        <form onSubmit={save}>
          <div className="form-inline">
            <div className="form-group">
              <label>Loại phòng</label>
              <select
                value={form.idLoaiPhong}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, idLoaiPhong: e.target.value }))
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
            </div>
            <div className="form-group">
              <label>Tên chính sách</label>
              <input
                value={form.tenChinhSach}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tenChinhSach: e.target.value,
                  }))
                }
                placeholder="VD: Giá lễ 30/4"
                required
              />
            </div>
            <div className="form-group">
              <label>Giá áp dụng (VND/đêm)</label>
              <input
                type="number"
                min={0}
                value={form.giaApDung || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    giaApDung: Number(e.target.value) || 0,
                  }))
                }
                placeholder="Ví dụ: 2500000"
                required
              />
            </div>
            <div className="form-group">
              <label>Ưu tiên</label>
              <input
                type="number"
                value={form.uuTien}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    uuTien: Number(e.target.value) || 0,
                  }))
                }
                placeholder="Số càng lớn càng ưu tiên"
              />
            </div>
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                value={form.ngayBatDau}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ngayBatDau: e.target.value }))
                }
                placeholder="Bắt đầu áp dụng"
                required
              />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                value={form.ngayKetThuc}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ngayKetThuc: e.target.value }))
                }
                placeholder="Kết thúc áp dụng"
                required
              />
            </div>
            <div className="form-group" style={{ flex: "2 1 240px" }}>
              <label>Mô tả</label>
              <input
                value={form.moTa}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, moTa: e.target.value }))
                }
                placeholder="Ghi chú cho lễ tân hoặc quản trị"
              />
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
              onChange={(e) =>
                setForm((prev) => ({ ...prev, kichHoat: e.target.checked }))
              }
            />
            Đang áp dụng
          </label>

          <div className="inline-actions mt-4">
            <button type="submit" className="btn">
              <Save className="btn-ico" aria-hidden />
              Lưu bảng giá
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
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
        <h3 className="card-title">Danh sách bảng giá</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Loại phòng</th>
                <th>Chính sách</th>
                <th>Thời gian</th>
                <th>Giá</th>
                <th>Ưu tiên</th>
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
                    {item.ngayBatDau} → {item.ngayKetThuc}
                  </td>
                  <td>
                    {Number(item.giaApDung).toLocaleString("vi-VN")} VND/đêm
                  </td>
                  <td>{item.uuTien ?? 0}</td>
                  <td>{item.kichHoat ? "Áp dụng" : "Tắt"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: "0.5rem" }}
                      onClick={() => {
                        setEditing(item);
                        setForm({
                          idLoaiPhong: String(item.idLoaiPhong),
                          tenChinhSach: item.tenChinhSach,
                          ngayBatDau: item.ngayBatDau,
                          ngayKetThuc: item.ngayKetThuc,
                          giaApDung: Number(item.giaApDung),
                          uuTien: item.uuTien ?? 0,
                          kichHoat: Boolean(item.kichHoat),
                          moTa: item.moTa || "",
                        });
                      }}
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
                  <td colSpan={7} className="text-muted">
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
      <AlertDialog
        open={notice != null}
        title={notice?.title}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
