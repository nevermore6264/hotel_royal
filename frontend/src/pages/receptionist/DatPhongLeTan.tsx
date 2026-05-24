import { useState, useEffect, useRef, useCallback } from "react";
import {
  BadgeCheck,
  Banknote,
  Download,
  ExternalLink,
  Eye,
  FileText,
  KeyRound,
  Loader2,
  LogOut,
  PackagePlus,
  Printer,
  Save,
  UserPlus,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/client";
import TaiLieuHoaDon, {
  type HoaDonDuLieu,
} from "../../components/TaiLieuHoaDon";
import HopThoaiThongBao from "../../components/HopThoaiThongBao";
import ThanhPhanTrang from "../../components/ThanhPhanTrang";
import BangDatPhongExcel from "../../components/BangDatPhongExcel";
import { apiErrorMessage } from "../../lib/apiError";
import { gopSuDungDichVuHienThi } from "../../lib/gopSuDungDichVu";
import { formatNgayVN } from "../../lib/ngayGio";
import {
  digitsOnlyMoney,
  formatVndIntegerForInput,
  parseVndIntegerInput,
} from "../../lib/vndInput";
import {
  classBadgeDatPhong,
  classBadgeThanhToan,
  tenTrangThaiChiTietPhong,
  tenTrangThaiDatPhong,
  tenTrangThaiThanhToan,
} from "../../lib/trangThai";

type DatPhong = {
  id: number;
  tenKhachHang?: string;
  tenKhach?: string;
  sdtKhach?: string;
  emailKhach?: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  trangThai: string;
  tongTien: number;
  tienDichVu?: number;
  suDungDichVu?: {
    id: number;
    idDichVu?: number;
    tenDichVu: string;
    soLuong: number;
    donGia?: number;
    thanhTien?: number;
  }[];
  chiTiet: {
    id: number;
    soPhong: string;
    idPhong: number;
    gia: number;
    trangThai: string;
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

type DichVu = {
  id: number;
  ten: string;
  gia: number;
};

function tongTienDichVuTheoDon(b: DatPhong): number {
  if (b.tienDichVu != null && !Number.isNaN(Number(b.tienDichVu))) {
    return Number(b.tienDichVu);
  }
  return (b.suDungDichVu ?? []).reduce(
    (s, d) => s + Number(d.thanhTien ?? 0),
    0,
  );
}

function soMucDichVuHienThi(b: DatPhong): number {
  return gopSuDungDichVuHienThi(b.suDungDichVu).length;
}

function conPhaiThuSo(b: DatPhong): number {
  return Number(b.thanhToan?.conPhaiThu ?? 0);
}

function conNoTheoHeThong(b: DatPhong): boolean {
  return conPhaiThuSo(b) > 0.5;
}

const TY_LE_COC_PAYOS = 30;

function tienConLaiPayOs(b: DatPhong): number {
  return Number(b.thanhToan?.conPhaiThu ?? 0);
}

function coTheThanhToanPayOsLeTan(b: DatPhong): boolean {
  if (b.trangThai === "DA_HUY") return false;
  return b.thanhToan != null && tienConLaiPayOs(b) > 0.009;
}

function ngayHomNayYyyyMmDd(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daDenNgayNhanPhong(isoNgayNhan?: string): boolean {
  if (!isoNgayNhan) return true;
  return ngayHomNayYyyyMmDd() >= isoNgayNhan.slice(0, 10);
}

function tienThuPayOsLanNay(
  b: DatPhong,
  cheDo: "TOAN_BO" | "DAT_COC",
): number {
  const con = tienConLaiPayOs(b);
  const tong = Number(b.tongTien || 0);
  if (con <= 0) return 0;
  if (cheDo === "DAT_COC") {
    const coc = Math.ceil((tong * TY_LE_COC_PAYOS) / 100);
    return Math.min(coc, con);
  }
  return con;
}

function emptyCounterForm() {
  return {
    customerEmail: "",
    fullName: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    roomTypeId: "" as string,
    selectedRoomId: null as number | null,
  };
}

type CounterForm = ReturnType<typeof emptyCounterForm>;
type CounterErrors = Partial<Record<keyof CounterForm | "dateRange", string>>;

function validateCounterForm(
  form: CounterForm,
  availableRooms: { id: number }[],
): CounterErrors {
  const errors: CounterErrors = {};
  const email = form.customerEmail.trim();
  const fullName = form.fullName.trim();
  const phone = form.phone.trim();
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const rePhone = /^(0|\+84)\d{9,10}$/;

  if (fullName.length < 2) errors.fullName = "Họ tên tối thiểu 2 ký tự.";
  if (!rePhone.test(phone)) errors.phone = "Số điện thoại chưa đúng định dạng.";
  if (!reEmail.test(email)) errors.customerEmail = "Email chưa đúng định dạng.";
  if (!form.checkInDate) errors.checkInDate = "Chọn ngày nhận phòng.";
  if (!form.checkOutDate) errors.checkOutDate = "Chọn ngày trả phòng.";
  if (form.checkInDate && form.checkOutDate && form.checkOutDate <= form.checkInDate) {
    errors.dateRange = "Ngày trả phải sau ngày nhận.";
  }
  if (!form.selectedRoomId) {
    errors.selectedRoomId = "Vui lòng chọn phòng trống.";
  } else if (availableRooms.length > 0 && !availableRooms.some((r) => r.id === form.selectedRoomId)) {
    errors.selectedRoomId = "Phòng đã chọn không còn khả dụng, vui lòng chọn lại.";
  }
  return errors;
}

export default function DatPhongLeTan() {
  const [list, setList] = useState<{
    content: DatPhong[];
    totalPages: number;
  }>({ content: [], totalPages: 0 });
  const [page, setPage] = useState(0);
  const [trangThaiLoc, setTrangThaiLoc] = useState("");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<DichVu[]>([]);
  const [searchQuick, setSearchQuick] = useState("");

  const [invoiceModal, setInvoiceModal] = useState<{
    open: boolean;
    data: HoaDonDuLieu | null;
  }>({
    open: false,
    data: null,
  });
  const invoiceRootRef = useRef<HTMLElement | null>(null);
  const [invoicePdfBusy, setInvoicePdfBusy] = useState(false);
  const [payosModal, setPayosModal] = useState<{
    open: boolean;
    booking: DatPhong | null;
    busy: boolean;
    cheDo: "TOAN_BO" | "DAT_COC";
    forCheckout: boolean;
  }>({
    open: false,
    booking: null,
    busy: false,
    cheDo: "TOAN_BO",
    forCheckout: false,
  });
  const payosModalRef = useRef(payosModal);
  payosModalRef.current = payosModal;
  const [tienMatModal, setTienMatModal] = useState<{
    open: boolean;
    booking: DatPhong | null;
    soTienStr: string;
    ghiChu: string;
    busy: boolean;
  }>({
    open: false,
    booking: null,
    soTienStr: "",
    ghiChu: "",
    busy: false,
  });
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createForm, setCreateForm] = useState(() => emptyCounterForm());
  const [counterErrors, setCounterErrors] = useState<CounterErrors>({});

  const closeCounterModal = () => {
    setCounterModalOpen(false);
    setCreateForm(emptyCounterForm());
    setCounterErrors({});
    setAvailableRooms([]);
  };
  const location = useLocation();
  const navigate = useNavigate();

  const [roomTypes, setRoomTypes] = useState<{ id: number; ten: string }[]>([]);
  const [availableRooms, setAvailableRooms] = useState<
    {
      id: number;
      soPhong: string;
      tenLoaiPhong: string;
      giaLoaiPhong: number;
      giaChoKyLuuTru?: number;
    }[]
  >([]);

  const reload = (overridePage?: number) => {
    setLoading(true);
    const p = overridePage !== undefined ? overridePage : page;
    const params: Record<string, string | number> = { page: p, size: 10 };
    if (qDebounced.trim()) params.q = qDebounced.trim();
    if (trangThaiLoc) params.trangThai = trangThaiLoc;
    if (tuNgay) params.tuNgay = tuNgay;
    if (denNgay) params.denNgay = denNgay;
    api
      .get("/dat-phong", { params })
      .then((r) => setList(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [page, qDebounced, trangThaiLoc, tuNgay, denNgay]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("tuPayOsTraPhong") !== "1") return;

    const idDatPhongRaw = q.get("idDatPhong");
    const code = q.get("code");
    const paymentLinkId = q.get("id");
    const orderCodeRaw = q.get("orderCode");
    const cancel = q.get("cancel");
    const status = q.get("status");

    const stripPayOsReturnParams = (params: URLSearchParams) => {
      params.delete("tuPayOsTraPhong");
      params.delete("idDatPhong");
      params.delete("code");
      params.delete("id");
      params.delete("orderCode");
      params.delete("cancel");
      params.delete("status");
    };

    let cancelled = false;

    void (async () => {
      let noticeTitle = "Quay lại từ PayOS";
      let noticeMessage =
        "Đã làm mới danh sách. Kiểm tra cột Còn lại — nếu về 0, bấm Trả phòng để ghi nhận.";

      const orderCode = orderCodeRaw ? Number.parseInt(orderCodeRaw, 10) : NaN;
      const payosHuy =
        cancel === "true" ||
        (status != null && status.toUpperCase() === "CANCELLED");
      const canDongBo =
        Boolean(idDatPhongRaw) &&
        Boolean(paymentLinkId) &&
        Boolean(orderCodeRaw) &&
        Number.isFinite(orderCode) &&
        orderCode > 0 &&
        code === "00" &&
        !payosHuy;

      if (canDongBo) {
        try {
          const res = await api.post("/thanh-toan/dong-bo-payos", {
            idDatPhong: Number(idDatPhongRaw),
            orderCode,
            paymentLinkId,
          });
          const tt = (res.data as { trangThai?: string })?.trangThai;
          if (tt === "DA_GHI_NHAN") {
            noticeMessage =
              "Đã ghi nhận thanh toán từ PayOS. Kiểm tra cột Còn lại — nếu về 0, có thể bấm Trả phòng.";
          } else if (tt === "CHO_THANH_TOAN") {
            noticeMessage =
              "PayOS chưa trả về số tiền ngay; danh sách đã làm mới — thử lại sau hoặc chờ webhook.";
          } else if (tt === "DA_HUY_TREN_CONG") {
            noticeTitle = "PayOS";
            noticeMessage = "Giao dịch đã hủy trên cổng thanh toán.";
          }
        } catch (e) {
          noticeTitle = "PayOS";
          noticeMessage = apiErrorMessage(
            e,
            "Không đồng bộ được thanh toán. Đã làm mới danh sách — kiểm tra lại hoặc chờ webhook.",
          );
        }
      }

      if (cancelled) return;

      stripPayOsReturnParams(q);
      const search = q.toString();
      navigate(
        { pathname: location.pathname, search: search ? `?${search}` : "" },
        { replace: true },
      );
      reload();
      setNotice({ title: noticeTitle, message: noticeMessage });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- một lần theo URL; reload() dùng filter hiện tại
  }, [location.search, location.pathname, navigate]);

  useEffect(() => {
    setPage(0);
  }, [qDebounced, trangThaiLoc, tuNgay, denNgay]);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(searchQuick.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuick]);

  useEffect(() => {
    if (!invoiceModal.open) return;
    document.body.classList.add("invoice-modal-print-mode");
    return () => document.body.classList.remove("invoice-modal-print-mode");
  }, [invoiceModal.open]);

  const taiPdfTuModal = useCallback(async () => {
    const el = invoiceRootRef.current;
    const id = invoiceModal.data?.id;
    if (!el || id == null) return;
    setInvoicePdfBusy(true);
    el.classList.add("invoice-doc--paper");
    try {
      const mod = await import("html2pdf.js");
      const html2pdf = mod.default;
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: `hoa-don-${id}.pdf`,
          image: { type: "jpeg", quality: 0.92 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            scrollY: 0,
            scrollX: 0,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } catch {
      window.alert(
        "Không tạo được PDF. Thử nút In hoặc mở toàn màn hình để tải PDF.",
      );
    } finally {
      el.classList.remove("invoice-doc--paper");
      setInvoicePdfBusy(false);
    }
  }, [invoiceModal.data?.id]);

  useEffect(() => {
    api.get("/dich-vu").then((r) => setServices(r.data));
  }, []);

  useEffect(() => {
    api.get("/loai-phong").then((r) => setRoomTypes(r.data));
  }, []);

  useEffect(() => {
    const { checkInDate, checkOutDate, roomTypeId } = createForm;
    if (!checkInDate || !checkOutDate) {
      setAvailableRooms([]);
      return;
    }
    api
      .get("/phong/con-trong", {
        params: {
          ngayNhanPhong: checkInDate,
          ngayTraPhong: checkOutDate,
          idLoaiPhong: roomTypeId ? roomTypeId : undefined,
        },
      })
      .then((r) => setAvailableRooms(r.data));
  }, [createForm.checkInDate, createForm.checkOutDate, createForm.roomTypeId]);

  const checkIn = async (id: number) => {
    try {
      await api.post(`/dat-phong/${id}/nhan-phong`);
      setList((prev) => ({
        ...prev,
        content: prev.content.map((b) =>
          b.id === id ? { ...b, trangThai: "DA_NHAN_PHONG" } : b,
        ),
      }));
    } catch (err) {
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Lỗi"),
      });
    }
  };

  const confirmBooking = async (id: number) => {
    await api.post(`/dat-phong/${id}/xac-nhan`);
    reload();
  };

  const issueInvoice = async (id: number) => {
    try {
      const res = await api.get<HoaDonDuLieu>(`/dat-phong/${id}/hoa-don`);
      setInvoiceModal({ open: true, data: res.data });
    } catch (err) {
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Không tải được dữ liệu hóa đơn"),
      });
    }
  };

  const moModalQrPayOs = (b: DatPhong, opts?: { forCheckout?: boolean }) => {
    const forCheckout = opts?.forCheckout === true;
    setPayosModal({
      open: true,
      booking: b,
      busy: false,
      cheDo: "TOAN_BO",
      forCheckout,
    });
  };

  const dongModalQrPayOs = () => {
    setPayosModal({
      open: false,
      booking: null,
      busy: false,
      cheDo: "TOAN_BO",
      forCheckout: false,
    });
  };

  const moTienMat = (b: DatPhong) => {
    const con = tienConLaiPayOs(b);
    setTienMatModal({
      open: true,
      booking: b,
      soTienStr:
        con > 0 ? formatVndIntegerForInput(Math.round(con)) : "",
      ghiChu: "",
      busy: false,
    });
  };

  const dongTienMat = () => {
    setTienMatModal({
      open: false,
      booking: null,
      soTienStr: "",
      ghiChu: "",
      busy: false,
    });
  };

  const guiGhiNhanTienMat = async () => {
    const b = tienMatModal.booking;
    if (!b) return;
    const soTien = parseVndIntegerInput(tienMatModal.soTienStr);
    if (!Number.isFinite(soTien) || soTien <= 0) {
      setNotice({
        title: "Tiền mặt",
        message: "Nhập số tiền hợp lệ (VND, số nguyên).",
      });
      return;
    }
    setTienMatModal((p) => ({ ...p, busy: true }));
    try {
      await api.post("/thanh-toan/tien-mat", {
        idDatPhong: b.id,
        soTien,
        ghiChu: tienMatModal.ghiChu.trim() || undefined,
      });
      dongTienMat();
      reload();
      setNotice({
        title: "Thanh toán tiền mặt",
        message:
          "Số tiền đã được ghi nhận vào đơn. Khi mục «Còn lại» = 0, bạn có thể ghi nhận trả phòng cho khách.",
      });
    } catch (err) {
      setNotice({
        title: "Tiền mặt",
        message: apiErrorMessage(err, "Không ghi nhận được."),
      });
    } finally {
      setTienMatModal((p) => ({ ...p, busy: false }));
    }
  };

  const taoLinkVaChuyenPayOs = async () => {
    const { booking: b, cheDo, forCheckout } = payosModalRef.current;
    if (!b) return;
    const cheDoGui = forCheckout ? "TOAN_BO" : cheDo;
    setPayosModal((p) => ({ ...p, busy: true }));
    try {
      const idDatPhong = b.id;
      const origin = window.location.origin;
      const urlTroVe = forCheckout
        ? `${origin}/le-tan/dat-phong?idDatPhong=${idDatPhong}&tuPayOsTraPhong=1`
        : `${origin}/dat-phong/thanh-cong?idDatPhong=${idDatPhong}`;
      const payRes = await api.post("/thanh-toan/tao-url", {
        idDatPhong,
        urlTroVe,
        urlHuy: `${origin}/le-tan/dat-phong`,
        cheDoThanhToan: cheDoGui,
      });
      const payUrl = payRes.data.duongThanhToan as string;
      window.location.assign(payUrl);
    } catch (err) {
      setPayosModal((p) => ({ ...p, busy: false }));
      setNotice({
        title: "PayOS",
        message: apiErrorMessage(err, "Không tạo được link thanh toán PayOS"),
      });
    }
  };

  const cancelRoom = async (bookingId: number, detailId: number) => {
    try {
      const res = await api.post(
        `/dat-phong/${bookingId}/chi-tiet/${detailId}/huy`,
        {
          lyDo: "Le tan huy mot phong trong booking",
        },
      );
      setList((prev) => ({
        ...prev,
        content: prev.content.map((booking) =>
          booking.id === bookingId ? res.data : booking,
        ),
      }));
    } catch (err) {
      setNotice({
        title: "Lỗi",
        message: apiErrorMessage(err, "Hủy phòng thất bại"),
      });
    }
  };

  const createBookingAtCounter = async () => {
    const errors = validateCounterForm(createForm, availableRooms);
    if (Object.keys(errors).length > 0) {
      setCounterErrors(errors);
      return;
    }
    const email = createForm.customerEmail.trim();

    setCreateBusy(true);
    try {
      const found = await api.get("/khach-hang", { params: { q: email } });
      let idKhachHang: number;
      if (found.data && found.data.length > 0) {
        idKhachHang = found.data[0].id;
      } else {
        const created = await api.post("/khach-hang", {
          hoTen: createForm.fullName,
          soDienThoai: createForm.phone,
          email: createForm.customerEmail,
          soCanCuoc: "",
        });
        idKhachHang = created.data.id;
      }

      const createdBooking = await api.post("/dat-phong", {
        idKhachHang,
        ngayNhanPhong: createForm.checkInDate,
        ngayTraPhong: createForm.checkOutDate,
        idPhong: [createForm.selectedRoomId],
        tenKhach: createForm.fullName,
        sdtKhach: createForm.phone,
        emailKhach: createForm.customerEmail,
      });

      await api.post(`/dat-phong/${createdBooking.data.id}/xac-nhan`);
      closeCounterModal();
      reload();
    } finally {
      setCreateBusy(false);
    }
  };

  const checkOut = async (id: number) => {
    try {
      await api.post(`/dat-phong/${id}/tra-phong`);
      setList((prev) => ({
        ...prev,
        content: prev.content.map((b) =>
          b.id === id ? { ...b, trangThai: "DA_TRA_PHONG" } : b,
        ),
      }));
    } catch (err) {
      setNotice({
        title: "Không thể trả phòng",
        message: apiErrorMessage(err, "Lỗi"),
      });
    }
  };

  const xuLyTraPhong = (b: DatPhong) => {
    if (conNoTheoHeThong(b)) {
      moModalQrPayOs(b, { forCheckout: true });
      return;
    }
    void checkOut(b.id);
  };

  const [themDichVuModal, setThemDichVuModal] = useState<DatPhong | null>(null);
  const [themDichVuForm, setThemDichVuForm] = useState({
    idDichVu: 0,
    soLuong: 1,
  });
  const [themDichVuBusy, setThemDichVuBusy] = useState(false);

  const moThemDichVu = (b: DatPhong) => {
    const idMacDinh = services[0]?.id ?? 0;
    setThemDichVuForm({ idDichVu: idMacDinh, soLuong: 1 });
    setThemDichVuModal(b);
  };

  const dongThemDichVu = () => {
    setThemDichVuModal(null);
  };

  const xacNhanThemDichVu = async () => {
    if (!themDichVuModal || !themDichVuForm.idDichVu) {
      setNotice({
        title: "Thiếu thông tin",
        message: "Chọn dịch vụ cần thêm.",
      });
      return;
    }
    const soLuong = Math.max(1, Math.floor(Number(themDichVuForm.soLuong) || 1));
    setThemDichVuBusy(true);
    try {
      await api.post(`/dich-vu/dat-phong/${themDichVuModal.id}/them`, {
        idDichVu: themDichVuForm.idDichVu,
        soLuong,
      });
      dongThemDichVu();
      reload();
    } catch (err) {
      setNotice({
        title: "Không thêm được dịch vụ",
        message: apiErrorMessage(err, "Lỗi"),
      });
    } finally {
      setThemDichVuBusy(false);
    }
  };

  const [chiTietDichVuDon, setChiTietDichVuDon] = useState<DatPhong | null>(null);

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý đặt phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Xác nhận đơn, nhận — trả phòng, dịch vụ. Dịch vụ đã thêm hiện gọn dưới
        tổng tiền; bấm “Xem chi tiết” để xem bảng đầy đủ hoặc mở Hóa đơn. Nếu
        còn nợ, dùng <strong>Tiền mặt</strong> (nhập số tại quầy) hoặc{" "}
        <strong>PayOS</strong>; khi “Còn lại” = 0 mới ghi nhận trả phòng.
      </p>
      <BangDatPhongExcel
        variant="leTan"
        onSauKhiNhapLeTan={() => {
          setPage(0);
          reload(0);
        }}
      />
      <div className="card mb-section">
        <div
          className="form-row form-row--between"
          style={{
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h3 className="card-title" style={{ marginTop: 0 }}>
              Tìm &amp; lọc đặt phòng
            </h3>
            <p className="text-muted text-sm" style={{ margin: "0.35rem 0 0" }}>
              Lọc theo khách, trạng thái hoặc khoảng ngày nhận phòng.
            </p>
          </div>
          <button
            type="button"
            className="btn letan-counter-cta"
            onClick={() => setCounterModalOpen(true)}
          >
            <UserPlus className="btn-ico" aria-hidden />
            Đặt phòng tại quầy
          </button>
        </div>
        <div className="filter-toolbar">
          <div className="form-group">
            <label>Tìm khách (tên, SĐT, email)</label>
            <input
              value={searchQuick}
              onChange={(e) => setSearchQuick(e.target.value)}
              placeholder="Ví dụ: 09, Nguyễn…"
            />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              value={trangThaiLoc}
              onChange={(e) => setTrangThaiLoc(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="DA_XAC_NHAN">Đã xác nhận</option>
              <option value="DA_NHAN_PHONG">Đã nhận phòng</option>
              <option value="DA_TRA_PHONG">Đã trả phòng</option>
              <option value="DA_HUY">Đã hủy</option>
            </select>
          </div>
          <div className="form-group">
            <label>Từ ngày nhận</label>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Đến ngày nhận</label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="card loading-panel">
          <div className="loading-panel__spinner" aria-hidden />
          <p style={{ margin: 0 }}>Đang tải danh sách đặt phòng…</p>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "0.75rem" }}>
            Danh sách đặt phòng
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Ngày nhận / trả</th>
                  <th>Phòng</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.content.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.tenKhachHang || b.tenKhach || "-"}</td>
                    <td>
                      {formatNgayVN(b.ngayNhanPhong)} →{" "}
                      {formatNgayVN(b.ngayTraPhong)}
                    </td>
                    <td>
                      <div className="letan-booking-rooms">
                        {b.chiTiet?.map((d) => (
                          <div key={d.id} className="letan-booking-room-line">
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
                                  onClick={() => cancelRoom(b.id, d.id)}
                                >
                                  <LogOut className="btn-ico" aria-hidden />
                                  Hủy phòng
                                </button>
                              )}
                          </div>
                        )) || "-"}
                      </div>
                    </td>
                    <td>
                      <span className={classBadgeDatPhong(b.trangThai)}>
                        {tenTrangThaiDatPhong(b.trangThai)}
                      </span>
                    </td>
                    <td>
                      <div>
                        {Number(b.tongTien).toLocaleString("vi-VN")} VND
                      </div>
                      {(b.suDungDichVu?.length ?? 0) > 0 ? (
                        <div className="letan-booking-dv-compact">
                          <p className="letan-booking-dv-compact__sum">
                            {soMucDichVuHienThi(b)} mục ·{" "}
                            {tongTienDichVuTheoDon(b).toLocaleString("vi-VN")}{" "}
                            đ
                          </p>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm letan-booking-dv-compact__btn"
                            onClick={() => setChiTietDichVuDon(b)}
                          >
                            <Eye className="btn-ico" aria-hidden />
                            Xem chi tiết
                          </button>
                        </div>
                      ) : null}
                    </td>
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
                      <div className="letan-booking-actions">
                        <div className="letan-booking-actions__primary">
                          {b.trangThai === "CHO_DUYET" && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => confirmBooking(b.id)}
                            >
                              <BadgeCheck className="btn-ico" aria-hidden />
                              Xác nhận
                            </button>
                          )}
                          {b.trangThai === "DA_XAC_NHAN" && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              disabled={!daDenNgayNhanPhong(b.ngayNhanPhong)}
                              title={
                                !daDenNgayNhanPhong(b.ngayNhanPhong)
                                  ? `Chưa đến ngày nhận phòng (theo đơn: ${formatNgayVN(b.ngayNhanPhong)}).`
                                  : undefined
                              }
                              onClick={() => checkIn(b.id)}
                            >
                              <KeyRound className="btn-ico" aria-hidden />
                              Nhận phòng
                            </button>
                          )}
                          {b.trangThai === "DA_NHAN_PHONG" && (
                            <button
                              type="button"
                              className={
                                "btn btn-sm" +
                                (conNoTheoHeThong(b)
                                  ? " letan-booking-actions__checkout--owes"
                                  : "")
                              }
                              title={
                                conNoTheoHeThong(b)
                                  ? `Còn ${Number(
                                      b.thanhToan?.conPhaiThu ?? 0,
                                    ).toLocaleString(
                                      "vi-VN",
                                    )} VND — bấm để mở PayOS thanh toán nốt`
                                  : "Ghi nhận trả phòng khi đã thu đủ"
                              }
                              onClick={() => xuLyTraPhong(b)}
                            >
                              <LogOut className="btn-ico" aria-hidden />
                              Trả phòng
                            </button>
                          )}
                        </div>
                        {b.trangThai === "DA_NHAN_PHONG" &&
                          conNoTheoHeThong(b) && (
                            <p className="letan-booking-actions__hint">
                              Còn phải thu{" "}
                              <strong>
                                {Number(
                                  b.thanhToan?.conPhaiThu ?? 0,
                                ).toLocaleString("vi-VN")}{" "}
                                VND
                              </strong>
                              . Bấm <strong>Tiền mặt</strong> để nhập thủ công,
                              hoặc <strong>Trả phòng</strong> / PayOS nếu qua
                              ngân hàng; sau đó tải lại danh sách nếu cần.
                            </p>
                          )}
                        {b.trangThai === "DA_NHAN_PHONG" ? (
                          <div className="letan-booking-actions__services">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm letan-booking-actions__them-dv"
                              disabled={services.length === 0}
                              title={
                                services.length === 0
                                  ? "Chưa có dịch vụ trong hệ thống"
                                  : "Chọn dịch vụ và số lượng"
                              }
                              onClick={() => moThemDichVu(b)}
                            >
                              <PackagePlus className="btn-ico" aria-hidden />
                              Thêm dịch vụ
                            </button>
                          </div>
                        ) : null}

                        <div className="letan-booking-actions__secondary">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => void issueInvoice(b.id)}
                          >
                            <FileText className="btn-ico" aria-hidden />
                            Hóa đơn
                          </button>
                          {coTheThanhToanPayOsLeTan(b) ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => moTienMat(b)}
                              >
                                <Banknote className="btn-ico" aria-hidden />
                                Tiền mặt
                              </button>
                              <button
                                type="button"
                                className="btn btn-payos btn-sm"
                                onClick={() => moModalQrPayOs(b)}
                              >
                                <ExternalLink className="btn-ico" aria-hidden />
                                PayOS
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ThanhPhanTrang
            page={page}
            totalPages={list.totalPages}
            onPageChange={setPage}
            className="mt-4"
          />
        </div>
      )}

      {invoiceModal.open && invoiceModal.data != null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="letan-invoice-title"
          onClick={() => setInvoiceModal({ open: false, data: null })}
        >
          <div
            className="card modal-panel invoice-page invoice-modal-panel"
            style={{
              maxWidth: "min(920px, calc(100vw - 2rem))",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="invoice-toolbar no-print"
              style={{
                margin: "0 0 1rem",
                padding: 0,
                background: "transparent",
              }}
            >
              <div
                className="invoice-toolbar__inner"
                style={{ flexWrap: "wrap", gap: "0.5rem" }}
              >
                <h2
                  id="letan-invoice-title"
                  className="card-title"
                  style={{ margin: 0, flex: "1 1 12rem" }}
                >
                  Hóa đơn kỳ lưu trú · Đơn #{invoiceModal.data.id}
                </h2>
                <div
                  className="invoice-toolbar__actions"
                  style={{ flexWrap: "wrap" }}
                >
                  <button
                    type="button"
                    className="btn btn-sm"
                    disabled={invoicePdfBusy}
                    onClick={() => void taiPdfTuModal()}
                  >
                    {invoicePdfBusy ? (
                      <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                    ) : (
                      <Download className="btn-ico" aria-hidden />
                    )}
                    Tải PDF
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const idHoaDon = invoiceModal.data?.id;
                      if (idHoaDon == null) return;
                      window.open(
                        `/le-tan/hoa-don/${idHoaDon}?autoPrint=1`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                  >
                    <Printer className="btn-ico" aria-hidden />
                    In
                  </button>
                  <Link
                    to={`/le-tan/hoa-don/${invoiceModal.data.id}`}
                    className="btn btn-secondary btn-sm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="btn-ico" aria-hidden />
                    Toàn màn hình
                  </Link>
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => setInvoiceModal({ open: false, data: null })}
                  >
                    <X className="btn-ico" aria-hidden />
                    Đóng
                  </button>
                </div>
              </div>
            </div>
            <div
              className="invoice-print-wrap"
              style={{ maxHeight: "min(70vh, 640px)", overflow: "auto" }}
            >
              <TaiLieuHoaDon
                ref={invoiceRootRef}
                dp={invoiceModal.data}
                tagline="Đà Nẵng · Hóa đơn kỳ lưu trú / Phiếu thanh toán"
              />
            </div>
          </div>
        </div>
      ) : null}

      {chiTietDichVuDon != null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="letan-dv-chitiet-title"
          onClick={() => setChiTietDichVuDon(null)}
        >
          <div
            className="card modal-panel counter-booking-modal letan-dv-chitiet-modal"
            style={{
              maxWidth: "min(560px, calc(100vw - 2rem))",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", marginBottom: "1rem" }}
            >
              <div>
                <h2
                  id="letan-dv-chitiet-title"
                  className="card-title"
                  style={{ margin: 0 }}
                >
                  Chi tiết dịch vụ
                </h2>
                <p
                  className="text-muted text-sm"
                  style={{ margin: "0.35rem 0 0" }}
                >
                  Đơn #{chiTietDichVuDon.id}
                  {chiTietDichVuDon.tenKhachHang ||
                  chiTietDichVuDon.tenKhach
                    ? ` · ${chiTietDichVuDon.tenKhachHang ?? chiTietDichVuDon.tenKhach}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setChiTietDichVuDon(null)}
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>
            <div className="letan-dv-chitiet-modal__scroll">
              <table className="letan-dv-chitiet-table">
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th className="letan-dv-chitiet-table__num">SL</th>
                    <th className="letan-dv-chitiet-table__num">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {gopSuDungDichVuHienThi(chiTietDichVuDon.suDungDichVu).map(
                    (d, i) => (
                      <tr
                        key={`${d.idDichVu ?? "t"}-${d.tenDichVu}-${i}`}
                      >
                        <td>{d.tenDichVu}</td>
                        <td className="letan-dv-chitiet-table__num">
                          {d.soLuong}
                        </td>
                        <td className="letan-dv-chitiet-table__num">
                          {d.thanhTien != null
                            ? `${Number(d.thanhTien).toLocaleString("vi-VN")} đ`
                            : "—"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <div className="letan-dv-chitiet-modal__footer">
              <span>Tổng dịch vụ</span>
              <strong>
                {tongTienDichVuTheoDon(chiTietDichVuDon).toLocaleString("vi-VN")}{" "}
                đ
              </strong>
            </div>
          </div>
        </div>
      ) : null}

      {themDichVuModal != null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="letan-them-dich-vu-title"
          onClick={() => !themDichVuBusy && dongThemDichVu()}
        >
          <div
            className="card modal-panel counter-booking-modal"
            style={{ maxWidth: "min(480px, calc(100vw - 2rem))", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", marginBottom: "1rem" }}
            >
              <div>
                <h2
                  id="letan-them-dich-vu-title"
                  className="card-title"
                  style={{ margin: 0 }}
                >
                  Thêm dịch vụ vào đơn
                </h2>
                <p
                  className="text-muted text-sm"
                  style={{ margin: "0.35rem 0 0" }}
                >
                  Đơn #{themDichVuModal.id}
                  {themDichVuModal.tenKhachHang || themDichVuModal.tenKhach
                    ? ` · ${themDichVuModal.tenKhachHang ?? themDichVuModal.tenKhach}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={themDichVuBusy}
                onClick={dongThemDichVu}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
              </button>
            </div>
            {services.length === 0 ? (
              <p className="form-error" role="alert">
                Chưa có dịch vụ nào. Quản trị cần thêm dịch vụ trước.
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="letan-dich-vu-chon">Dịch vụ</label>
                  <select
                    id="letan-dich-vu-chon"
                    value={themDichVuForm.idDichVu || services[0]?.id}
                    disabled={themDichVuBusy}
                    onChange={(e) =>
                      setThemDichVuForm((f) => ({
                        ...f,
                        idDichVu: Number(e.target.value),
                      }))
                    }
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ten} —{" "}
                        {Number(s.gia).toLocaleString("vi-VN")} đ
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="letan-dich-vu-sl">Số lượng</label>
                  <input
                    id="letan-dich-vu-sl"
                    type="number"
                    min={1}
                    disabled={themDichVuBusy}
                    value={themDichVuForm.soLuong}
                    onChange={(e) =>
                      setThemDichVuForm((f) => ({
                        ...f,
                        soLuong: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "flex-end",
                    marginTop: "1.25rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    disabled={themDichVuBusy}
                    onClick={() => void xacNhanThemDichVu()}
                  >
                    {themDichVuBusy ? (
                      <Loader2
                        className="btn-ico btn-ico--spin"
                        aria-hidden
                      />
                    ) : (
                      <Save className="btn-ico" aria-hidden />
                    )}
                    {themDichVuBusy ? "Đang lưu…" : "Lưu"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={themDichVuBusy}
                    onClick={dongThemDichVu}
                  >
                    <X className="btn-ico" aria-hidden />
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {payosModal.open && payosModal.booking != null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="letan-payos-title"
          onClick={() => dongModalQrPayOs()}
        >
          <div
            className="card modal-panel"
            style={{
              maxWidth: "min(440px, calc(100vw - 2rem))",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", marginBottom: "1rem" }}
            >
              <div>
                <h2
                  id="letan-payos-title"
                  className="card-title"
                  style={{ margin: 0 }}
                >
                  {payosModal.forCheckout
                    ? "Thanh toán nốt (trả phòng)"
                    : "Thanh toán PayOS"}
                </h2>
                <p
                  className="text-muted text-sm"
                  style={{ margin: "0.35rem 0 0" }}
                >
                  Đơn #{payosModal.booking.id}
                  {payosModal.booking.tenKhachHang ||
                  payosModal.booking.tenKhach
                    ? ` · ${payosModal.booking.tenKhachHang ?? payosModal.booking.tenKhach}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => dongModalQrPayOs()}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
              </button>
            </div>
            <p className="text-sm" style={{ marginBottom: "1rem" }}>
              Còn phải thu:{" "}
              <strong>
                {tienConLaiPayOs(payosModal.booking).toLocaleString("vi-VN")}{" "}
                VND
              </strong>
            </p>
            {payosModal.forCheckout ? (
              <p
                className="text-muted text-sm"
                style={{ marginBottom: "1rem", lineHeight: 1.45 }}
              >
                Trả phòng chỉ ghi nhận khi đã thu đủ. Nếu khách trả tiền mặt,
                đóng cửa sổ này và bấm <strong>Tiền mặt</strong> trên dòng đơn;
                nếu qua ngân hàng, dùng PayOS rồi làm mới trang.
              </p>
            ) : null}
            {payosModal.forCheckout ? null : (
              <fieldset
                className="booking-pay-mode"
                style={{ marginBottom: "1rem" }}
              >
                <legend className="booking-pay-mode__legend">Hình thức</legend>
                <label
                  className={
                    payosModal.cheDo === "TOAN_BO"
                      ? "booking-pay-mode__opt booking-pay-mode__opt--on"
                      : "booking-pay-mode__opt"
                  }
                >
                  <input
                    type="radio"
                    name="cheDoPayOSLetan"
                    checked={payosModal.cheDo === "TOAN_BO"}
                    onChange={() =>
                      setPayosModal((p) => ({
                        ...p,
                        cheDo: "TOAN_BO",
                      }))
                    }
                  />
                  <span className="booking-pay-mode__opt-body">
                    <span className="booking-pay-mode__opt-title">
                      Thanh toán đủ
                    </span>
                    <span className="booking-pay-mode__amt">
                      {tienThuPayOsLanNay(
                        payosModal.booking,
                        "TOAN_BO",
                      ).toLocaleString("vi-VN")}{" "}
                      VND
                    </span>
                  </span>
                </label>
                <label
                  className={
                    payosModal.cheDo === "DAT_COC"
                      ? "booking-pay-mode__opt booking-pay-mode__opt--on"
                      : "booking-pay-mode__opt"
                  }
                >
                  <input
                    type="radio"
                    name="cheDoPayOSLetan"
                    checked={payosModal.cheDo === "DAT_COC"}
                    onChange={() =>
                      setPayosModal((p) => ({
                        ...p,
                        cheDo: "DAT_COC",
                      }))
                    }
                  />
                  <span className="booking-pay-mode__opt-body">
                    <span className="booking-pay-mode__opt-title">
                      Đặt cọc ({TY_LE_COC_PAYOS}%)
                    </span>
                    <span className="booking-pay-mode__amt">
                      {tienThuPayOsLanNay(
                        payosModal.booking,
                        "DAT_COC",
                      ).toLocaleString("vi-VN")}{" "}
                      VND lần này
                    </span>
                  </span>
                </label>
                {payosModal.cheDo === "DAT_COC" &&
                  tienConLaiPayOs(payosModal.booking) >
                    tienThuPayOsLanNay(payosModal.booking, "DAT_COC") +
                      0.009 && (
                    <p className="booking-pay-mode__hint text-muted text-sm">
                      Còn lại{" "}
                      <strong>
                        {(
                          tienConLaiPayOs(payosModal.booking) -
                          tienThuPayOsLanNay(payosModal.booking, "DAT_COC")
                        ).toLocaleString("vi-VN")}{" "}
                        VND
                      </strong>{" "}
                      — thu bổ sung sau.
                    </p>
                  )}
              </fieldset>
            )}
            <p className="letan-payos-modal-intro">
              Bấm nút bên dưới để mở trang thanh toán PayOS (chuyển hướng trình
              duyệt). Sau khi xong, bạn quay lại theo liên kết trả về của PayOS.
            </p>
            <div className="letan-payos-modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={payosModal.busy}
                onClick={() => void taoLinkVaChuyenPayOs()}
              >
                {payosModal.busy ? (
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                ) : (
                  <ExternalLink className="btn-ico" aria-hidden />
                )}
                Mở PayOS thanh toán
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tienMatModal.open && tienMatModal.booking != null ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="letan-tien-mat-title"
          onClick={() => !tienMatModal.busy && dongTienMat()}
        >
          <div
            className="card modal-panel counter-booking-modal"
            style={{
              maxWidth: "min(420px, calc(100vw - 2rem))",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", marginBottom: "1rem" }}
            >
              <div>
                <h2
                  id="letan-tien-mat-title"
                  className="card-title"
                  style={{ margin: 0 }}
                >
                  Ghi nhận tiền mặt
                </h2>
                <p
                  className="text-muted text-sm"
                  style={{ margin: "0.35rem 0 0" }}
                >
                  Đơn #{tienMatModal.booking.id}
                  {tienMatModal.booking.tenKhachHang ||
                  tienMatModal.booking.tenKhach
                    ? ` · ${tienMatModal.booking.tenKhachHang ?? tienMatModal.booking.tenKhach}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={tienMatModal.busy}
                onClick={() => dongTienMat()}
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>
            <p className="text-sm" style={{ marginBottom: "0.75rem" }}>
              Còn phải thu (tham khảo):{" "}
              <strong>
                {tienConLaiPayOs(tienMatModal.booking).toLocaleString("vi-VN")}{" "}
                VND
              </strong>
            </p>
            <div className="form-group">
              <label htmlFor="letan-tien-mat-so">Số tiền thu (VND)</label>
              <input
                id="letan-tien-mat-so"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={tienMatModal.soTienStr}
                onChange={(e) => {
                  const d = digitsOnlyMoney(e.target.value);
                  setTienMatModal((p) => ({
                    ...p,
                    soTienStr: d
                      ? formatVndIntegerForInput(Number(d))
                      : "",
                  }));
                }}
                placeholder="Ví dụ: 1.500.000"
                disabled={tienMatModal.busy}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="letan-tien-mat-ghichu">Ghi chú (tùy chọn)</label>
              <input
                id="letan-tien-mat-ghichu"
                value={tienMatModal.ghiChu}
                onChange={(e) =>
                  setTienMatModal((p) => ({
                    ...p,
                    ghiChu: e.target.value,
                  }))
                }
                placeholder="Ví dụ: thu tại quầy buổi sáng"
                disabled={tienMatModal.busy}
              />
            </div>
            <p className="text-muted text-sm" style={{ marginTop: "0.75rem" }}>
              Nếu nhập lớn hơn số còn lại, hệ thống chỉ ghi nhận phần còn phải thu.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "1.15rem",
              }}
            >
              <button
                type="button"
                className="btn"
                disabled={tienMatModal.busy}
                onClick={() => void guiGhiNhanTienMat()}
              >
                {tienMatModal.busy ? (
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                ) : (
                  <Save className="btn-ico" aria-hidden />
                )}
                Lưu
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={tienMatModal.busy}
                onClick={() => dongTienMat()}
              >
                <X className="btn-ico" aria-hidden />
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {counterModalOpen ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="counter-booking-title"
          onClick={() => {
            if (!createBusy) closeCounterModal();
          }}
        >
          <div
            className="card modal-panel counter-booking-modal"
            style={{
              maxWidth: "min(640px, calc(100vw - 2rem))",
              width: "100%",
              maxHeight: "min(92vh, 900px)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="form-row form-row--between"
              style={{ alignItems: "flex-start", gap: "1rem", flexShrink: 0 }}
            >
              <div>
                <h2
                  id="counter-booking-title"
                  className="card-title"
                  style={{ margin: 0 }}
                >
                  Đặt phòng tại quầy
                </h2>
                <p
                  className="text-muted text-sm"
                  style={{ margin: "0.35rem 0 0", lineHeight: 1.45 }}
                >
                  Nhập khách, kỳ lưu trú và chọn phòng trống. Đơn được xác nhận
                  ngay sau khi tạo.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={createBusy}
                onClick={closeCounterModal}
                aria-label="Đóng"
              >
                <X className="btn-ico" aria-hidden />
                Đóng
              </button>
            </div>

            <div
              className="counter-form-grid mt-4"
              style={{ overflowY: "auto", flex: 1, minHeight: 0 }}
            >
              {counterErrors.dateRange ? (
                <div className="g12">
                  <p className="counter-form-error">{counterErrors.dateRange}</p>
                </div>
              ) : null}
              <div className="g4">
                <label className="form-group">
                  <span>Họ tên</span>
                  <input
                    className={counterErrors.fullName ? "counter-input counter-input--error" : "counter-input"}
                    value={createForm.fullName}
                    onChange={(e) => {
                      setCreateForm((p) => ({
                        ...p,
                        fullName: e.target.value,
                      }));
                      setCounterErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder="Họ và tên khách"
                    autoComplete="name"
                  />
                  {counterErrors.fullName ? (
                    <small className="counter-field-error">{counterErrors.fullName}</small>
                  ) : null}
                </label>
              </div>
              <div className="g4">
                <label className="form-group">
                  <span>Số điện thoại</span>
                  <input
                    className={counterErrors.phone ? "counter-input counter-input--error" : "counter-input"}
                    value={createForm.phone}
                    onChange={(e) => {
                      setCreateForm((p) => ({ ...p, phone: e.target.value }));
                      setCounterErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="09xx xxx xxx"
                    autoComplete="tel"
                  />
                  {counterErrors.phone ? (
                    <small className="counter-field-error">{counterErrors.phone}</small>
                  ) : null}
                </label>
              </div>
              <div className="g4">
                <label className="form-group">
                  <span>Email</span>
                  <input
                    type="email"
                    className={counterErrors.customerEmail ? "counter-input counter-input--error" : "counter-input"}
                    value={createForm.customerEmail}
                    onChange={(e) => {
                      setCreateForm((p) => ({
                        ...p,
                        customerEmail: e.target.value,
                      }));
                      setCounterErrors((prev) => ({ ...prev, customerEmail: undefined }));
                    }}
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                  {counterErrors.customerEmail ? (
                    <small className="counter-field-error">{counterErrors.customerEmail}</small>
                  ) : null}
                </label>
              </div>

              <div className="g4">
                <label className="form-group">
                  <span>Ngày nhận</span>
                  <input
                    type="date"
                    className={counterErrors.checkInDate ? "counter-input counter-input--error" : "counter-input"}
                    value={createForm.checkInDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      setCreateForm((p) => ({
                        ...p,
                        checkInDate: e.target.value,
                        selectedRoomId: null,
                      }));
                      setCounterErrors((prev) => ({
                        ...prev,
                        checkInDate: undefined,
                        dateRange: undefined,
                        selectedRoomId: undefined,
                      }));
                    }}
                  />
                  {counterErrors.checkInDate ? (
                    <small className="counter-field-error">{counterErrors.checkInDate}</small>
                  ) : null}
                </label>
              </div>
              <div className="g4">
                <label className="form-group">
                  <span>Ngày trả</span>
                  <input
                    type="date"
                    className={counterErrors.checkOutDate ? "counter-input counter-input--error" : "counter-input"}
                    value={createForm.checkOutDate}
                    min={createForm.checkInDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      setCreateForm((p) => ({
                        ...p,
                        checkOutDate: e.target.value,
                        selectedRoomId: null,
                      }));
                      setCounterErrors((prev) => ({
                        ...prev,
                        checkOutDate: undefined,
                        dateRange: undefined,
                        selectedRoomId: undefined,
                      }));
                    }}
                  />
                  {counterErrors.checkOutDate ? (
                    <small className="counter-field-error">{counterErrors.checkOutDate}</small>
                  ) : null}
                </label>
              </div>
              <div className="g4">
                <label className="form-group">
                  <span>Loại phòng</span>
                  <select
                    className={counterErrors.selectedRoomId ? "counter-input counter-input--error" : "counter-input"}
                    value={createForm.roomTypeId}
                    onChange={(e) => {
                      setCreateForm((p) => ({
                        ...p,
                        roomTypeId: e.target.value,
                        selectedRoomId: null,
                      }));
                      setCounterErrors((prev) => ({ ...prev, selectedRoomId: undefined }));
                    }}
                  >
                    <option value="">(Tất cả)</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.ten}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="g12">
                <div
                  className="text-muted text-sm"
                  style={{ marginBottom: "0.5rem" }}
                >
                  {availableRooms.length > 0
                    ? "Chọn một phòng trống:"
                    : "Chọn ngày nhận và trả để xem phòng trống."}
                </div>
                <div
                  className="room-pick-grid"
                  style={{
                    maxHeight: "min(240px, 38vh)",
                    overflowY: "auto",
                    padding: "0.1rem 0.2rem 0.25rem",
                  }}
                >
                  {availableRooms.map((rm) => (
                    <label
                      key={rm.id}
                      className={`room-pick-label${createForm.selectedRoomId === rm.id ? " room-pick-label--on" : ""}`}
                    >
                      <input
                        type="radio"
                        name="counter-room-pick"
                        checked={createForm.selectedRoomId === rm.id}
                        onChange={() => {
                          setCreateForm((p) => ({
                            ...p,
                            selectedRoomId: rm.id,
                          }));
                          setCounterErrors((prev) => ({ ...prev, selectedRoomId: undefined }));
                        }}
                      />
                      <div className="room-pick-card">
                        <div className="room-pick-card__head">
                          <strong>{rm.soPhong}</strong>
                        </div>
                        <div className="room-pick-card__sub">
                          {rm.tenLoaiPhong}
                        </div>
                        <div className="room-pick-card__price">
                          {Number(
                            rm.giaChoKyLuuTru || rm.giaLoaiPhong,
                          ).toLocaleString("vi-VN")}{" "}
                          VND
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {counterErrors.selectedRoomId ? (
                  <small className="counter-field-error">{counterErrors.selectedRoomId}</small>
                ) : null}
              </div>
            </div>

            <div
              className="form-row mt-4 pt-3"
              style={{
                gap: "0.75rem",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                disabled={createBusy}
                onClick={closeCounterModal}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={createBusy}
                onClick={async () => {
                  try {
                    await createBookingAtCounter();
                  } catch (err) {
                    setNotice({
                      title: "Không tạo được đặt phòng",
                      message: apiErrorMessage(err, "Lỗi"),
                    });
                  }
                }}
              >
                {createBusy ? (
                  <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
                ) : (
                  <UserPlus className="btn-ico" aria-hidden />
                )}
                Lưu
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <HopThoaiThongBao
        open={notice != null}
        title={notice?.title}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
