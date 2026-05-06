import { useState, useEffect, useRef, useCallback } from "react";
import { Ban, BedDouble, CreditCard, FileText, Loader2, LogOut, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { apiErrorMessage } from "../lib/apiError";
import { formatNgayVN } from "../lib/ngayGio";
import {
  classBadgeDatPhong,
  classBadgeThanhToan,
  tenTrangThaiChiTietPhong,
  tenTrangThaiDatPhong,
  tenTrangThaiThanhToan,
} from "../lib/trangThai";

type PendingCancel =
  | { kind: "whole"; bookingId: number }
  | { kind: "room"; bookingId: number; detailId: number };

type DatPhong = {
  id: number;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  tongTien: number;
  tienPhong?: number;
  tienDichVu?: number;
  tienHoan?: number;
  chiTiet: {
    id: number;
    soPhong: string;
    trangThai: string;
    gia: number;
    soTienHoan?: number;
  }[];
  thanhToan?: {
    tongPhaiThu: number;
    tongDaThu: number;
    tongHoan: number;
    conPhaiThu: number;
    trangThai: string;
    giaoDich: {
      id: number;
      loaiGiaoDich: string;
      soTien: number;
      thoiDiemGiaoDich: string;
    }[];
  };
};

/** Khớp backend `payment.payos.ty-le-coc-phan-tram` (mặc định 30). */
const TY_LE_COC_PAYOS = 30;

function tienConLai(b: DatPhong): number {
  return Number(b.thanhToan?.conPhaiThu ?? 0);
}

function coTheThanhToanPayOs(b: DatPhong): boolean {
  if (b.trangThai === "DA_HUY") return false;
  return b.thanhToan != null && tienConLai(b) > 0.009;
}

function tienThuPayOsLanNay(b: DatPhong, cheDo: "TOAN_BO" | "DAT_COC"): number {
  const con = tienConLai(b);
  const tong = Number(b.tongTien || 0);
  if (con <= 0) return 0;
  if (cheDo === "DAT_COC") {
    const coc = Math.ceil((tong * TY_LE_COC_PAYOS) / 100);
    return Math.min(coc, con);
  }
  return con;
}

export default function DonCuaToi() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const payosHuyToastKey = useRef<string | null>(null);
  const [list, setList] = useState<DatPhong[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCancel, setPendingCancel] = useState<PendingCancel | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [payTarget, setPayTarget] = useState<DatPhong | null>(null);
  const [payCheDo, setPayCheDo] = useState<"TOAN_BO" | "DAT_COC">("TOAN_BO");
  const [payBusy, setPayBusy] = useState(false);

  const refreshList = useCallback(
    () =>
      api.get("/dat-phong/cua-toi").then((r) => {
        setList(r.data);
        return r;
      }),
    [],
  );

  useEffect(() => {
    refreshList().finally(() => setLoading(false));
  }, [refreshList]);

  /** PayOS redirect về /don-cua-toi khi hủy cổng thanh toán. */
  useEffect(() => {
    const cancel = searchParams.get("cancel");
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");
    const isPayOsReturn =
      searchParams.has("code") &&
      searchParams.has("id") &&
      orderCode != null &&
      orderCode !== "";
    if (!isPayOsReturn) return;

    const isCancelled =
      cancel === "true" ||
      (status != null && status.toUpperCase() === "CANCELLED");
    if (!isCancelled) return;

    const dedupeKey = orderCode ?? searchParams.get("id") ?? "once";
    try {
      if (sessionStorage.getItem(`payos-huy-toast-don-${dedupeKey}`)) return;
    } catch {
      /* ignore */
    }
    if (payosHuyToastKey.current === dedupeKey) return;
    payosHuyToastKey.current = dedupeKey;

    try {
      sessionStorage.setItem(`payos-huy-toast-don-${dedupeKey}`, "1");
    } catch {
      /* ignore */
    }

    toast(
      "Bạn đã hủy thanh toán trên PayOS. Đơn vẫn giữ nguyên — có thể thử thanh toán lại.",
      "info",
    );

    const next = new URLSearchParams(searchParams);
    ["code", "id", "cancel", "status", "orderCode"].forEach((k) =>
      next.delete(k),
    );
    setSearchParams(next, { replace: true });
    void refreshList();
  }, [searchParams, setSearchParams, toast, refreshList]);

  /** Sau khi quay lại từ PayOS / tab khác, làm mới danh sách để thấy trạng thái thanh toán mới. */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      refreshList().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshList]);

  const runPendingCancel = async () => {
    if (!pendingCancel) return;
    setCancelBusy(true);
    try {
      if (pendingCancel.kind === "whole") {
        await api.post(`/dat-phong/${pendingCancel.bookingId}/huy`);
        await refreshList();
        toast("Đã hủy đơn đặt phòng.", "success");
      } else {
        const res = await api.post(
          `/dat-phong/${pendingCancel.bookingId}/chi-tiet/${pendingCancel.detailId}/huy`,
          { lyDo: "Khach huy mot phong trong don" },
        );
        setList((prev) =>
          prev.map((item) =>
            item.id === pendingCancel.bookingId ? res.data : item,
          ),
        );
        toast("Đã hủy phòng trong đơn.", "success");
      }
      setPendingCancel(null);
    } catch (e) {
      toast(apiErrorMessage(e, "Thao tác thất bại"), "error");
    } finally {
      setCancelBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-shell">
        <div className="card loading-panel">
          <div className="loading-panel__spinner" aria-hidden />
          <p style={{ margin: 0 }}>Đang tải đơn đặt phòng…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-shell">
      <h1 className="page-title">Đơn đặt phòng của tôi</h1>
      <p className="page-subtitle">
        Theo dõi trạng thái và hủy đơn khi còn trong hạn.
      </p>

      {list.length === 0 ? (
        <div className="card empty-state-card mt-4">
          <div className="empty-state-card__icon" aria-hidden>
            ≡
          </div>
          <p>
            Chưa có đơn nào. Khám phá phòng trống và đặt ngay khi bạn sẵn sàng.
          </p>
          <Link to="/phong" className="btn mt-4">
            <BedDouble className="btn-ico" aria-hidden />
            Xem danh sách phòng
          </Link>
        </div>
      ) : (
        <div className="card mt-4">
          <h3 className="card-title" style={{ marginTop: 0 }}>
            Lịch sử đơn
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Ngày nhận / trả</th>
                  <th>Phòng</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>
                      {formatNgayVN(b.ngayNhanPhong)} → {formatNgayVN(b.ngayTraPhong)}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.45rem",
                        }}
                      >
                        {b.chiTiet?.map((d) => (
                          <div
                            key={d.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                            }}
                          >
                            <span>
                              {d.soPhong}{" "}
                              <span className="text-muted text-sm">
                                ({tenTrangThaiChiTietPhong(d.trangThai)})
                              </span>
                            </span>
                            {(b.trangThai === "CHO_DUYET" ||
                              b.trangThai === "DA_XAC_NHAN") &&
                              d.trangThai !== "DA_HUY" && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    setPendingCancel({
                                      kind: "room",
                                      bookingId: b.id,
                                      detailId: d.id,
                                    })
                                  }
                                >
                                  <LogOut className="btn-ico" aria-hidden />
                                  Hủy phòng
                                </button>
                              )}
                          </div>
                        )) || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={classBadgeDatPhong(b.trangThai)}>
                        {tenTrangThaiDatPhong(b.trangThai)}
                      </span>
                    </td>
                    <td>{Number(b.tongTien).toLocaleString("vi-VN")} VND</td>
                    <td>
                      {b.thanhToan ? (
                        <div>
                          <div className="text-sm">
                            <span
                              className={classBadgeThanhToan(
                                b.thanhToan.trangThai,
                              )}
                            >
                              {tenTrangThaiThanhToan(b.thanhToan.trangThai)}
                            </span>
                          </div>
                          <div className="text-muted text-sm">
                            Đã thu:{" "}
                            {Number(b.thanhToan.tongDaThu || 0).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            VND
                          </div>
                          <div className="text-muted text-sm">
                            Còn lại:{" "}
                            {Number(b.thanhToan.conPhaiThu || 0).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            VND
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.35rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <Link
                          to={`/hoa-don/${b.id}`}
                          className="btn btn-secondary btn-sm"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText className="btn-ico" aria-hidden />
                          Hóa đơn
                        </Link>
                        {(b.trangThai === "CHO_DUYET" ||
                          b.trangThai === "DA_XAC_NHAN") && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              setPendingCancel({ kind: "whole", bookingId: b.id })
                            }
                          >
                            <Ban className="btn-ico" aria-hidden />
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingCancel != null}
        title={
          pendingCancel?.kind === "whole"
            ? "Hủy đơn đặt phòng"
            : "Hủy phòng trong đơn"
        }
        message={
          pendingCancel?.kind === "whole"
            ? "Bạn có chắc muốn hủy toàn bộ đơn này?"
            : "Bạn có chắc muốn hủy phòng này trong đơn? Các phòng khác (nếu có) vẫn giữ nguyên."
        }
        confirmLabel="Xác nhận hủy"
        cancelLabel="Đóng"
        danger
        busy={cancelBusy}
        onCancel={() => {
          if (!cancelBusy) setPendingCancel(null);
        }}
        onConfirm={runPendingCancel}
      />
    </div>
  );
}
