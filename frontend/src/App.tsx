import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RoomList from "./pages/RoomList";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import BookingSuccess from "./pages/BookingSuccess";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRooms from "./pages/admin/Rooms";
import AdminRoomTypes from "./pages/admin/RoomTypes";
import AdminRoomPricing from "./pages/admin/RoomPricing";
import AdminUsers from "./pages/admin/Users";
import AdminPolicies from "./pages/admin/CancellationPolicies";
import AdminDichVu from "./pages/admin/DichVu";
import ChatPage from "./pages/Chat";
import ReceptionistBookings from "./pages/receptionist/Bookings";
import ReceptionistCustomers from "./pages/receptionist/Customers";
import HousekeeperNeedsCleaning from "./pages/housekeeping/RoomsNeedCleaning";
import HousekeeperRoomStatus from "./pages/housekeeping/RoomStatus";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import Info from "./pages/Info";
import Profile from "./pages/Profile";
import RoomDetail from "./pages/RoomDetail";
import LoaiPhongDetail from "./pages/LoaiPhongDetail";
import InvoicePrint from "./pages/InvoicePrint";
import AdminBookings from "./pages/admin/Bookings";
import AdminAuditLog from "./pages/admin/AuditLog";

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
      <Route path="/dang-nhap" element={<Login />} />
      <Route path="/dang-ky" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="thong-tin" element={<Info />} />
        <Route path="khong-co-quyen" element={<Forbidden />} />
        <Route
          path="ho-so"
          element={
            <PrivateRoute roles={[...ROLE_ANY_AUTH]}>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="phong" element={<RoomList />} />
        <Route path="phong/chi-tiet/:id" element={<RoomDetail />} />
        <Route path="loai-phong/chi-tiet/:id" element={<LoaiPhongDetail />} />
        <Route
          path="dat-phong"
          element={
            <PrivateRoute roles={["ROLE_KHACH_HANG"]}>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="don-cua-toi"
          element={
            <PrivateRoute roles={["ROLE_KHACH_HANG"]}>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="hoa-don/:id"
          element={
            <PrivateRoute roles={["ROLE_KHACH_HANG"]}>
              <InvoicePrint />
            </PrivateRoute>
          }
        />
        <Route path="dat-phong/thanh-cong" element={<BookingSuccess />} />
        <Route path="quan-tri">
          <Route
            path="bang-dieu-khien"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminRooms />
              </PrivateRoute>
            }
          />
          <Route
            path="loai-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminRoomTypes />
              </PrivateRoute>
            }
          />
          <Route
            path="bang-gia-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminRoomPricing />
              </PrivateRoute>
            }
          />
          <Route
            path="nguoi-dung"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="chinh-sach-huy-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminPolicies />
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
                <AdminBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="nhat-ky"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI"]}>
                <AdminAuditLog />
              </PrivateRoute>
            }
          />
        </Route>
        <Route path="le-tan">
          <Route
            path="dat-phong"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI", "ROLE_LE_TAN"]}>
                <ReceptionistBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="khach-hang"
            element={
              <PrivateRoute roles={["ROLE_QUAN_TRI", "ROLE_LE_TAN"]}>
                <ReceptionistCustomers />
              </PrivateRoute>
            }
          />
        </Route>
        <Route
          path="buong-phong/can-don-ve-sinh"
          element={
            <PrivateRoute
              roles={["ROLE_BUONG_PHONG", "ROLE_QUAN_TRI", "ROLE_LE_TAN"]}
            >
              <HousekeeperNeedsCleaning />
            </PrivateRoute>
          }
        />
        <Route
          path="buong-phong/trang-thai"
          element={
            <PrivateRoute
              roles={["ROLE_BUONG_PHONG", "ROLE_QUAN_TRI", "ROLE_LE_TAN"]}
            >
              <HousekeeperRoomStatus />
            </PrivateRoute>
          }
        />
        <Route
          path="chat"
          element={
            <PrivateRoute
              roles={["ROLE_KHACH_HANG", "ROLE_LE_TAN", "ROLE_QUAN_TRI"]}
            >
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
