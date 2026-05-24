import { useCallback, useEffect, useState } from "react";
import { Banknote, Loader2 } from "lucide-react";
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
  soTienHoanDuKien?: number;
  moTaChinhSach?: string;
  tenKhach?: string;
  ngayNhanPhong?: string;
  ngayTraPhong?: string;
  ghiChuQuanTri?: string;
};

export default function HoanTienLeTan() {
  const { toast } = dungThongBao();
  const [list, setList] = useState<YeuCau[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [soTienThucTe, setSoTienThucTe] = useState<Record<number, string>>({});
  const [ghiChu, setGhiChu] = useState<Record<number, string>>({});

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/yeu-cau-huy/cho-hoan")
      .then((r) => {
        setList(r.data);
        const tien: Record<number, string> = {};
        for (const y of r.data as YeuCau[]) {
          tien[y.id] = String(Math.round(Number(y.soTienHoanDuKien ?? 0)));
        }
        setSoTienThucTe(tien);
      })
      .catch((e) =>
        toast(apiErrorMessage(e, "Không tải được danh sách"), "thatBai"),
      )
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const xacNhanHoan = async (y: YeuCau) => {
    const raw = soTienThucTe[y.id] ?? "0";
    const so = Number(raw.replace(/\s/g, "").replace(/\./g, ""));
    if (!Number.isFinite(so) || so < 0) {
      toast("Số tiền hoàn không hợp lệ.", "thatBai");
      return;
    }
    setBusyId(y.id);
    try {
      await api.post(`/yeu-cau-huy/${y.id}/hoan-tien`, {
        soTienHoanThucTe: so,
        ghiChu: ghiChu[y.id] || undefined,
      });
      toast(
        so > 0
          ? `Đã ghi nhận hoàn ${so.toLocaleString("vi-VN")} VND.`
          : "Đã xác nhận xử lý (không hoàn tiền).",
        "thanhCong",
      );
      load();
    } catch (e) {
      toast(apiErrorMessage(e, "Hoàn tiền thất bại"), "thatBai");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-shell">
      <h1 className="page-title">Hoàn tiền hủy phòng</h1>
      <p className="page-subtitle">
        Các yêu cầu đã được quản trị duyệt — xác nhận số tiền hoàn thực tế sau
        khi chuyển khoản / trả tiền mặt cho khách.
      </p>

      {loading ? (
        <div className="card loading-panel mt-4">
          <div className="loading-panel__spinner" aria-hidden />
          <p style={{ margin: 0 }}>Đang tải…</p>
        </div>
      ) : list.length === 0 ? (
        <div className="card empty-state-card mt-4">
          <p>Không có yêu cầu chờ hoàn tiền.</p>
        </div>
      ) : (
        <div className="card mt-4">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>YC / Đơn</th>
                  <th>Khách</th>
                  <th>Dự kiến</th>
                  <th>Số tiền hoàn thực tế</th>
                  <th>Ghi chú lễ tân</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((y) => (
                  <tr key={y.id}>
                    <td>
                      <div>
                        YC #{y.id} · Đơn #{y.idDatPhong}
                        {y.soPhong ? ` · P.${y.soPhong}` : " · Cả đơn"}
                      </div>
                      <span className={classBadgeYeuCauHuy(y.trangThai)}>
                        {tenTrangThaiYeuCauHuy(y.trangThai)}
                      </span>
                      <div className="text-muted text-sm">
                        {y.ngayNhanPhong && formatNgayVN(y.ngayNhanPhong)} →{" "}
                        {y.ngayTraPhong && formatNgayVN(y.ngayTraPhong)}
                      </div>
                      {y.ghiChuQuanTri && (
                        <div className="text-sm">QT: {y.ghiChuQuanTri}</div>
                      )}
                    </td>
                    <td>{y.tenKhach ?? "—"}</td>
                    <td>
                      <strong>
                        {Number(y.soTienHoanDuKien ?? 0).toLocaleString("vi-VN")}{" "}
                        VND
                      </strong>
                      <div className="text-muted text-sm">
                        {y.moTaChinhSach ?? ""}
                      </div>
                    </td>
                    <td>
                      <input
                        className="input"
                        type="text"
                        inputMode="numeric"
                        value={soTienThucTe[y.id] ?? ""}
                        onChange={(e) =>
                          setSoTienThucTe((prev) => ({
                            ...prev,
                            [y.id]: e.target.value,
                          }))
                        }
                        disabled={busyId === y.id}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        placeholder="VD: CK MB, mã GD…"
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
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={busyId != null}
                        onClick={() => void xacNhanHoan(y)}
                      >
                        {busyId === y.id ? (
                          <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                        ) : (
                          <Banknote className="btn-ico" aria-hidden />
                        )}
                        Xác nhận hoàn
                      </button>
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
