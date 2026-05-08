import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import DangNhap from "./pages/DangNhap";
import DangKy from "./pages/DangKy";
import TrangChu from "./pages/TrangChu";
import DanhSachPhong from "./pages/DanhSachPhong";
import DatPhong from "./pages/DatPhong";
import DonCuaToi from "./pages/DonCuaToi";
import DatPhongThanhCong from "./pages/DatPhongThanhCong";
import AdminTongQuan from "./pages/admin/TongQuan";
import AdminPhong from "./pages/admin/Phong";
import AdminLoaiPhong from "./pages/admin/LoaiPhong";
import AdminBangGiaPhong from "./pages/admin/BangGiaPhong";
import AdminNguoiDung from "./pages/admin/NguoiDung";
import AdminChinhSachHuyPhong from "./pages/admin/ChinhSachHuyPhong";
import AdminDichVu from "./pages/admin/DichVu";
import TroChuyen from "./pages/TroChuyen";
import DatPhongLeTan from "./pages/receptionist/DatPhongLeTan";
import KhachHangLeTan from "./pages/receptionist/KhachHangLeTan";
import PhongCanDonDep from "./pages/housekeeping/PhongCanDonDep";
import TrangThaiPhongBuongPhong from "./pages/housekeeping/TrangThaiPhong";
import TongQuanBuongPhong from "./pages/housekeeping/TongQuanBuongPhong";
import KhongTimThay from "./pages/KhongTimThay";
import KhongCoQuyen from "./pages/KhongCoQuyen";
import ThongTin from "./pages/ThongTin";
import HoSo from "./pages/HoSo";
import ChiTietPhong from "./pages/ChiTietPhong";
import LoaiPhongDetail from "./pages/LoaiPhongDetail";
import InHoaDon from "./pages/InHoaDon";
import AdminDatPhong from "./pages/admin/DatPhong";
import AdminNhatKyHeThong from "./pages/admin/NhatKyHeThong";

const ROLE_ANY_AUTH = [
  "ROLE_VANG_LAI",
  "ROLE_KHACH_HANG",
  "ROLE_QUAN_TRI",
  "ROLE_LE_TAN",
  "ROLE_BUONG_PHONG",
] as const;

function PrivateRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/dang-nhap" replace />;
  const hasRole = roles.some((r) => user.vaiTro?.includes(r));
  if (!hasRole) return <Navigate to="/khong-co-quyen" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<DangNhap />} />
      <Route path="/dang-ky" element={<DangKy />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<TrangChu />} />
        <Route path="thong-tin" element={<ThongTin />} />
        <Route path="khong-co-quyen" element={<KhongCoQuyen />} />
        <Route
          path="ho-so"
          element={
            <PrivateRoute roles={[...ROLE_ANY_AUTH]}>
              <HoSo />
            </PrivateRoute>
          }
        />
        <Route path="phong" element={<DanhSachPhong />} />
        <Route path="phong/chi-tiet/:id" element={<ChiTietPhong />} />
        <Route path="loai-phong/chi-tiet/:id" element={<LoaiPhongDetail />} />
        <Route
          path="dat-phong"
          element={
            <PrivateRoute roles={["ROLE_KHACH_HANG"]}>
              <DatPhong />
            </PrivateRoute>
          }
        />
        <Route
          path="don-cua-toi"
          element={
            <PrivateRoute roles={["ROLE_KHACH_HANG"]}>
              <DonCuaToi />
            </PrivateRoute>
          }
        />
        <Route
          path="hoa-don/:id"
          element={
            <PrivateRoute roles={["ROLE_KHACH_HANG"]}>
              <InHoaDon />
            </PrivateRoute>
          }
        />
        <Route path="dat-phong/thanh-cong" element={<DatPhongThanhCong />} />
        <Route path="quan-tri">
          <Route
            path="bang-dieu-khien"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminTongQuan />
              </PrivateRoute>
            }
          />
          <Route
            path="phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminPhong />
              </PrivateRoute>
            }
          />
          <Route
            path="loai-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminLoaiPhong />
              </PrivateRoute>
            }
          />
          <Route
            path="bang-gia-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminBangGiaPhong />
              </PrivateRoute>
            }
          />
          <Route
            path="nguoi-dung"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminNguoiDung />
              </PrivateRoute>
            }
          />
          <Route
            path="chinh-sach-huy-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminChinhSachHuyPhong />
              </PrivateRoute>
            }
          />
          <Route
            path="dich-vu"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminDichVu />
              </PrivateRoute>
            }
          />
          <Route
            path="dat-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminDatPhong />
              </PrivateRoute>
            }
          />
          <Route
            path="nhat-ky"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminNhatKyHeThong />
              </PrivateRoute>
            }
          />
        </Route>
        <Route path="le-tan">
          <Route
            path="dat-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI", "ROLE_LE_TAN"]}>
                <DatPhongLeTan />
              </PrivateRoute>
            }
          />
          <Route
            path="hoa-don/:id"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI", "ROLE_LE_TAN"]}>
                <InHoaDon />
              </PrivateRoute>
            }
          />
          <Route
            path="khach-hang"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI", "ROLE_LE_TAN"]}>
                <KhachHangLeTan />
              </PrivateRoute>
            }
          />
        </Route>
        <Route path="buong-phong">
          <Route
            index
            element={
              <PrivateRoute
                roles={["ROLE_BUONG_PHONG", "ROLE_QUAN_TRI", "ROLE_LE_TAN"]}
              >
                <TongQuanBuongPhong />
              </PrivateRoute>
            }
          />
          <Route
            path="can-don-ve-sinh"
            element={
              <PrivateRoute
                roles={["ROLE_BUONG_PHONG", "ROLE_QUAN_TRI", "ROLE_LE_TAN"]}
              >
                <PhongCanDonDep />
              </PrivateRoute>
            }
          />
          <Route
            path="trang-thai"
            element={
              <PrivateRoute
                roles={["ROLE_BUONG_PHONG", "ROLE_QUAN_TRI", "ROLE_LE_TAN"]}
              >
                <TrangThaiPhongBuongPhong />
              </PrivateRoute>
            }
          />
        </Route>
        <Route
          path="chat"
          element={
            <PrivateRoute
              roles={["ROLE_KHACH_HANG", "ROLE_LE_TAN", "ROLE_QUAN_TRI"]}
            >
              <TroChuyen />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<KhongTimThay />} />
      </Route>
    </Routes>
  );
}
