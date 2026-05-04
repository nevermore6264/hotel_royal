import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

type TinNhan = {
  id: number;
  idNguoiGui: number;
  tenHienThiNguoiGui: string;
  noiDung: string;
  kieuTin?: string;
  thoiDiem: string;
};

type NguoiHoTro = {
  id: number;
  hoTen: string;
  tenDangNhap: string;
  loaiVaiTro: string;
};

type CuocTomTat = {
  id: number;
  idNguoiDungKhach: number;
  tenDangNhapKhach: string;
  hoTenKhach?: string | null;
  idNguoiHoTro?: number | null;
  tenNguoiHoTro?: string | null;
  thoiDiemCapNhat: string;
};

const KIEU_ANH = "ANH";
const MAX_IMG_BYTES = 4 * 1024 * 1024;

const EMOJI_QUICK = [
  "😀",
  "😊",
  "👍",
  "❤️",
  "😍",
  "🙏",
  "👋",
  "✨",
  "🏨",
  "🛎️",
  "📅",
  "🛏️",
  "☕",
  "✅",
  "❓",
  "⭐",
  "🌙",
  "💬",
  "🙌",
  "😅",
];

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function BadgeHoTen({ ten }: { ten: string }) {
  const ch = ten.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="messenger-avatar" aria-hidden>
      {ch}
    </span>
  );
}

function MessengerBubbleBody({ m }: { m: TinNhan }) {
  if (m.kieuTin === KIEU_ANH) {
    return (
      <a
        href={m.noiDung}
        target="_blank"
        rel="noopener noreferrer"
        className="messenger-bubble__img-link"
      >
        <img
          src={m.noiDung}
          alt="Ảnh đính kèm"
          className="messenger-bubble__img"
          loading="lazy"
        />
      </a>
    );
  }
  return <p className="messenger-bubble__text">{m.noiDung}</p>;
}

function MessengerComposer({
  draft,
  setDraft,
  onKeyDown,
  onSendImage,
  uploading,
  placeholder,
  ariaLabel,
}: {
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSendImage: (file: File) => Promise<void>;
  uploading: boolean;
  placeholder: string;
  ariaLabel: string;
}) {
  const { toast } = useToast();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (ev: MouseEvent) => {
      const t = ev.target as Node;
      if (
        t instanceof HTMLElement &&
        t.closest(".messenger-emoji-anchor")
      ) {
        return;
      }
      setEmojiOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [emojiOpen]);

  const insertEmoji = (emoji: string) => {
    const el = taRef.current;
    if (!el) {
      setDraft((d) => d + emoji);
      return;
    }
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast("Chỉ gửi được file ảnh.", "error");
      return;
    }
    if (f.size > MAX_IMG_BYTES) {
      toast("Ảnh tối đa 4 MB.", "error");
      return;
    }
    try {
      await onSendImage(f);
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Không gửi được ảnh.",
        "error",
      );
    }
  };

  return (
    <div className="messenger-composer">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void onPickFile(e)}
      />
      <div className="messenger-composer__toolbar">
        <span className="messenger-emoji-anchor">
          <button
            type="button"
            className={`messenger-tool-btn${emojiOpen ? " messenger-tool-btn--on" : ""}`}
            title="Emoji"
            aria-expanded={emojiOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEmojiOpen((v) => !v);
            }}
          >
            😊
          </button>
          {emojiOpen && (
            <div className="messenger-emoji-panel" role="listbox">
              {EMOJI_QUICK.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  className="messenger-emoji-item"
                  onClick={() => {
                    insertEmoji(emo);
                    setEmojiOpen(false);
                  }}
                >
                  {emo}
                </button>
              ))}
            </div>
          )}
        </span>
        <button
          type="button"
          className="messenger-tool-btn"
          title="Gửi ảnh"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          🖼
        </button>
      </div>
      <div className="messenger-composer__row">
        <textarea
          ref={taRef}
          className="messenger-composer__input"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={2000}
          disabled={uploading}
          aria-label={ariaLabel}
        />
        <button
          type="submit"
          className="messenger-send"
          title="Gửi"
          disabled={uploading}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user, isKhachHang, isQuanTri, isLeTan } = useAuth();
  const isStaff = !!(isQuanTri || isLeTan);
  const isGuest = !!(isKhachHang && !isStaff);

  if (!user) return <Navigate to="/dang-nhap" replace />;
  if (!isStaff && !isGuest) return <Navigate to="/" replace />;

  if (isStaff) return <ChatStaff />;
  return <ChatGuest />;
}

