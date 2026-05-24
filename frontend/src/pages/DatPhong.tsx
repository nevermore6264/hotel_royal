import { useState, useEffect, useMemo, useRef } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { dungXacThuc } from "../context/NguCanhXacThuc";
import { dungThongBao } from "../context/NguCanhThongBao";
import api from "../api/client";
import BangDatPhongExcel from "../components/BangDatPhongExcel";

type Phong = {
  id: number;
  soPhong: string;
  tenLoaiPhong: string;
  giaLoaiPhong: number;
  giaChoKyLuuTru?: number;
};

function parseIdPhongTuQuery(searchParams: URLSearchParams): number | null {
  const raw = searchParams.get("idPhong");
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function soDemLuuTru(ngayNhan: string, ngayTra: string): number | null {
  if (!ngayNhan || !ngayTra) return null;
  const a = new Date(`${ngayNhan}T12:00:00`);
  const b = new Date(`${ngayTra}T12:00:00`);
  const ms = b.getTime() - a.getTime();
  const days = Math.round(ms / 86400000);
  return days > 0 ? days : null;
}

function ngayHomNayYyyyMmDd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function congNgay(yyyyMmDd: string, soNgay: number): string {
  const [yy, mm, dd] = yyyyMmDd.split("-").map(Number);
  const x = new Date(yy, mm - 1, dd + soNgay);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatNgayVietNam(yyyyMmDd: string): string {
  if (!yyyyMmDd) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd.trim());
  if (!m) return yyyyMmDd;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

function chuanHoaPhong(p: Phong): Phong {
  return { ...p, id: Number(p.id) };
}

const TY_LE_COC_PAYOS = 30;

export default function DatPhong() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = dungXacThuc();
  const { toast } = dungThongBao();
  const payosHuyToastKey = useRef<string | null>(null);
  const idPhongTuUrl = useMemo(
    () => parseIdPhongTuQuery(searchParams),
    [searchParams],
  );
  const coPhongMacDinhTuUrl = idPhongTuUrl != null;
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [checkIn, setCheckIn] = useState(
    searchParams.get("ngayNhanPhong")?.trim() || "",
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get("ngayTraPhong")?.trim() || "",
  );
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const id = parseIdPhongTuQuery(searchParams);
    return id != null ? [id] : [];
  });
  const [phongXemTruoc, setPhongXemTruoc] = useState<Phong | null>(null);
  const [loading, setLoading] = useState(false);
  const [baoLoi, setBaoLoi] = useState("");
  const [cheDoThanhToan, setCheDoThanhToan] = useState<"TOAN_BO" | "DAT_COC">(
    "TOAN_BO",
  );

  const soDem = soDemLuuTru(checkIn, checkOut);
  const datesOk = !!(checkIn && checkOut && soDem != null);

  const homNayStr = ngayHomNayYyyyMmDd();
  const minNgayTraPhong =
    checkIn && checkIn >= homNayStr
      ? congNgay(checkIn, 1)
      : congNgay(homNayStr, 1);

  useEffect(() => {
    const homNay = ngayHomNayYyyyMmDd();
    let nextIn = checkIn;
    let nextOut = checkOut;
    let dirty = false;
    if (nextIn && nextIn < homNay) {
      nextIn = homNay;
      dirty = true;
    }
    const minOut = nextIn ? congNgay(nextIn, 1) : congNgay(homNay, 1);
    if (nextOut && nextOut < minOut) {
      nextOut = minOut;
      dirty = true;
    }
    if (dirty) {
      if (nextIn !== checkIn) setCheckIn(nextIn);
      if (nextOut !== checkOut) setCheckOut(nextOut);
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    const cancel = searchParams.get("cancel");
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");
    const isPayOsReturn =
      searchParams.has("code") &&
      searchParams.has("id") &&
      (orderCode != null && orderCode !== "");
    if (!isPayOsReturn) return;

    const isCancelled =
      cancel === "true" ||
      (status != null && status.toUpperCase() === "CANCELLED");
    if (!isCancelled) return;

    const dedupeKey = orderCode ?? searchParams.get("id") ?? "once";
    try {
      if (sessionStorage.getItem(`payos-huy-toast-${dedupeKey}`)) return;
    } catch {}
    if (payosHuyToastKey.current === dedupeKey) return;
    payosHuyToastKey.current = dedupeKey;

    try {
      sessionStorage.setItem(`payos-huy-toast-${dedupeKey}`, "1");
    } catch {}

    toast(
      "Bạn đã hủy thanh toán trên PayOS. Đơn vẫn chờ thanh toán — có thể thử lại hoặc hủy đơn trong mục Đơn của tôi.",
      "thongTin",
    );

    const next = new URLSearchParams(searchParams);
    ["code", "id", "cancel", "status", "orderCode"].forEach((k) =>
      next.delete(k),
    );
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    if (!datesOk) return;
    const idStr = idPhongTuUrl != null ? String(idPhongTuUrl) : null;
    const inSync =
      searchParams.get("ngayNhanPhong") === checkIn &&
      searchParams.get("ngayTraPhong") === checkOut &&
      (idStr == null || searchParams.get("idPhong") === idStr);
    if (inSync) return;
    const next = new URLSearchParams(searchParams);
    next.set("ngayNhanPhong", checkIn);
    next.set("ngayTraPhong", checkOut);
    if (idPhongTuUrl != null) next.set("idPhong", String(idPhongTuUrl));
    setSearchParams(next, { replace: true });
  }, [datesOk, checkIn, checkOut, idPhongTuUrl, searchParams, setSearchParams]);

  useEffect(() => {
    const id = parseIdPhongTuQuery(searchParams);
    if (id == null) {
      setPhongXemTruoc(null);
      return;
    }
    let cancelled = false;
    api
      .get<Phong>(`/phong/${id}`)
      .then((r) => {
        if (!cancelled) setPhongXemTruoc(chuanHoaPhong(r.data));
      })
      .catch(() => {
        if (!cancelled) setPhongXemTruoc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    const idUrl = parseIdPhongTuQuery(searchParams);
    if (idUrl != null) {
      setSelectedIds((prev) =>
        prev.includes(idUrl) ? prev : [...prev, idUrl],
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (!checkIn || !checkOut || soDemLuuTru(checkIn, checkOut) == null) {
      setRooms([]);
      return;
    }
    const idUrl = parseIdPhongTuQuery(searchParams);
    setRoomsLoading(true);
    api
      .get("/phong/con-trong", {
        params: { ngayNhanPhong: checkIn, ngayTraPhong: checkOut },
      })
      .then((r) => {
        const list = (r.data as Phong[]).map(chuanHoaPhong);
        setRooms(list);
        setSelectedIds((prev) => {
          const next = new Set<number>();
          for (const pid of prev) {
            const pidN = Number(pid);
            if (list.some((room) => room.id === pidN)) next.add(pidN);
          }
          if (idUrl != null && list.some((room) => room.id === idUrl)) {
            next.add(idUrl);
          }
          return [...next];
        });
      })
      .finally(() => setRoomsLoading(false));
  }, [checkIn, checkOut, searchParams]);

  useEffect(() => {
    if (idPhongTuUrl == null || !datesOk || roomsLoading) return;
    const con = rooms.some((r) => r.id === idPhongTuUrl);
    if (!con) return;
    setSelectedIds((prev) =>
      prev.includes(idPhongTuUrl) ? prev : [...prev, idPhongTuUrl],
    );
  }, [idPhongTuUrl, datesOk, rooms, roomsLoading]);

  const toggleRoom = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectedRooms = rooms.filter((r) => selectedIds.includes(r.id));
  const totalAmount = selectedRooms.reduce(
    (sum, r) => sum + Number(r.giaChoKyLuuTru || r.giaLoaiPhong),
    0,
  );
  const tienCocUocTinh = useMemo(() => {
    if (totalAmount <= 0) return 0;
    return Math.ceil((totalAmount * TY_LE_COC_PAYOS) / 100);
  }, [totalAmount]);
  const tienThuPayOsLanNay = useMemo(() => {
    if (totalAmount <= 0) return 0;
    if (cheDoThanhToan === "DAT_COC") {
      return Math.min(tienCocUocTinh, totalAmount);
    }
    return totalAmount;
  }, [totalAmount, cheDoThanhToan, tienCocUocTinh]);
  const phongMacDinhTrongList = useMemo(() => {
    if (idPhongTuUrl == null) return null;
    return rooms.find((r) => r.id === idPhongTuUrl) ?? null;
  }, [rooms, idPhongTuUrl]);

  const phongKhacDeChon = useMemo(() => {
    if (idPhongTuUrl == null) return rooms;
    return rooms.filter((r) => r.id !== idPhongTuUrl);
  }, [rooms, idPhongTuUrl]);

  const phongDaChonKhongConTrong =
    !!idPhongTuUrl &&
    datesOk &&
    !roomsLoading &&
    rooms.length > 0 &&
    !rooms.some((r) => r.id === idPhongTuUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBaoLoi("");
    if (!user) {
      navigate("/dang-nhap");
      return;
    }
    if (!user.vaiTro?.includes("ROLE_KHACH_HANG")) {
      setBaoLoi("Bạn không có quyền đặt phòng.");
      return;
    }
    if (selectedIds.length === 0 || !checkIn || !checkOut) {
      setBaoLoi("Vui lòng chọn phòng và ngày nhận/trả phòng.");
      return;
    }
    setLoading(true);
    try {
      const meRes = await api.get("/xac-thuc/toi");
      const idKhachHang = meRes.data.idKhachHang as number | undefined;
      if (!idKhachHang) {
        setBaoLoi(
          "Tài khoản chưa có thông tin khách hàng. Vui lòng liên hệ lễ tân.",
        );
        setLoading(false);
        return;
      }
      const phanHoiTaoDon = await api.post("/dat-phong", {
        idKhachHang,
        ngayNhanPhong: checkIn,
        ngayTraPhong: checkOut,
        idPhong: selectedIds,
      });
      const idDatPhong = phanHoiTaoDon.data.id;
      const payRes = await api.post("/thanh-toan/tao-url", {
        idDatPhong,
        urlTroVe: `${window.location.origin}/dat-phong/thanh-cong?idDatPhong=${idDatPhong}`,
        urlHuy: `${window.location.origin}/dat-phong`,
        cheDoThanhToan,
      });
      window.location.href = payRes.data.duongThanhToan;
    } catch (err: unknown) {
      setBaoLoi(
        (err as { response?: { data?: { loi?: string } } })?.response?.data?.loi ||
          "Có lỗi xảy ra",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-shell booking-page">
      <header className="booking-page-header">
        <h1 className="page-title animate-fade-in">Đặt phòng</h1>
        <p className="page-subtitle page-subtitle--tight">
          {coPhongMacDinhTuUrl ? (
            <>
              Bạn đã chọn một phòng từ danh sách — chọn ngày để kiểm tra còn
              trống và xem giá theo kỳ lưu trú, sau đó thanh toán PayOS.{" "}
            </>
          ) : (
            <>
              Chọn ngày nhận — trả, chọn phòng trống và thanh toán qua
              PayOS.{" "}
            </>
          )}
          <Link to="/phong" className="booking-intro-link">
            Xem danh sách phòng
          </Link>
        </p>
      </header>

      {!user && (
        <div className="booking-login-banner" role="status">
          <span className="booking-login-banner__icon" aria-hidden>
            ◎
          </span>
          <div>
            <strong>Cần tài khoản khách</strong>
            <p className="booking-login-banner__text">
              <Link to="/dang-nhap">Đăng nhập</Link> hoặc{" "}
              <Link to="/dang-ky">đăng ký</Link> để hoàn tất đặt phòng và thanh
              toán.
            </p>
          </div>
        </div>
      )}

      {user?.vaiTro?.includes("ROLE_KHACH_HANG") && (
        <BangDatPhongExcel variant="khach" cheDoThanhToanPayOs={cheDoThanhToan} />
      )}

      <form onSubmit={handleSubmit} className="booking-layout">
        <div className="booking-main">
          <section className="card booking-section">
            <h2 className="booking-section__title">
              <span className="booking-step-num">1</span>
              Thời gian lưu trú
            </h2>
            <div className="booking-date-grid">
              <div className="form-group">
                <label>Ngày nhận phòng</label>
                <input
                  type="date"
                  value={checkIn}
                  min={homNayStr}
                  onChange={(e) => {
                    const t = ngayHomNayYyyyMmDd();
                    let v = e.target.value;
                    if (v && v < t) v = t;
                    setCheckIn(v);
                    setCheckOut((o) => {
                      if (!v || !o) return o;
                      const minO = congNgay(v, 1);
                      return o < minO ? minO : o;
                    });
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày trả phòng</label>
                <input
                  type="date"
                  value={checkOut}
                  min={minNgayTraPhong}
                  onChange={(e) => {
                    const v = e.target.value;
                    const minO = minNgayTraPhong;
                    const out = v && v < minO ? minO : v;
                    setCheckOut(out);
                  }}
                  required
                />
              </div>
            </div>
            {soDem != null && (
              <p className="booking-nights-pill">
                <span>{soDem}</span> đêm
              </p>
            )}
            {checkIn && checkOut && soDem === null && (
              <p className="form-error booking-inline-error">
                Ngày trả phòng phải sau ngày nhận phòng.
              </p>
            )}
          </section>

          {datesOk && (
            <section className="card booking-section">
              <h2 className="booking-section__title">
                <span className="booking-step-num">2</span>
                {coPhongMacDinhTuUrl
                  ? "Xác nhận phòng đã chọn"
                  : "Chọn phòng trống"}
              </h2>
              {coPhongMacDinhTuUrl && (
                <p className="booking-preset-lead text-muted text-sm">
                  Phòng bạn đã chọn trên trang &quot;Danh sách phòng&quot; được
                  ưu tiên hiển thị bên dưới. Bạn vẫn có thể thêm phòng khác nếu
                  còn trống cùng kỳ.
                </p>
              )}
              {phongDaChonKhongConTrong && phongXemTruoc && (
                <p className="form-error booking-inline-error" role="alert">
                  Phòng {phongXemTruoc.soPhong} không còn trống trong khoảng
                  ngày này. Đổi ngày hoặc chọn phòng khác trong danh sách.
                </p>
              )}
              {roomsLoading ? (
                <div className="booking-rooms-loading" aria-busy="true">
                  <div className="booking-rooms-loading__spinner" />
                  <span>Đang tải phòng trống…</span>
                </div>
              ) : rooms.length === 0 ? (
                <p className="booking-empty-msg">
                  Không còn phòng trống trong khoảng thời gian này. Thử đổi ngày
                  hoặc{" "}
                  <Link to="/phong" className="booking-intro-link">
                    xem danh sách phòng
                  </Link>
                  .
                </p>
              ) : (
                <>
                  {phongMacDinhTrongList && (
                    <div className="booking-preset-room">
                      <div className="booking-preset-room__head">
                        <span className="booking-preset-room__badge">
                          Phòng bạn đã chọn
                        </span>
                        <Link
                          to="/phong"
                          className="booking-preset-room__change text-sm"
                        >
                          Chọn phòng khác
                        </Link>
                      </div>
                      <div className="booking-preset-room__body">
                        <div>
                          <p className="booking-preset-room__line">
                            <strong>
                              Phòng {phongMacDinhTrongList.soPhong}
                            </strong>
                            <span className="text-muted text-sm">
                              {" "}
                              · {phongMacDinhTrongList.tenLoaiPhong}
                            </span>
                          </p>
                          <p className="booking-preset-room__hint text-muted text-sm">
                            Đã gồm trong đơn; giá theo số đêm bạn chọn ở bước 1.
                          </p>
                        </div>
                        <div className="booking-preset-room__price">
                          <span className="booking-preset-room__amount">
                            {Number(
                              phongMacDinhTrongList.giaChoKyLuuTru ||
                                phongMacDinhTrongList.giaLoaiPhong,
                            ).toLocaleString("vi-VN")}
                          </span>
                          <span className="booking-preset-room__unit">
                            VND / kỳ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {phongKhacDeChon.length > 0 && (
                    <>
                      <h3 className="booking-add-rooms-title">
                        {phongMacDinhTrongList
                          ? "Thêm phòng (tuỳ chọn)"
                          : "Phòng trống"}
                      </h3>
                      <div className="booking-room-grid">
                        {phongKhacDeChon.map((r) => {
                          const price = Number(
                            r.giaChoKyLuuTru || r.giaLoaiPhong,
                          );
                          const checked = selectedIds.includes(r.id);
                          return (
                            <label
                              key={r.id}
                              className={`booking-room-card${checked ? " booking-room-card--selected" : ""}`}
                            >
                              <input
                                type="checkbox"
                                className="booking-room-card__check"
                                checked={checked}
                                onChange={() => toggleRoom(r.id)}
                              />
                              <div className="booking-room-card__body">
                                <span className="booking-room-card__room">
                                  Phòng {r.soPhong}
                                </span>
                                <span className="booking-room-card__type">
                                  {r.tenLoaiPhong}
                                </span>
                              </div>
                              <div className="booking-room-card__price">
                                <span className="booking-room-card__amount">
                                  {price.toLocaleString("vi-VN")}
                                </span>
                                <span className="booking-room-card__unit">
                                  VND / kỳ
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          )}
        </div>

        <aside className="booking-aside">
          <div className="card booking-summary-card">
            <h3 className="booking-summary-card__title">Tóm tắt</h3>
            {phongXemTruoc && !datesOk && (
              <div className="booking-picked-room">
                <p className="booking-picked-room__label">Phòng bạn chọn</p>
                <p className="booking-picked-room__line">
                  <strong>Phòng {phongXemTruoc.soPhong}</strong>
                  <span className="text-muted text-sm">
                    {" "}
                    · {phongXemTruoc.tenLoaiPhong}
                  </span>
                </p>
                <p className="booking-picked-room__hint text-muted text-sm">
                  Chọn ngày nhận và trả ở bước 1 để kiểm tra còn trống và xem
                  giá theo kỳ lưu trú.
                </p>
              </div>
            )}
            {!datesOk ? (
              !phongXemTruoc ? (
                <p className="booking-summary-placeholder">
                  Chọn ngày nhận và trả để xem phòng trống và giá.
                </p>
              ) : null
            ) : (
              <>
                <dl className="booking-summary-dl">
                  <div>
                    <dt>Nhận</dt>
                    <dd>{formatNgayVietNam(checkIn)}</dd>
                  </div>
                  <div>
                    <dt>Trả</dt>
                    <dd>{formatNgayVietNam(checkOut)}</dd>
                  </div>
                  <div>
                    <dt>Số đêm</dt>
                    <dd>{soDem}</dd>
                  </div>
                  <div>
                    <dt>Phòng đặt</dt>
                    <dd>
                      {selectedRooms.length > 0
                        ? selectedRooms
                            .map((r) => `Phòng ${r.soPhong}`)
                            .join(", ")
                        : selectedIds.length > 0
                          ? `${selectedIds.length} phòng`
                          : "—"}
                    </dd>
                  </div>
                </dl>
                {selectedIds.length > 0 && (
                  <div className="booking-summary-total">
                    <span>Tạm tính</span>
                    <strong>
                      {totalAmount.toLocaleString("vi-VN")}{" "}
                      <span className="booking-summary-total__unit">VND</span>
                    </strong>
                  </div>
                )}
                {selectedIds.length > 0 && (
                  <fieldset className="booking-pay-mode">
                    <legend className="booking-pay-mode__legend">
                      Thanh toán PayOS
                    </legend>
                    <label
                      className={
                        cheDoThanhToan === "TOAN_BO"
                          ? "booking-pay-mode__opt booking-pay-mode__opt--on"
                          : "booking-pay-mode__opt"
                      }
                    >
                      <input
                        type="radio"
                        name="cheDoPayOS"
                        checked={cheDoThanhToan === "TOAN_BO"}
                        onChange={() => setCheDoThanhToan("TOAN_BO")}
                      />
                      <span className="booking-pay-mode__opt-body">
                        <span className="booking-pay-mode__opt-title">
                          Thanh toán đủ
                        </span>
                        <span className="booking-pay-mode__amt">
                          {totalAmount.toLocaleString("vi-VN")} VND
                        </span>
                      </span>
                    </label>
                    <label
                      className={
                        cheDoThanhToan === "DAT_COC"
                          ? "booking-pay-mode__opt booking-pay-mode__opt--on"
                          : "booking-pay-mode__opt"
                      }
                    >
                      <input
                        type="radio"
                        name="cheDoPayOS"
                        checked={cheDoThanhToan === "DAT_COC"}
                        onChange={() => setCheDoThanhToan("DAT_COC")}
                      />
                      <span className="booking-pay-mode__opt-body">
                        <span className="booking-pay-mode__opt-title">
                          Đặt cọc ({TY_LE_COC_PAYOS}%)
                        </span>
                        <span className="booking-pay-mode__amt">
                          {tienThuPayOsLanNay.toLocaleString("vi-VN")} VND lần
                          này
                        </span>
                      </span>
                    </label>
                    {cheDoThanhToan === "DAT_COC" &&
                      totalAmount > tienThuPayOsLanNay && (
                        <p className="booking-pay-mode__hint text-muted text-sm">
                          Còn lại{" "}
                          <strong>
                            {(totalAmount - tienThuPayOsLanNay).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            VND
                          </strong>{" "}
                          — thanh toán bổ sung tại khách sạn hoặc qua PayOS (lần
                          sau / lễ tân hỗ trợ tạo link).
                        </p>
                      )}
                  </fieldset>
                )}
              </>
            )}
            {baoLoi && (
              <p className="form-error booking-summary-error">{baoLoi}</p>
            )}
            <button
              type="submit"
              className="btn booking-pay-btn"
              disabled={loading || !datesOk || selectedIds.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                  Đang xử lý…
                </>
              ) : (
                <>
                  <CreditCard className="btn-ico" aria-hidden />
                  {datesOk && selectedIds.length > 0
                    ? `Thanh toán — ${tienThuPayOsLanNay.toLocaleString("vi-VN")} VND`
                    : "Thanh toán PayOS"}
                </>
              )}
            </button>
            <p className="booking-summary-footnote text-muted text-sm">
              Bạn sẽ được chuyển tới cổng thanh toán an toàn. Đăng nhập tài
              khoản khách trước khi bấm nếu chưa đăng nhập.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
