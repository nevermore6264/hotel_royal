import { ClipboardList, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiErrorMessage } from "../lib/apiError";

type SyncState = "idle" | "syncing" | "done" | "skipped" | "error";

export default function DatPhongThanhCong() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const idDatPhong = params.get("idDatPhong");
  const [syncState, setSyncState] = useState<SyncState>("idle");

  const code = params.get("code");
  const paymentLinkId = params.get("id");
  const orderCodeRaw = params.get("orderCode");
  const cancel = params.get("cancel");
  const status = params.get("status");
  const payosCheDoThu = params.get("payosCheDoThu");

  useEffect(() => {
    if (payosCheDoThu === "1") {
      setSyncState("done");
      return;
    }

    if (!idDatPhong || !paymentLinkId || !orderCodeRaw) {
      setSyncState("skipped");
      return;
    }

    const orderCode = parseInt(orderCodeRaw, 10);
    if (!Number.isFinite(orderCode) || orderCode <= 0) {
      setSyncState("skipped");
      return;
    }

    const cancelled =
      cancel === "true" ||
      (status != null && status.toUpperCase() === "CANCELLED");
    if (cancelled) {
      setSyncState("skipped");
      return;
    }

    if (code !== "00") {
      setSyncState("skipped");
      return;
    }

    if (!user) {
      setSyncState("skipped");
      return;
    }

    let cancelledReq = false;
    setSyncState("syncing");
    api
      .post("/thanh-toan/dong-bo-payos", {
        idDatPhong: Number(idDatPhong),
        orderCode,
        paymentLinkId,
      })
      .then((res) => {
        if (cancelledReq) return;
        setSyncState("done");
        const tt = (res.data as { trangThai?: string })?.trangThai;
        if (tt === "DA_GHI_NHAN") {
          toast("Đã xác nhận thanh toán và cập nhật đơn đặt phòng.", "success");
        } else if (tt === "DA_HUY_TREN_CONG") {
          toast("Giao dịch đã hủy trên PayOS.", "info");
        } else if (tt === "CHO_THANH_TOAN") {
          toast(
            "Thanh toán chưa ghi nhận ngay; vài phút sau kiểm tra lại mục Đơn của tôi.",
            "info",
          );
        } else if (tt === "CHE_DO_THU") {
          toast("Đã ghi nhận (chế độ thử PayOS).", "success");
        }
      })
      .catch((e) => {
        if (cancelledReq) return;
        setSyncState("error");
        toast(
          apiErrorMessage(
            e,
            "Không đồng bộ được trạng thái. Mở Đơn của tôi sau vài phút hoặc liên hệ lễ tân.",
          ),
          "error",
        );
      });
    return () => {
      cancelledReq = true;
    };
  }, [
    user,
    idDatPhong,
    code,
    paymentLinkId,
    orderCodeRaw,
    cancel,
    status,
    payosCheDoThu,
    toast,
  ]);

  return (
    <div className="container page-auth page-success page-shell">
      <div className="card auth-card animate-scale-in">
        <p className="auth-brand">Hoàn tất</p>
        <div className="page-success-icon" aria-hidden>
          ✓
        </div>
        <h1>Đặt phòng thành công</h1>
        {idDatPhong && (
          <p>
            Mã đơn:{" "}
            <strong className="text-accent" style={{ fontSize: "1.1rem" }}>
              #{idDatPhong}
            </strong>
          </p>
        )}
        {syncState === "syncing" && (
          <p className="text-muted" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
            Đang xác nhận thanh toán với PayOS…
          </p>
        )}
        {syncState === "skipped" && !user && idDatPhong && paymentLinkId && orderCodeRaw && (
          <p className="text-muted">
            <Link to="/dang-nhap">Đăng nhập</Link> để hệ thống cập nhật trạng thái thanh toán ngay; nếu đã
            trả tiền, dữ liệu vẫn có thể được cập nhật qua webhook sau vài phút.
          </p>
        )}
        {syncState === "error" && (
          <p className="form-error" role="alert">
            Có lỗi khi đồng bộ PayOS. Bạn vẫn có thể xem đơn bên dưới — trạng thái có thể cập nhật chậm hơn.
          </p>
        )}
        <p className="text-muted">
          Email xác nhận đã được gửi đến hộp thư của bạn (khi hệ thống đã ghi nhận thanh toán).
        </p>
        <Link to="/don-cua-toi" className="btn btn-lg btn-block mt-4">
          <ClipboardList className="btn-ico" aria-hidden />
          Xem đơn của tôi
        </Link>
        <p className="auth-footer" style={{ marginBottom: 0 }}>
          <Link to="/">Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
