import { useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AdminSubNav,
  HousekeepingSubNav,
  ReceptionSubNav,
} from "./RoleSubNav";
import FaqChatWidget from "./FaqChatWidget";

export default function Layout() {
  const {
    user,
    logout,
    isQuanTri,
    isLeTan,
    isKhachHang,
    isBuongPhong,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSubmenu, setNavSubmenu] = useState<
    null | "admin" | "reception" | "buongphong"
  >(null);

  useEffect(() => {
    setMenuOpen(false);
    setNavSubmenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (navSubmenu === null) return;
    const closeOnOutside = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest("[data-nav-dropdown-root]")) setNavSubmenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavSubmenu(null);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [navSubmenu]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setNavSubmenu(null);
  };

  const path = location.pathname;

  const showAdminRibbon =
    isQuanTri && path.startsWith("/quan-tri");
  const showLeTanRibbon =
    (isLeTan || isQuanTri) && path.startsWith("/le-tan");
  const showBuongPhongRibbon =
    path.startsWith("/buong-phong") &&
    (isBuongPhong || isQuanTri || isLeTan);

  const isPhongNav =
    path === "/phong" ||
    path.startsWith("/phong/") ||
    path.startsWith("/loai-phong");
  const isDonCuaToiNav =
    path.startsWith("/don-cua-toi") || path.startsWith("/hoa-don/");
  const isAdminMainNav = isQuanTri && path.startsWith("/quan-tri");
  const isReceptionMainNav =
    (isLeTan || isQuanTri) &&
    (path.startsWith("/le-tan") || path === "/chat");
  const isBuongPhongMainNav = path.startsWith("/buong-phong");

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `layout-nav-link${isActive ? " layout-nav-link--active" : ""}`;

  return (
    <div className="layout-wrapper">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/" className="layout-logo" onClick={closeMenu}>
            Royal <span>Lotus</span>
          </Link>
          <button
            type="button"
            className="layout-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <nav
            className={`layout-nav${menuOpen ? " layout-nav--open" : ""}`}
            id="main-nav"
          >
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={closeMenu}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/phong"
              className={({ isActive }) =>
                `layout-nav-link${
                  isActive || isPhongNav ? " layout-nav-link--active" : ""
                }`
              }
              onClick={closeMenu}
            >
              Phòng
            </NavLink>
            <NavLink
              to="/thong-tin"
              end
              className={navLinkClass}
              onClick={closeMenu}
            >
              Thông tin
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/ho-so"
                  end
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  Hồ sơ
                </NavLink>
                {isKhachHang && (
                  <>
                    <NavLink
                      to="/dat-phong"
                      className={navLinkClass}
                      onClick={closeMenu}
                    >
                      Đặt phòng
                    </NavLink>
                    <NavLink
                      to="/don-cua-toi"
                      className={({ isActive }) =>
                        `layout-nav-link${
                          isActive || isDonCuaToiNav
                            ? " layout-nav-link--active"
                            : ""
                        }`
                      }
                      onClick={closeMenu}
                    >
                      Đơn của tôi
                    </NavLink>
                    <NavLink
                      to="/chat"
                      end
                      className={navLinkClass}
                      onClick={closeMenu}
                    >
                      Chat hỗ trợ
                    </NavLink>
                  </>
                )}
                {isQuanTri && (
                  <div
                    className={`layout-nav-dropdown${navSubmenu === "admin" ? " layout-nav-dropdown--open" : ""}`}
                    data-nav-dropdown-root
                  >
                    <button
                      type="button"
                      className={`layout-nav-dropdown__summary${
                        isAdminMainNav
                          ? " layout-nav-dropdown__summary--active"
                          : ""
                      }`}
                      aria-expanded={navSubmenu === "admin"}
                      aria-haspopup="true"
                      aria-controls="nav-submenu-admin"
                      id="nav-trigger-admin"
                      onClick={() =>
                        setNavSubmenu((v) => (v === "admin" ? null : "admin"))
                      }
                    >
                      Quản trị
                    </button>
                    {navSubmenu === "admin" && (
                      <div
                        className="layout-nav-dropdown__panel"
                        id="nav-submenu-admin"
                        role="menu"
                        aria-labelledby="nav-trigger-admin"
                      >
                        <NavLink
                          to="/quan-tri/bang-dieu-khien"
                          end
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Bảng điều khiển
                        </NavLink>
                        <NavLink
                          to="/quan-tri/dat-phong"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Đặt phòng (hệ thống)
                        </NavLink>
                        <NavLink
                          to="/quan-tri/phong"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Quản lý phòng
                        </NavLink>
                        <NavLink
                          to="/quan-tri/loai-phong"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Loại phòng
                        </NavLink>
                        <NavLink
                          to="/quan-tri/bang-gia-phong"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Bảng giá phòng
                        </NavLink>
                        <NavLink
                          to="/quan-tri/dich-vu"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Dịch vụ
                        </NavLink>
                        <NavLink
                          to="/quan-tri/nguoi-dung"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Người dùng
                        </NavLink>
                        <NavLink
                          to="/quan-tri/chinh-sach-huy-phong"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Chính sách hủy
                        </NavLink>
                        <NavLink
                          to="/quan-tri/nhat-ky"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Nhật ký
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}
                {(isLeTan || isQuanTri) && (
                  <div
                    className={`layout-nav-dropdown${navSubmenu === "reception" ? " layout-nav-dropdown--open" : ""}`}
                    data-nav-dropdown-root
                  >
                    <button
                      type="button"
                      className={`layout-nav-dropdown__summary${
                        isReceptionMainNav
                          ? " layout-nav-dropdown__summary--active"
                          : ""
                      }`}
                      aria-expanded={navSubmenu === "reception"}
                      aria-haspopup="true"
                      aria-controls="nav-submenu-reception"
                      id="nav-trigger-reception"
                      onClick={() =>
                        setNavSubmenu((v) =>
                          v === "reception" ? null : "reception",
                        )
                      }
                    >
                      Lễ tân
                    </button>
                    {navSubmenu === "reception" && (
                      <div
                        className="layout-nav-dropdown__panel"
                        id="nav-submenu-reception"
                        role="menu"
                        aria-labelledby="nav-trigger-reception"
                      >
                        <NavLink
                          to="/le-tan/dat-phong"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Đặt phòng &amp; đơn
                        </NavLink>
                        <NavLink
                          to="/le-tan/khach-hang"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Khách hàng
                        </NavLink>
                        <NavLink
                          to="/chat"
                          end
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Tin nhắn khách
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}
                {(isBuongPhong || isQuanTri || isLeTan) && (
                  <div
                    className={`layout-nav-dropdown${navSubmenu === "buongphong" ? " layout-nav-dropdown--open" : ""}`}
                    data-nav-dropdown-root
                  >
                    <button
                      type="button"
                      className={`layout-nav-dropdown__summary${
                        isBuongPhongMainNav
                          ? " layout-nav-dropdown__summary--active"
                          : ""
                      }`}
                      aria-expanded={navSubmenu === "buongphong"}
                      aria-haspopup="true"
                      aria-controls="nav-submenu-buong-phong"
                      id="nav-trigger-buong-phong"
                      onClick={() =>
                        setNavSubmenu((v) =>
                          v === "buongphong" ? null : "buongphong",
                        )
                      }
                    >
                      Buồng phòng
                    </button>
                    {navSubmenu === "buongphong" && (
                      <div
                        className="layout-nav-dropdown__panel"
                        id="nav-submenu-buong-phong"
                        role="menu"
                        aria-labelledby="nav-trigger-buong-phong"
                      >
                        <NavLink
                          to="/buong-phong"
                          end
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Tổng quan
                        </NavLink>
                        <NavLink
                          to="/buong-phong/trang-thai"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Trạng thái phòng
                        </NavLink>
                        <NavLink
                          to="/buong-phong/can-don-ve-sinh"
                          onClick={closeMenu}
                          role="menuitem"
                          className={({ isActive }) =>
                            isActive ? "layout-nav-dropdown__link--active" : ""
                          }
                        >
                          Phòng cần dọn
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}
                <span className="layout-user" title={user.tenDangNhap}>
                  {user.tenDangNhap}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="btn btn-secondary layout-btn-logout"
                >
                  <LogOut className="btn-ico" aria-hidden />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/dang-nhap"
                  className="btn btn-login"
                  onClick={closeMenu}
                >
                  <LogIn className="btn-ico" aria-hidden />
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-ky"
                  className="btn btn-secondary"
                  onClick={closeMenu}
                >
                  <UserPlus className="btn-ico" aria-hidden />
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {showAdminRibbon && (
        <div className="role-subnav-ribbon">
          <div className="container role-subnav-ribbon-inner">
            <AdminSubNav />
          </div>
        </div>
      )}
      {showLeTanRibbon && (
        <div className="role-subnav-ribbon role-subnav-ribbon--tan">
          <div className="container role-subnav-ribbon-inner">
            <ReceptionSubNav />
          </div>
        </div>
      )}
      {showBuongPhongRibbon && (
        <div className="role-subnav-ribbon role-subnav-ribbon--buong">
          <div className="container role-subnav-ribbon-inner">
            <HousekeepingSubNav />
          </div>
        </div>
      )}
      <main className="layout-main">
        <Outlet />
      </main>
      <FaqChatWidget />
    </div>
  );
}
