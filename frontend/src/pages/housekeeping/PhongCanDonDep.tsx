import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import api from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../lib/apiError";
import { classBadgeVeSinh, tenTrangThaiVeSinh } from "../../lib/trangThai";

type Phong = {
  id: number;
  soPhong: string;
  trangThai: string;
  trangThaiVeSinh: string;
  ghiChuVeSinh?: string;
};

export default function PhongCanDonDep() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(true);

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
    setNotesByRoomId((prev) => {
      const next = { ...prev };
      for (const r of rooms) {
        if (!(r.id in next) && r.ghiChuVeSinh != null && r.ghiChuVeSinh !== "") {
          next[r.id] = r.ghiChuVeSinh;
        }
      }
      return next;
    });
  }, [rooms]);

  const setNote = (roomId: number, note: string) => {
    setNotesByRoomId((prev) => ({ ...prev, [roomId]: note }));
  };

  const patchVeSinh = async (roomId: number, trangThaiVeSinh: string) => {
    const soPhong =
      rooms.find((x) => x.id === roomId)?.soPhong ?? String(roomId);
    const ghiChu = notesByRoomId[roomId] || "";
    try {
      await api.patch(`/phong/${roomId}/ve-sinh`, null, {
        params: {
          trangThaiVeSinh,
          ghiChu: ghiChu || undefined,
        },
      });
      if (trangThaiVeSinh === "DANG_DON") {
        toast(
          `Phòng ${soPhong}: đã chuyển sang ${tenTrangThaiVeSinh("DANG_DON")}.`,
          "thanhCong",
        );
      } else if (trangThaiVeSinh === "SACH") {
        toast(
          `Phòng ${soPhong}: đã dọn xong — vệ sinh: ${tenTrangThaiVeSinh("SACH")}.`,
          "thanhCong",
        );
      } else {
        toast(`Phòng ${soPhong}: đã cập nhật vệ sinh.`, "thanhCong");
      }
      load();
    } catch (e) {
      toast(
        apiErrorMessage(e, "Không cập nhật được trạng thái vệ sinh."),
        "thatBai",
      );
    }
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Phòng cần dọn</h1>
      <p className="page-subtitle page-subtitle--tight">
        <strong>Bắt đầu dọn</strong> đánh dấu phòng đang được xử lý;{" "}
        <strong>Đã dọn xong</strong> đặt vệ sinh về <strong>Sạch</strong>. Ghi chú
        là tùy chọn.
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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Tình trạng</th>
                  <th>Ghi chú</th>
                  <th style={{ minWidth: "12rem" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td>{r.soPhong}</td>
                    <td>
                      <span className={classBadgeVeSinh(r.trangThaiVeSinh)}>
                        {tenTrangThaiVeSinh(r.trangThaiVeSinh)}
                      </span>
                    </td>
                    <td className="buong-phong-can-don__note-cell">
                      <textarea
                        className="buong-phong-can-don__note"
                        rows={2}
                        value={notesByRoomId[r.id] ?? ""}
                        onChange={(e) => setNote(r.id, e.target.value)}
                        placeholder="Đã thay ga, khử mùi…"
                        aria-label={`Ghi chú sau dọn — phòng ${r.soPhong}`}
                        autoComplete="off"
                      />
                    </td>
                    <td>
                      <div className="buong-phong-can-don__actions">
                        {(r.trangThaiVeSinh === "CAN_DON" ||
                          r.trangThaiVeSinh === "BAN") && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => patchVeSinh(r.id, "DANG_DON")}
                          >
                            Bắt đầu dọn
                          </button>
                        )}
                        {(r.trangThaiVeSinh === "CAN_DON" ||
                          r.trangThaiVeSinh === "BAN" ||
                          r.trangThaiVeSinh === "DANG_DON") && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => patchVeSinh(r.id, "SACH")}
                          >
                            <Sparkles className="btn-ico" aria-hidden />
                            Đã dọn xong
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ color: "var(--text-muted)" }}>
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
