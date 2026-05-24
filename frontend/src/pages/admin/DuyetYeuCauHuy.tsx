import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import api from "../../api/client";
import { dungThongBao } from "../../context/NguCanhThongBao";
import { apiErrorMessage } from "../../lib/apiError";
import { formatNgayVN } from "../../lib/ngayGio";
import {
  classBadgeYeuCauHuy,
  tenTrangThaiYeuCauHuy,
} from "../../lib/trangThai";

type YeuCau = {
  id: number;
  idDatPhong: number;
  idChiTiet?: number;
  soPhong?: string;
  trangThai: string;
  lyDoKhach?: string;
  soGioConLaiLucYeuCau?: number;
  tyLeHoanDuKien?: number;
  soTienHoanDuKien?: number;
  moTaChinhSach?: string;
  tenKhach?: string;
  ngayNhanPhong?: string;
  ngayTraPhong?: string;
  thoiDiemYeuCau?: string;
};

export default function DuyetYeuCauHuy() {
  const { toast } = dungThongBao();
  const [list, setList] = useState<YeuCau[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [ghiChu, setGhiChu] = useState<Record<number, string>>({});

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/yeu-cau-huy/cho-duyet")
      .then((r) => setList(r.data))
      .catch((e) =>
        toast(apiErrorMessage(e, "Không tải được danh sách yêu cầu"), "thatBai"),
      )
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const duyet = async (id: number) => {
    setBusyId(id);
    try {
      await api.post(`/yeu-cau-huy/${id}/duyet`, {
        ghiChu: ghiChu[id] || undefined,
      });
      toast("Đã duyệt yêu cầu hủy. Lễ tân sẽ thực hiện hoàn tiền.", "thanhCong");
      load();
    } catch (e) {
      toast(apiErrorMessage(e, "Duyệt thất bại"), "thatBai");
    } finally {
      setBusyId(null);
    }
  };

  const tuChoi = async (id: number) => {
    setBusyId(id);
    try {
      await api.post(`/yeu-cau-huy/${id}/tu-choi`, {
        ghiChu: ghiChu[id] || undefined,
      });
      toast("Đã từ chối yêu cầu.", "thanhCong");
      load();
    } catch (e) {
      toast(apiErrorMessage(e, "Từ chối thất bại"), "thatBai");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-shell">
      <h1 className="page-title">Duyệt yêu cầu hủy phòng</h1>
      <p className="page-subtitle">
        Khách gửi yêu cầu kèm đánh giá chính sách hoàn tiền. Sau khi duyệt, lễ
        tân thực hiện hoàn tiền tại quầy.
      </p>

      {loading ? (
        <div className="card loading-panel mt-4">
          <div className="loading-panel__spinner" aria-hidden />
          <p style={{ margin: 0 }}>Đang tải…</p>
        </div>
      ) : list.length === 0 ? (
        <div className="card empty-state-card mt-4">
          <p>Không có yêu cầu chờ duyệt.</p>
        </div>
      ) : (
        <div className="card mt-4">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã YC</th>
                  <th>Đơn / phòng</th>
                  <th>Khách</th>
                  <th>Chính sách (lúc gửi)</th>
                  <th>Hoàn dự kiến</th>
                  <th>Ghi chú QT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((y) => (
                  <tr key={y.id}>
                    <td>#{y.id}</td>
                    <td>
                      <div>
                        Đơn #{y.idDatPhong}
                        {y.idChiTiet ? (
                          <span className="text-muted text-sm">
                            {" "}
                            · Phòng {y.soPhong ?? y.idChiTiet}
                          </span>
                        ) : (
                          <span className="text-muted text-sm"> · Cả đơn</span>
                        )}
                      </div>
                      <div className="text-muted text-sm">
                        {y.ngayNhanPhong && formatNgayVN(y.ngayNhanPhong)} →{" "}
                        {y.ngayTraPhong && formatNgayVN(y.ngayTraPhong)}
                      </div>
                      {y.lyDoKhach && (
                        <div className="text-sm" style={{ marginTop: "0.25rem" }}>
                          Lý do: {y.lyDoKhach}
                        </div>
                      )}
                    </td>
                    <td>{y.tenKhach ?? "—"}</td>
                    <td style={{ maxWidth: "16rem" }}>
                      <span className={classBadgeYeuCauHuy(y.trangThai)}>
                        {tenTrangThaiYeuCauHuy(y.trangThai)}
                      </span>
                      <div className="text-sm" style={{ marginTop: "0.35rem" }}>
                        Còn {y.soGioConLaiLucYeuCau ?? "—"} giờ trước nhận phòng
                      </div>
                      <div className="text-muted text-sm">
                        {y.moTaChinhSach ?? "—"}
                      </div>
                    </td>
                    <td>
                      {Number(y.tyLeHoanDuKien ?? 0)}% ·{" "}
                      <strong>
                        {Number(y.soTienHoanDuKien ?? 0).toLocaleString("vi-VN")}{" "}
                        VND
                      </strong>
                    </td>
                    <td>
                      <input
                        className="input"
                        placeholder="Ghi chú (tuỳ chọn)"
                        value={ghiChu[y.id] ?? ""}
                        onChange={(e) =>
                          setGhiChu((prev) => ({
                            ...prev,
                            [y.id]: e.target.value,
                          }))
                        }
                        disabled={busyId === y.id}
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={busyId != null}
                          onClick={() => void duyet(y.id)}
                        >
                          {busyId === y.id ? (
                            <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                          ) : (
                            <Check className="btn-ico" aria-hidden />
                          )}
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={busyId != null}
                          onClick={() => void tuChoi(y.id)}
                        >
                          <X className="btn-ico" aria-hidden />
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
