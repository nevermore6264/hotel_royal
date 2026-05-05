import { useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw, Sparkles } from "lucide-react";
import api from "../../api/client";

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  trangThaiVeSinh: string;
  ghiChuVeSinh?: string;
  idDatPhong?: number;
};

export default function PhongCanDonDep() {
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetStatus] = useState<"SACH">("SACH");
  const [services, setServices] = useState<
    { id: number; ten: string; gia: number }[]
  >([]);
  const [laundryServiceId, setLaundryServiceId] = useState<number | null>(null);
  const [laundryQtyByRoomId, setLaundryQtyByRoomId] = useState<
    Record<number, number>
  >({});

  const load = () => {
    setLoading(true);
    api
      .get("/phong/can-don-ve-sinh")
      .then((r) => setRooms(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const [notesByRoomId, setNotesByRoomId] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    api.get("/dich-vu").then((r) => setServices(r.data));
  }, []);

  useEffect(() => {
    if (!services || services.length === 0) return;
    const laundry =
      services.find((s) => s.ten?.toLowerCase().includes("giặt")) ||
      services[0];
    if (laundry) setLaundryServiceId(laundry.id);
  }, [services]);

  const setNote = (roomId: number, note: string) => {
    setNotesByRoomId((prev) => ({ ...prev, [roomId]: note }));
  };

  const updateCleanliness = async (roomId: number) => {
    const ghiChu = notesByRoomId[roomId] || "";
    await api.patch(`/phong/${roomId}/ve-sinh`, null, {
      params: {
        trangThaiVeSinh: targetStatus,
        ghiChu: ghiChu || undefined,
      },
    });
    load();
  };

  const addLaundry = async (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room?.idDatPhong) return;
    if (!laundryServiceId) return;
    const soLuong = laundryQtyByRoomId[roomId] ?? 1;
    await api.post(`/dich-vu/dat-phong/${room.idDatPhong}/them`, {
      idDichVu: laundryServiceId,
      soLuong,
    });
    load();
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Phòng cần dọn</h1>
      <p className="page-subtitle page-subtitle--tight">
        Cập nhật trạng thái vệ sinh và ghi chú sau khi dọn.
      </p>
      {loading ? (
        <div className="card loading-panel">
          <div className="loading-panel__spinner" aria-hidden />
          <p style={{ margin: 0 }}>Đang tải danh sách phòng…</p>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-title" style={{ marginTop: 0 }}>
            Phòng cần xử lý
          </h3>
          <div className="form-inline" style={{ marginBottom: "1.15rem" }}>
            <div className="form-group">
              <label>Trạng thái sau khi dọn</label>
              <select value={targetStatus} disabled>
                <option value="SACH">Sạch</option>
              </select>
            </div>
          </div>
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Tình trạng</th>
                <th>Ghi chú</th>
                <th>Giặt ủi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.soPhong}</td>
                  <td>{r.trangThaiVeSinh}</td>
                  <td style={{ width: 360 }}>
                    <input
                      value={notesByRoomId[r.id] || ""}
                      onChange={(e) => setNote(r.id, e.target.value)}
                      placeholder="Ví dụ: đã thay ga / giặt đồ / khử mùi..."
                    />
                  </td>
                  <td style={{ minWidth: 210 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        value={laundryQtyByRoomId[r.id] ?? 1}
                        onChange={(e) =>
                          setLaundryQtyByRoomId((prev) => ({
                            ...prev,
                            [r.id]: Number(e.target.value),
                          }))
                        }
                        className="input-compact"
                        style={{ width: 90 }}
                        placeholder="SL"
                        title="Số lượng dịch vụ"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={!r.idDatPhong || !laundryServiceId}
                        onClick={() => addLaundry(r.id)}
                      >
                        <ClipboardCheck className="btn-ico" aria-hidden />
                        Ghi nhận
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => updateCleanliness(r.id)}
                    >
                      <Sparkles className="btn-ico" aria-hidden />
                      Đã dọn xong
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--text-muted)" }}>
                    Không có phòng cần dọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          <div className="mt-4">
            <button type="button" className="btn btn-secondary" onClick={load}>
              <RefreshCw className="btn-ico" aria-hidden />
              Làm mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