function ChatGuest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nhanVien, setNhanVien] = useState<NguoiHoTro[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tin, setTin] = useState<TinNhan[]>([]);
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chon = nhanVien.find((n) => n.id === selectedId);

  useEffect(() => {
    api
      .get<NguoiHoTro[]>("/chat/nhan-vien-ho-tro")
      .then((r) => {
        setNhanVien(r.data);
        if (r.data.length === 1) setSelectedId(r.data[0].id);
      })
      .catch(() => setNhanVien([]));
  }, []);

  const loadTin = () => {
    if (selectedId == null) return;
    api
      .get("/chat/khach/tin-nhan", { params: { idNguoiHoTro: selectedId } })
      .then((r) => setTin(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (selectedId == null) {
      setTin([]);
      return;
    }
    loadTin();
    const id = window.setInterval(loadTin, 4500);
    return () => window.clearInterval(id);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tin.length, selectedId]);

  const guiTinKhach = async () => {
    if (selectedId == null) return;
    const text = draft.trim();
    if (!text) return;
    try {
      await api.post("/chat/khach/tin-nhan", {
        noiDung: text,
        idNguoiHoTro: selectedId,
      });
      setDraft("");
      loadTin();
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Không gửi được tin",
        "error",
      );
    }
  };

  const guiAnhKhach = async (file: File) => {
    if (selectedId == null) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post<{ duongDan: string }>(
        "/chat/tai-anh",
        fd,
      );
      await api.post("/chat/khach/tin-nhan", {
        noiDung: data.duongDan,
        kieuTin: KIEU_ANH,
        idNguoiHoTro: selectedId,
      });
      loadTin();
    } finally {
      setUploading(false);
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    void guiTinKhach();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void guiTinKhach();
    }
  };

  return (
    <div className="container page-shell messenger-page">
      <div className="messenger messenger--staff">
        <aside className="messenger-sidebar">
          <div className="messenger-sidebar__head">
            <h2 className="messenger-sidebar__title">Chọn nhân viên</h2>
            <span className="messenger-sidebar__count">{nhanVien.length}</span>
          </div>
          {nhanVien.length === 0 ? (
            <p className="messenger-sidebar__empty">
              Hiện chưa có lễ tân hoặc quản trị khả dụng để chat.
            </p>
          ) : (
            <ul className="messenger-roster">
              {nhanVien.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`messenger-roster-item${selectedId === n.id ? " messenger-roster-item--active" : ""}`}
                    onClick={() => setSelectedId(n.id)}
                  >
                    <BadgeHoTen ten={n.hoTen} />
                    <span className="messenger-roster-item__main">
                      <span className="messenger-roster-item__name">
                        {n.hoTen}
                      </span>
                      <span className="messenger-roster-item__sub">
                        {n.loaiVaiTro}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="messenger-main">
          {selectedId == null ? (
            <div className="messenger-placeholder">
              <p className="messenger-placeholder__title">
                Ai sẽ đồng hành cùng bạn hôm nay?
              </p>
              <p className="messenger-placeholder__sub">
                Chọn một nhân viên bên trái — lễ tân hoặc quản trị đang trực
                tuyến. Mỗi người là một kênh chat riêng, để bạn được trả lời
                đúng người, đúng việc.
              </p>
            </div>
          ) : (
            <>
              <header className="messenger-topbar messenger-topbar--border">
                <div className="messenger-topbar__peer">
                  <BadgeHoTen ten={chon?.hoTen || "?"} />
                  <div className="messenger-topbar__text">
                    <h1 className="messenger-topbar__title">
                      {chon?.hoTen ?? "Hỗ trợ"}
                    </h1>
                    <p className="messenger-topbar__hint">
                      {chon?.loaiVaiTro ?? ""}
                      {chon?.loaiVaiTro ? " · " : ""}
                      Emoji &amp; ảnh · Enter gửi · làm mới ~5 giây
                    </p>
                  </div>
                </div>
              </header>

              <div className="messenger-thread messenger-thread--staff">
                {tin.length === 0 ? (
                  <div className="messenger-empty">
                    <p className="messenger-empty__title">
                      {chon
                        ? `Chào bạn — ${chon.hoTen} sẵn sàng hỗ trợ`
                        : "Chào bạn!"}
                    </p>
                    <p className="messenger-empty__sub">
                      Đặt phòng, đổi lịch, nhận — trả phòng, dịch vụ trong khách
                      sạn hay thắc mắc khác… cứ nhắn như nhắn cho một người bạn
                      ở lễ tân. Gửi ảnh hoặc emoji từ thanh công cụ phía dưới.
                    </p>
                  </div>
                ) : (
                  <div className="messenger-stream">
                    {tin.map((m) => {
                      const mine = user?.idNguoiDung === m.idNguoiGui;
                      const isImg = m.kieuTin === KIEU_ANH;
                      return (
                        <div
                          key={m.id}
                          className={`messenger-row${mine ? " messenger-row--out" : " messenger-row--in"}`}
                        >
                          {!mine && (
                            <BadgeHoTen ten={m.tenHienThiNguoiGui || "?"} />
                          )}
                          <div className="messenger-msg-wrap">
                            {!mine && (
                              <span className="messenger-msg-from">
                                {m.tenHienThiNguoiGui || "Nhân viên"}
                              </span>
                            )}
                            <div
                              className={`messenger-bubble${mine ? " messenger-bubble--out" : ""}${isImg ? " messenger-bubble--media" : ""}`}
                            >
                              <MessengerBubbleBody m={m} />
                              <time className="messenger-bubble__time">
                                {formatTime(m.thoiDiem)}
                              </time>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <form onSubmit={send}>
                <MessengerComposer
                  draft={draft}
                  setDraft={setDraft}
                  onKeyDown={onKeyDown}
                  onSendImage={guiAnhKhach}
                  uploading={uploading}
                  placeholder="Nhập tin nhắn…"
                  ariaLabel="Nội dung tin nhắn"
                />
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ChatStaff() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cuocs, setCuocs] = useState<CuocTomTat[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tin, setTin] = useState<TinNhan[]>([]);
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadCuocs = () => {
    api
      .get("/chat/cuoc-tro-chuyen")
      .then((r) => setCuocs(r.data))
      .catch(() => {});
  };

  const loadTin = (id: number) => {
    api
      .get(`/chat/cuoc-tro-chuyen/${id}/tin-nhan`)
      .then((r) => setTin(r.data))
      .catch(() => setTin([]));
  };

  useEffect(() => {
    loadCuocs();
    const id = window.setInterval(loadCuocs, 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    loadTin(selectedId);
    const id = window.setInterval(() => loadTin(selectedId!), 4000);
    return () => window.clearInterval(id);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tin.length, selectedId]);

  const guiTinNhanVien = async () => {
    if (selectedId == null) return;
    const text = draft.trim();
    if (!text) return;
    try {
      await api.post(`/chat/cuoc-tro-chuyen/${selectedId}/tin-nhan`, {
        noiDung: text,
      });
      setDraft("");
      loadTin(selectedId);
      loadCuocs();
    } catch (err) {
      toast(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Không gửi được tin",
        "error",
      );
    }
  };

  const guiAnhNhanVien = async (file: File) => {
    if (selectedId == null) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post<{ duongDan: string }>(
        "/chat/tai-anh",
        fd,
      );
      await api.post(`/chat/cuoc-tro-chuyen/${selectedId}/tin-nhan`, {
        noiDung: data.duongDan,
        kieuTin: KIEU_ANH,
      });
      loadTin(selectedId);
      loadCuocs();
    } finally {
      setUploading(false);
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    void guiTinNhanVien();
  };

  const tenKhach = (c: CuocTomTat) =>
    c.hoTenKhach?.trim() || c.tenDangNhapKhach;

  const cuocChon = cuocs.find((c) => c.id === selectedId);

  const onKeyDownStaff = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void guiTinNhanVien();
    }
  };

  return (
    <div className="container page-shell messenger-page">
      <div className="messenger messenger--staff">
        <aside className="messenger-sidebar">
          <div className="messenger-sidebar__head">
            <h2 className="messenger-sidebar__title">Khách</h2>
            <span className="messenger-sidebar__count">{cuocs.length}</span>
          </div>
          {cuocs.length === 0 ? (
            <p className="messenger-sidebar__empty">Chưa có cuộc hội thoại.</p>
          ) : (
            <ul className="messenger-roster">
              {cuocs.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`messenger-roster-item${selectedId === c.id ? " messenger-roster-item--active" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <BadgeHoTen ten={tenKhach(c)} />
                    <span className="messenger-roster-item__main">
                      <span className="messenger-roster-item__name">
                        {tenKhach(c)}
                      </span>
                      <span className="messenger-roster-item__sub">
                        {c.tenNguoiHoTro
                          ? `Hỗ trợ: ${c.tenNguoiHoTro} · `
                          : ""}
                        {formatTime(c.thoiDiemCapNhat)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="messenger-main">
          {selectedId == null ? (
            <div className="messenger-placeholder">
              <p className="messenger-placeholder__title">Chọn một khách</p>
              <p className="messenger-placeholder__sub">
                Mỗi dòng là một cuộc chat 1-1 với khách. Chọn bên trái để đọc và
                trả lời — có thể gửi ảnh và emoji.
              </p>
            </div>
          ) : !cuocChon ? (
            <div className="messenger-placeholder">
              <p className="messenger-placeholder__sub">Đang tải…</p>
            </div>
          ) : (
            <>
              <header className="messenger-topbar messenger-topbar--border">
                <div className="messenger-topbar__peer">
                  <BadgeHoTen ten={tenKhach(cuocChon)} />
                  <div className="messenger-topbar__text">
                    <h2 className="messenger-topbar__title">
                      {tenKhach(cuocChon)}
                    </h2>
                    <p className="messenger-topbar__hint">
                      Hội thoại 1-1 · @{cuocChon.tenDangNhapKhach} · emoji &amp;
                      ảnh
                    </p>
                  </div>
                </div>
              </header>

              <div className="messenger-thread messenger-thread--staff">
                <div className="messenger-stream">
                  {tin.map((m) => {
                    const mine = user?.idNguoiDung === m.idNguoiGui;
                    const isImg = m.kieuTin === KIEU_ANH;
                    return (
                      <div
                        key={m.id}
                        className={`messenger-row${mine ? " messenger-row--out" : " messenger-row--in"}`}
                      >
                        {!mine && (
                          <BadgeHoTen ten={m.tenHienThiNguoiGui || "?"} />
                        )}
                        <div className="messenger-msg-wrap">
                          {!mine && (
                            <span className="messenger-msg-from">
                              {m.tenHienThiNguoiGui || "Khách"}
                            </span>
                          )}
                          <div
                            className={`messenger-bubble${mine ? " messenger-bubble--out" : ""}${isImg ? " messenger-bubble--media" : ""}`}
                          >
                            <MessengerBubbleBody m={m} />
                            <time className="messenger-bubble__time">
                              {formatTime(m.thoiDiem)}
                            </time>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>

              <form onSubmit={send}>
                <MessengerComposer
                  draft={draft}
                  setDraft={setDraft}
                  onKeyDown={onKeyDownStaff}
                  onSendImage={guiAnhNhanVien}
                  uploading={uploading}
                  placeholder="Trả lời khách…"
                  ariaLabel="Trả lời khách"
                />
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
