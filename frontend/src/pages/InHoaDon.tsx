import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, FileText, Loader2, Printer } from "lucide-react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import api from "../api/client";
import HoaDonDocument, { type HoaDonDuLieu } from "../components/HoaDonDocument";
import { formatNgayGioVN } from "../lib/ngayGio";

export default function InHoaDon() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [dp, setDp] = useState<HoaDonDuLieu | null>(null);
  const [err, setErr] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const invoiceRootRef = useRef<HTMLElement | null>(null);
  const daTuDongInRef = useRef(false);

  const laLeTan = location.pathname.startsWith("/le-tan/");
  const quayLai = laLeTan
    ? { to: "/le-tan/dat-phong", label: "Đặt phòng & đơn" }
    : { to: "/don-cua-toi", label: "Đơn của tôi" };

  useEffect(() => {
    if (!id) return;
    api
      .get(`/dat-phong/${id}/hoa-don`)
      .then((r) => setDp(r.data))
      .catch(() => setErr("Không xem được hóa đơn."));
  }, [id]);

  useEffect(() => {
    if (searchParams.get("autoPrint") !== "1") return;
    if (!dp || daTuDongInRef.current) return;
    daTuDongInRef.current = true;
    const boHen = window.setTimeout(() => window.print(), 160);
    return () => window.clearTimeout(boHen);
  }, [dp, searchParams]);

  const ngayLapToolbar = useMemo(() => {
    if (!dp?.thoiGianTao) return formatNgayGioVN(new Date().toISOString());
    return formatNgayGioVN(
      typeof dp.thoiGianTao === "string" ? dp.thoiGianTao : String(dp.thoiGianTao),
    );
  }, [dp?.thoiGianTao]);

  const taiPdf = useCallback(async () => {
    const el = invoiceRootRef.current;
    if (!el || !id) return;
    setPdfBusy(true);
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
      window.alert("Không tạo được file PDF. Bạn có thể dùng nút In và chọn «Lưu thành PDF».");
    } finally {
      el.classList.remove("invoice-doc--paper");
      setPdfBusy(false);
    }
  }, [id]);

  if (err) {
    return (
      <div className="container page-shell invoice-page">
        <div className="card invoice-error-card">
          <p className="form-error" role="alert">
            {err}
          </p>
          <Link to={quayLai.to} className="btn mt-4">
            <ArrowLeft className="btn-ico" aria-hidden />
            {quayLai.label}
          </Link>
        </div>
      </div>
    );
  }

  if (!dp) {
    return (
      <div className="container page-shell invoice-page">
        <div className="card invoice-loading-card">
          <div className="invoice-loading-card__spinner" aria-hidden />
          <p className="invoice-loading-card__text">Đang tải hóa đơn…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-shell invoice-page invoice-print-wrap">
      <div className="invoice-toolbar no-print">
        <div className="invoice-toolbar__inner">
          <p className="invoice-toolbar__hint">
            <FileText className="invoice-toolbar__hint-ico" aria-hidden />
            {laLeTan
              ? `Hóa đơn kỳ lưu trú · ngày lập ${ngayLapToolbar}`
              : "Xem trước hóa đơn — in hoặc lưu PDF từ trình duyệt."}
          </p>
          <div className="invoice-toolbar__actions">
            <button
              type="button"
              className="btn"
              disabled={pdfBusy}
              onClick={() => void taiPdf()}
            >
              {pdfBusy ? (
                <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
              ) : (
                <Download className="btn-ico" aria-hidden />
              )}
              Tải PDF
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              <Printer className="btn-ico" aria-hidden />
              In trang
            </button>
            <Link to={quayLai.to} className="btn btn-secondary">
              <ArrowLeft className="btn-ico" aria-hidden />
              {quayLai.label}
            </Link>
          </div>
        </div>
      </div>

      <HoaDonDocument ref={invoiceRootRef} dp={dp} />
    </div>
  );
}
