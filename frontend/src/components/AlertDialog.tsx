import { useEffect } from "react";
import { CircleCheck } from "lucide-react";

type AlertDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  okLabel?: string;
  onClose: () => void;
};

export default function AlertDialog({
  open,
  title = "Thông báo",
  message,
  okLabel = "Đóng",
  onClose,
}: AlertDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="card modal-panel"
        style={{ maxWidth: "min(420px, calc(100vw - 2rem))" }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="alert-dialog-title" className="card-title" style={{ marginTop: 0 }}>
          {title}
        </h2>
        <p style={{ margin: "0.75rem 0 1.25rem", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
          {message}
        </p>
        <div className="inline-actions" style={{ justifyContent: "flex-end", marginTop: 0 }}>
          <button type="button" className="btn" onClick={onClose}>
            <CircleCheck className="btn-ico" aria-hidden />
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
