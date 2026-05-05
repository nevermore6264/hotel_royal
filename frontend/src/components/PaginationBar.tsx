import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
};

/** Thanh Trước / Sau + chỉ số trang (Spring Page: totalPages ≥ 1). */
export default function PaginationBar({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PaginationBarProps) {
  const tp = Math.max(1, totalPages);
  return (
    <div className={`pagination-bar ${className}`.trim()}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="btn-ico" aria-hidden />
        Trước
      </button>
      <span className="pagination-bar__label text-muted text-sm">
        Trang {page + 1} / {tp}
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page >= tp - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Sau
        <ChevronRight className="btn-ico" aria-hidden />
      </button>
    </div>
  );
}
