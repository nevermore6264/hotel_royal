import { NavLink } from "react-router-dom";

const ADMIN_ITEMS = [
  { to: "/quan-tri/bang-dieu-khien", label: "Tổng quan" },
  { to: "/quan-tri/dat-phong", label: "Đặt phòng" },
  { to: "/quan-tri/phong", label: "Phòng" },
  { to: "/quan-tri/loai-phong", label: "Loại phòng" },
  { to: "/quan-tri/bang-gia-phong", label: "Bảng giá" },
  { to: "/quan-tri/dich-vu", label: "Dịch vụ" },
  { to: "/quan-tri/nguoi-dung", label: "Người dùng" },
  { to: "/quan-tri/chinh-sach-huy-phong", label: "Chính sách hủy" },
  { to: "/quan-tri/duyet-huy-phong", label: "Duyệt hủy phòng" },
  { to: "/quan-tri/nhat-ky", label: "Nhật ký" },
] as const;

const LE_TAN_ITEMS = [
  { to: "/le-tan/dat-phong", label: "Đặt phòng & đơn" },
  { to: "/le-tan/hoan-tien", label: "Hoàn tiền hủy" },
  { to: "/le-tan/khach-hang", label: "Khách hàng" },
  { to: "/chat", label: "Tin nhắn" },
] as const;

export function ThanhDieuHuongQuanTri() {
  return (
    <nav className="role-subnav" aria-label="Menu quản trị">
      {ADMIN_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/quan-tri/bang-dieu-khien"}
          className={({ isActive }) =>
            `role-subnav__link${isActive ? " role-subnav__link--active" : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function ThanhDieuHuongLeTan() {
  return (
    <nav className="role-subnav" aria-label="Menu lễ tân">
      {LE_TAN_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `role-subnav__link${isActive ? " role-subnav__link--active" : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

const BUONG_PHONG_ITEMS = [
  { to: "/buong-phong", label: "Tổng quan", end: true },
  { to: "/buong-phong/trang-thai", label: "Trạng thái phòng", end: false },
  { to: "/buong-phong/can-don-ve-sinh", label: "Phòng cần dọn", end: false },
] as const;

export function ThanhDieuHuongBuongPhong() {
  return (
    <nav className="role-subnav" aria-label="Menu buồng phòng">
      {BUONG_PHONG_ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `role-subnav__link${isActive ? " role-subnav__link--active" : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
