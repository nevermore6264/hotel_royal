import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PropsThanhPhanTrang = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
};

export default function ThanhPhanTrang({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PropsThanhPhanTrang) {
  const tp = Math.max(1, totalPages);
  const [paging, setPaging] = useState(false);
  const resetTimerRef = useRef<number | null>(null);
  const pagingStartedAtRef = useRef<number>(0);
  const MIN_LOADING_MS = 700;

  useEffect(() => {
    if (!paging) return;
    const elapsed = Date.now() - pagingStartedAtRef.current;
    const remain = Math.max(0, MIN_LOADING_MS - elapsed);
    if (resetTimerRef.current != null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    resetTimerRef.current = window.setTimeout(() => {
      setPaging(false);
      resetTimerRef.current = null;
    }, remain);
  }, [page, tp]);

  useEffect(
    () => () => {
      if (resetTimerRef.current != null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  const chuyenTrang = (nextPage: number) => {
    if (paging) return;
    if (nextPage < 0 || nextPage > tp - 1 || nextPage === page) return;
    pagingStartedAtRef.current = Date.now();
    setPaging(true);
    onPageChange(nextPage);
    resetTimerRef.current = window.setTimeout(() => {
      setPaging(false);
      resetTimerRef.current = null;
    }, 1400);
  };

  return (
    <div className={`pagination-bar ${paging ? "pagination-bar--loading" : ""} ${className}`.trim()}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={paging || page <= 0}
        onClick={() => chuyenTrang(page - 1)}
      >
        <ChevronLeft className="btn-ico" aria-hidden />
        Trước
      </button>
      <span className="pagination-bar__label text-muted text-sm">
        {paging ? (
          <>
            <Loader2 className="btn-ico btn-ico--spin" aria-hidden />
            Đang tải trang {page + 1} / {tp}...
          </>
        ) : (
          <>Trang {page + 1} / {tp}</>
        )}
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={paging || page >= tp - 1}
        onClick={() => chuyenTrang(page + 1)}
      >
        Sau
        <ChevronRight className="btn-ico" aria-hidden />
      </button>
    </div>
  );
}
