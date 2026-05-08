import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type KieuThongBao = "thanhCong" | "thatBai" | "thongTin";

type MucThongBao = { id: number; kieu: KieuThongBao; noiDung: string };

type ToastContextValue = {
  toast: (noiDung: string, kieu?: KieuThongBao) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MucThongBao[]>([]);

  const toast = useCallback((noiDung: string, kieu: KieuThongBao = "thongTin") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev, { id, kieu, noiDung }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-host" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.kieu}`} role="status">
            {t.noiDung}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const c = useContext(ToastContext);
  if (!c) throw new Error("useToast cần bọc trong ToastProvider");
  return c;
}
