import { useEffect } from "react";
import { Check, Trash2, X } from "lucide-react";

type PropsHopThoaiXacNhan = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function HopThoaiXacNhan({
  open,
  title = "Xác nhận",
  message,
  confirmLabel = "Đồng ý",
  cancelLabel = "Hủy",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: PropsHopThoaiXacNhan) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, busy]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        className="card modal-panel"
        style={{ maxWidth: "min(420px, calc(100vw - 2rem))" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="card-title" style={{ marginTop: 0 }}>
          {title}
        </h2>
        <p style={{ margin: "0.75rem 0 1.25rem", color: "var(--text-muted)" }}>{message}</p>
        <div className="inline-actions" style={{ justifyContent: "flex-end", marginTop: 0 }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={onCancel}
          >
            <X className="btn-ico" aria-hidden />
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "btn btn-danger" : "btn"}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? (
              "Đang xử lý…"
            ) : danger ? (
              <>
                <Trash2 className="btn-ico" aria-hidden />
                {confirmLabel}
              </>
            ) : (
              <>
                <Check className="btn-ico" aria-hidden />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
