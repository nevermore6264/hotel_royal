import { useState, useEffect } from "react";
import api from "../../api/client";
import AlertDialog from "../../components/AlertDialog";
import PaginationBar from "../../components/PaginationBar";
import { apiErrorMessage } from "../../lib/apiError";
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

export default function ReceptionistBookings() {
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
    data: unknown | null;
  }>({
    open: false,
    data: null,
  });
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(
    null,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerEmail: "",
    fullName: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    roomTypeId: "" as string,
    selectedRoomId: null as number | null,
  });
  const [roomTypes, setRoomTypes] = useState<{ id: number; ten: string }[]>(
    [],
  );
  const [availableRooms, setAvailableRooms] = useState<
    {
      id: number;
      soPhong: string;
      tenLoaiPhong: string;
      giaLoaiPhong: number;
      giaChoKyLuuTru?: number;
    }[]
  >([]);

  const reload = () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: 10 };
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
    setPage(0);
  }, [qDebounced, trangThaiLoc, tuNgay, denNgay]);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(searchQuick.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuick]);

  useEffect(() => {
    api.get("/dich-vu").then((r) => setServices(r.data));
  }, []);

  useEffect(() => {
    api.get("/loai-phong").then((r) => setRoomTypes(r.data));
  }, []);

  useEffect(() => {
    const { checkInDate, checkOutDate, roomTypeId } = createForm;
    if (!checkInDate || !checkOutDate) return;
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
    const res = await api.get(`/dat-phong/${id}/hoa-don`);
    setInvoiceModal({ open: true, data: res.data });
  };

  const cancelRoom = async (bookingId: number, detailId: number) => {
    try {
      const res = await api.post(`/dat-phong/${bookingId}/chi-tiet/${detailId}/huy`, {
        lyDo: "Le tan huy mot phong trong booking",
      });
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
    const email = createForm.customerEmail.trim();
    if (!email) throw new Error("Vui lòng nhập email khách.");
    if (!createForm.fullName) throw new Error("Vui lòng nhập họ tên.");
    if (!createForm.phone) throw new Error("Vui lòng nhập số điện thoại.");
    if (!createForm.checkInDate || !createForm.checkOutDate)
      throw new Error("Vui lòng chọn ngày nhận/trả.");
    if (!createForm.selectedRoomId) throw new Error("Vui lòng chọn phòng.");

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
    setCreateOpen(false);
    reload();
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
        title: "Lỗi",
        message: apiErrorMessage(err, "Lỗi"),
      });
    }
  };

  const [serviceIdByBooking, setServiceIdByBooking] = useState<
    Record<number, number>
  >({});
  const [qtyByBooking, setQtyByBooking] = useState<Record<number, number>>({});

  const addService = async (bookingId: number) => {
    const idDichVu = serviceIdByBooking[bookingId];
    const soLuong = qtyByBooking[bookingId] ?? 1;
    if (!idDichVu) return;
    await api.post(`/dich-vu/dat-phong/${bookingId}/them`, {
      idDichVu,
      soLuong,
    });
    reload();
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title">Quản lý đặt phòng</h1>
      <p className="page-subtitle page-subtitle--tight">
        Xác nhận đơn, nhận — trả phòng, dịch vụ và xuất hóa đơn.
      </p>
      <div className="card mb-section">
        <h3 className="card-title" style={{ marginTop: 0 }}>
          Tìm &amp; lọc đặt phòng
        </h3>
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
          <div className="section-divider">
            <div className="form-row form-row--between">
              <div>
                <h2 className="card-title" style={{ marginBottom: "0.35rem" }}>
                  Tạo đặt phòng tại quầy
                </h2>
                <p className="text-muted text-sm" style={{ margin: 0 }}>
                  Nhập thông tin khách và chọn phòng trống để tạo đặt phòng.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCreateOpen((v) => !v)}
              >
                {createOpen ? "Đóng" : "Mở form tạo đặt phòng"}
              </button>
            </div>

            {createOpen && (
              <div className="counter-form-grid">
                <div className="g4">
                  <label className="form-group">
                    <span>Họ tên</span>
                    <input
                      value={createForm.fullName}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      placeholder="Họ và tên khách"
                    />
                  </label>
                </div>
                <div className="g4">
                  <label className="form-group">
                    <span>Số điện thoại</span>
                    <input
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="09xx xxx xxx"
                    />
                  </label>
                </div>
                <div className="g4">
                  <label className="form-group">
                    <span>Email</span>
                    <input
                      value={createForm.customerEmail}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          customerEmail: e.target.value,
                        }))
                      }
                      placeholder="email@example.com"
                    />
                  </label>
                </div>

                <div className="g3">
                  <label className="form-group">
                    <span>Ngày nhận</span>
                    <input
                      type="date"
                      value={createForm.checkInDate}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          checkInDate: e.target.value,
                        }))
                      }
                      placeholder="Ngày nhận phòng"
                    />
                  </label>
                </div>
                <div className="g3">
                  <label className="form-group">
                    <span>Ngày trả</span>
                    <input
                      type="date"
                      value={createForm.checkOutDate}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          checkOutDate: e.target.value,
                        }))
                      }
                      placeholder="Ngày trả phòng"
                    />
                  </label>
                </div>
                <div className="g3">
                  <label className="form-group">
                    <span>Loại phòng</span>
                    <select
                      value={createForm.roomTypeId}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          roomTypeId: e.target.value,
                        }))
                      }
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
                <div
                  className="g3"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        await createBookingAtCounter();
                      } catch (err) {
                        setNotice({
                          title: "Lỗi",
                          message: apiErrorMessage(err, "Lỗi"),
                        });
                      }
                    }}
                  >
                    Tạo đặt phòng
                  </button>
                </div>

                <div className="g12">
                  <div className="text-muted text-sm" style={{ marginBottom: "0.5rem" }}>
                    {availableRooms.length > 0
                      ? "Chọn phòng trống:"
                      : "Chưa có danh sách phòng. Hãy chọn ngày trước."}
                  </div>
                  <div className="form-row" style={{ gap: "0.75rem" }}>
                    {availableRooms.map((rm) => (
                      <label key={rm.id} className="room-pick-label">
                        <input
                          type="radio"
                          name="room"
                          checked={createForm.selectedRoomId === rm.id}
                          onChange={() =>
                            setCreateForm((p) => ({
                              ...p,
                              selectedRoomId: rm.id,
                            }))
                          }
                        />
                        <div>
                          <div style={{ fontWeight: 700 }}>{rm.soPhong}</div>
                          <div className="text-muted text-sm">
                            {rm.tenLoaiPhong}{" "}
                            <span>
                              {Number(
                                rm.giaChoKyLuuTru || rm.giaLoaiPhong,
                              ).toLocaleString("vi-VN")}{" "}
                              VND
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

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
                    {b.ngayNhanPhong} → {b.ngayTraPhong}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      {b.chiTiet?.map((d) => (
                        <div
                          key={d.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            alignItems: "center",
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
                                onClick={() => cancelRoom(b.id, d.id)}
                              >
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
                    {b.trangThai === "CHO_DUYET" && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ marginRight: "0.5rem" }}
                        onClick={() => confirmBooking(b.id)}
                      >
                        Xác nhận
                      </button>
                    )}
                    {b.trangThai === "DA_XAC_NHAN" && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ marginRight: "0.5rem" }}
                        onClick={() => checkIn(b.id)}
                      >
                        Nhận phòng
                      </button>
                    )}
                    {b.trangThai === "DA_NHAN_PHONG" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ marginRight: "0.5rem" }}
                          onClick={() => checkOut(b.id)}
                        >
                          Trả phòng
                        </button>
                        <div className="inline-actions inline-actions--stack">
                          <select
                            className="input-compact"
                            value={
                              serviceIdByBooking[b.id] ?? services[0]?.id ?? ""
                            }
                            onChange={(e) =>
                              setServiceIdByBooking((prev) => ({
                                ...prev,
                                [b.id]: Number(e.target.value),
                              }))
                            }
                          >
                            {services.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.ten}
                              </option>
                            ))}
                          </select>
                          <input
                            className="input-compact"
                            type="number"
                            min={1}
                            value={qtyByBooking[b.id] ?? 1}
                            onChange={(e) =>
                              setQtyByBooking((prev) => ({
                                ...prev,
                                [b.id]: Number(e.target.value),
                              }))
                            }
                            style={{ width: 90 }}
                            placeholder="SL"
                            title="Số lượng"
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => addService(b.id)}
                          >
                            Thêm dịch vụ
                          </button>
                        </div>
                      </>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: "0.5rem", display: "block" }}
                      onClick={() => issueInvoice(b.id)}
                    >
                      Xuất hóa đơn
                    </button>
                  </td>
                </tr>
              ))}
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
      )}

      {invoiceModal.open && invoiceModal.data != null ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setInvoiceModal({ open: false, data: null })}
        >
          <div
            className="card modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="form-row form-row--between" style={{ alignItems: "center" }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                Hóa đơn
              </h2>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setInvoiceModal({ open: false, data: null })}
              >
                Đóng
              </button>
            </div>
            <div className="mt-4">
              <pre>{JSON.stringify(invoiceModal.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={notice != null}
        title={notice?.title}
        message={notice?.message ?? ""}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
