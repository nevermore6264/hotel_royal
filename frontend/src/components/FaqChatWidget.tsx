import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type Role = "user" | "assistant";

type Msg = { role: Role; content: string };

const CHAO =
  "Xin chào — tôi là trợ lý Royal Lotus Đà Nẵng. Bạn muốn biết về giờ nhận/trả phòng, PayOS, tiện ích hay chính sách hủy?";

async function guiTin(noiDung: string, lichSu: Msg[]): Promise<string> {
  const lichSuDto = lichSu.slice(-12).map((m) => ({
    vaiTro: m.role,
    noiDung: m.content,
  }));
  const res = await fetch("/api/tro-giup-faq/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tinNhan: noiDung, lichSu: lichSuDto }),
  });
  let data: { traLoi?: string; loi?: string } = {};
  try {
    data = await res.json();
  } catch {
    void 0;
  }
  if (!res.ok) {
    throw new Error(data.loi || `Lỗi ${res.status}`);
  }
  const traLoi = data.traLoi?.trim();
  if (!traLoi) throw new Error(data.loi || "Không có phản hồi");
  return traLoi;
}

export default function FaqChatWidget() {
  const [mo, setMo] = useState(false);
  const [tinNhap, setTinNhap] = useState("");
  const [tinNhan, setTinNhan] = useState<Msg[]>([
    { role: "assistant", content: CHAO },
  ]);
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const cuoiRef = useRef<HTMLDivElement>(null);

  const cuonXuong = useCallback(() => {
    cuoiRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (mo) cuonXuong();
  }, [mo, tinNhan, cuonXuong]);

  useEffect(() => {
    if (!mo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMo(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mo]);

  const gui = async () => {
    const text = tinNhap.trim();
    if (!text || busy) return;
    setLoi(null);
    const lichSuTruoc = tinNhan.filter(
      (m) => !(m.role === "assistant" && m.content === CHAO),
    );
    const userMsg: Msg = { role: "user", content: text };
    setTinNhan((prev) => [...prev, userMsg]);
    setTinNhap("");
    setBusy(true);
    try {
      const traLoi = await guiTin(text, lichSuTruoc);
      setTinNhan((prev) => [...prev, { role: "assistant", content: traLoi }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không gửi được tin.";
      setLoi(msg);
      setTinNhan((prev) => prev.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="faq-chat-fab"
        aria-expanded={mo}
        aria-controls="faq-chat-panel"
        aria-label={mo ? "Đóng chat hỏi đáp" : "Mở chat hỏi đáp"}
        onClick={() => setMo((v) => !v)}
      >
        {mo ? (
          <X size={22} aria-hidden />
        ) : (
          <MessageCircle size={22} aria-hidden />
        )}
      </button>

      {mo ? (
        <div
          id="faq-chat-panel"
          className="faq-chat-panel card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-chat-title"
        >
          <div className="faq-chat-panel__head">
            <div className="faq-chat-panel__title-wrap">
              <Bot className="faq-chat-panel__ico" size={22} aria-hidden />
              <div>
                <h2 id="faq-chat-title" className="faq-chat-panel__title">
                  Hỏi đáp khách sạn
                </h2>
                <p className="faq-chat-panel__sub">
                  Trả lời theo thông tin Royal Lotus (AI). Không thay cho xác nhận
                  chính thức — cần chi tiết gọi lễ tân.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm faq-chat-panel__close"
              aria-label="Đóng"
              onClick={() => setMo(false)}
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="faq-chat-panel__messages" tabIndex={0}>
            {tinNhan.map((m, i) => (
              <div
                key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
                className={
                  m.role === "user"
                    ? "faq-chat-bubble faq-chat-bubble--user"
                    : "faq-chat-bubble faq-chat-bubble--bot"
                }
              >
                {m.content}
              </div>
            ))}
            {busy ? (
              <div className="faq-chat-bubble faq-chat-bubble--bot faq-chat-bubble--typing">
                Đang trả lời…
              </div>
            ) : null}
            <div ref={cuoiRef} />
          </div>

          {loi ? (
            <p className="faq-chat-panel__error" role="alert">
              {loi}
            </p>
          ) : null}

          <div className="faq-chat-panel__input-row">
            <input
              type="text"
              className="faq-chat-panel__input"
              placeholder="Ví dụ: Giờ trả phòng là mấy giờ?"
              value={tinNhap}
              disabled={busy}
              maxLength={2000}
              onChange={(e) => setTinNhap(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void gui();
                }
              }}
              aria-label="Câu hỏi"
            />
            <button
              type="button"
              className="btn faq-chat-panel__send"
              disabled={busy || !tinNhap.trim()}
              onClick={() => void gui()}
            >
              <Send size={18} aria-hidden />
              Gửi
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
