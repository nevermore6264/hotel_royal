import { useState, useEffect, useRef, useCallback } from "react";
import {
  Ban,
  BedDouble,
  CreditCard,
  FileText,
  Loader2,
  LogOut,
  X,
} from "lucide-react";
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
  thoiDiemHetHanThanhToan?: string;
};

const TY_LE_COC_PAYOS = 30;

function formatThoiGianConLai(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h} giờ ${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function GiuChoCountdown({
  thoiDiemHetHan,
  onHetHan,
}: {
  thoiDiemHetHan: string;
  onHetHan?: () => void | Promise<unknown>;
}) {
  const fired = useRef(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    fired.current = false;
    const end = new Date(thoiDiemHetHan).getTime();
    if (Number.isNaN(end)) {
      setLabel(null);
      return;
    }

    const tick = () => {
      const ms = end - Date.now();
      if (ms <= 0) {
        setLabel(
          "Hết hạn giữ chỗ — nếu chưa thanh toán, đơn sẽ được hệ thống hủy tự động.",
        );
        if (!fired.current && onHetHan) {
          fired.current = true;
          window.setTimeout(() => {
            void onHetHan();
          }, 1200);
        }
        return;
      }
      const t = formatThoiGianConLai(ms);
      setLabel(
        `Còn ${t} để thanh toán. Hết hạn, đơn chưa thu tiền sẽ bị hủy tự động.`,
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [thoiDiemHetHan, onHetHan]);

  if (!label) return null;
  return (
    <p
      className="giu-cho-countdown text-sm"
      style={{
        margin: "0.4rem 0 0",
        maxWidth: "22rem",
        lineHeight: 1.35,
        color: "var(--accent, #c9a227)",
      }}
    >
      {label}
    </p>
  );
}

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
  const [pendingCancel, setPendingCancel] = useState<PendingCancel | null>(
    null,
  );
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
    } catch {}
    if (payosHuyToastKey.current === dedupeKey) return;
    payosHuyToastKey.current = dedupeKey;

    try {
      sessionStorage.setItem(`payos-huy-toast-don-${dedupeKey}`, "1");
    } catch {}

    toast(
      "Bạn đã hủy thanh toán trên PayOS. Đơn vẫn giữ nguyên — có thể thử thanh toán lại.",
      "thongTin",
    );

    const next = new URLSearchParams(searchParams);
    ["code", "id", "cancel", "status", "orderCode"].forEach((k) =>
      next.delete(k),
    );
    setSearchParams(next, { replace: true });
    void refreshList();
  }, [searchParams, setSearchParams, toast, refreshList]);

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
        toast("Đã hủy đơn đặt phòng.", "thanhCong");
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
        toast("Đã hủy phòng trong đơn.", "thanhCong");
      }
      setPendingCancel(null);
    } catch (e) {
      toast(apiErrorMessage(e, "Thao tác thất bại"), "thatBai");
    } finally {
      setCancelBusy(false);
    }
  };

  const chayThanhToanPayOs = async () => {
    if (!payTarget) return;
    setPayBusy(true);
    try {
      const idDatPhong = payTarget.id;
      const payRes = await api.post("/thanh-toan/tao-url", {
        idDatPhong,
        urlTroVe: `${window.location.origin}/dat-phong/thanh-cong?idDatPhong=${idDatPhong}`,
        urlHuy: `${window.location.origin}/don-cua-toi`,
        cheDoThanhToan: payCheDo,
      });
      window.location.href = payRes.data.duongThanhToan as string;
    } catch (e) {
      toast(
        apiErrorMessage(e, "Không tạo được link thanh toán PayOS"),
        "thatBai",
      );
      setPayBusy(false);
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
        Theo dõi trạng thái, thanh toán phần còn lại qua PayOS.
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
                      {formatNgayVN(b.ngayNhanPhong)} →{" "}
                      {formatNgayVN(b.ngayTraPhong)}
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 0,
                        }}
                      >
                        <span className={classBadgeDatPhong(b.trangThai)}>
                          {tenTrangThaiDatPhong(b.trangThai)}
                        </span>
                        {b.trangThai === "CHO_DUYET" &&
                          b.thoiDiemHetHanThanhToan && (
                            <GiuChoCountdown
                              thoiDiemHetHan={b.thoiDiemHetHanThanhToan}
                              onHetHan={refreshList}
                            />
                          )}
                      </div>
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
                        {coTheThanhToanPayOs(b) && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              setPayTarget(b);
                              setPayCheDo("TOAN_BO");
                            }}
                          >
                            <CreditCard className="btn-ico" aria-hidden />
                            Thanh toán PayOS
                          </button>
                        )}
                        {(b.trangThai === "CHO_DUYET" ||
                          b.trangThai === "DA_XAC_NHAN") && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              setPendingCancel({
                                kind: "whole",
                                bookingId: b.id,
                              })
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

      {payTarget != null ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!payBusy) setPayTarget(null);
          }}
        >
          <div
            className="card modal-panel"
            style={{
              maxWidth: "min(480px, calc(100vw - 2rem))",
              width: "100%",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="don-payos-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem" }}
            >
              <h2
                id="don-payos-title"
                className="card-title"
                style={{ margin: 0 }}
              >
                Thanh toán PayOS · Đơn #{payTarget.id}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={payBusy}
                onClick={() => setPayTarget(null)}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>
            <p className="text-muted text-sm mt-3" style={{ marginBottom: 0 }}>
              Còn phải thu:{" "}
              <strong>
                {tienConLai(payTarget).toLocaleString("vi-VN")} VND
              </strong>
            </p>
            <fieldset
              className="booking-pay-mode mt-3"
              style={{ marginBottom: 0 }}
            >
              <legend className="booking-pay-mode__legend">
                Chọn số tiền lần này
              </legend>
              <label
                className={
                  payCheDo === "TOAN_BO"
                    ? "booking-pay-mode__opt booking-pay-mode__opt--on"
                    : "booking-pay-mode__opt"
                }
              >
                <input
                  type="radio"
                  name="cheDoPayOsDon"
                  checked={payCheDo === "TOAN_BO"}
                  disabled={payBusy}
                  onChange={() => setPayCheDo("TOAN_BO")}
                />
                <span className="booking-pay-mode__opt-body">
                  <span className="booking-pay-mode__opt-title">
                    Thanh toán đủ phần còn lại
                  </span>
                  <span className="booking-pay-mode__amt">
                    {tienThuPayOsLanNay(payTarget, "TOAN_BO").toLocaleString(
                      "vi-VN",
                    )}{" "}
                    VND
                  </span>
                </span>
              </label>
              <label
                className={
                  payCheDo === "DAT_COC"
                    ? "booking-pay-mode__opt booking-pay-mode__opt--on"
                    : "booking-pay-mode__opt"
                }
              >
                <input
                  type="radio"
                  name="cheDoPayOsDon"
                  checked={payCheDo === "DAT_COC"}
                  disabled={payBusy}
                  onChange={() => setPayCheDo("DAT_COC")}
                />
                <span className="booking-pay-mode__opt-body">
                  <span className="booking-pay-mode__opt-title">
                    Đặt cọc ({TY_LE_COC_PAYOS}% trên tổng đơn, tối đa bằng phần
                    còn lại)
                  </span>
                  <span className="booking-pay-mode__amt">
                    {tienThuPayOsLanNay(payTarget, "DAT_COC").toLocaleString(
                      "vi-VN",
                    )}{" "}
                    VND lần này
                  </span>
                </span>
              </label>
            </fieldset>
            <div
              className="form-row mt-4"
              style={{
                gap: "0.5rem",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                disabled={payBusy}
                onClick={() => setPayTarget(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn"
                disabled={payBusy}
                onClick={() => void chayThanhToanPayOs()}
              >
                {payBusy ? (
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                ) : (
                  <CreditCard className="btn-ico" aria-hidden />
                )}
                Chuyển tới PayOS
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
