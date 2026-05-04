# ĐỀ CƯƠNG VÀ NHIỆM VỤ ĐỒ ÁN

## WEBSITE QUẢN LÝ KHÁCH SẠN ROYAL LOTUS HOTEL

**Công nghệ:** Java Spring Boot + ReactJS  
**Cơ sở dữ liệu:** MySQL  
**Quản lý mã nguồn:** Git & GitHub

---

# PHẦN I. ĐỀ CƯƠNG ĐỒ ÁN

## 1. Tên đề tài

**Website Quản lý Khách sạn Royal Lotus Hotel** sử dụng Java Spring Boot và ReactJS.

## 2. Đặt vấn đề

Ngành du lịch và lưu trú đang phát triển mạnh, nên việc đưa công nghệ thông tin vào quản lý khách sạn là điều cần thiết. Cách làm thủ công hay dùng nhiều công cụ rời rạc không đủ để xử lý khối lượng công việc ngày càng lớn, dễ sai sót và mất thời gian.

Do đó, khách sạn cần có một phần mềm quản lý chung, giúp mọi thứ thống nhất và dễ kiểm soát. Cụ thể: thông tin phòng, loại phòng, giá và trạng thái phòng phải được cập nhật chính xác; khách hàng có thể tự tìm phòng còn trống, đặt phòng trên web và thanh toán online qua VNPay hoặc Stripe. Phần lễ tân thì cần làm nhanh các việc như tạo đơn, check-in/check-out, thêm dịch vụ ăn uống hay giặt ủi vào hóa đơn, và tìm thông tin khách khi cần. Còn quản trị viên cần xem được tình hình hoạt động theo thời gian thực (dashboard), báo cáo doanh thu và thiết lập chính sách hủy phòng, hoàn tiền rõ ràng.

Ngoài nghiệp vụ, hệ thống còn phải bảo mật tốt (đăng nhập bằng JWT, phân quyền rõ ràng) và tích hợp thanh toán online, gửi email xác nhận sau khi đặt phòng thành công để dịch vụ chuyên nghiệp và khách hàng yên tâm hơn.

## 3. Mục tiêu đồ án

- Xây dựng **backend RESTful API** bằng Java Spring Boot: xác thực JWT, Spring Security, Spring Data JPA, tích hợp thanh toán và email.
- Xây dựng **frontend** bằng ReactJS: React Router, Axios, Context API, giao diện theo vai trò (Admin, Lễ tân, Khách hàng).
- Thiết kế **cơ sở dữ liệu** MySQL phù hợp với nghiệp vụ: User, Role, Room, RoomType, Booking, Customer, Payment, Service, Refund, CancellationPolicy, v.v.
- Đáp ứng đầy đủ **User Story** cho ba nhóm người dùng và chức năng hệ thống tự động (email, dashboard realtime, hoàn tiền theo chính sách).

## 4. Phạm vi đồ án

- **Trong phạm vi:** Quản lý phòng và loại phòng; đặt phòng và thanh toán online; check-in/check-out; quản lý khách hàng và dịch vụ phát sinh; dashboard và báo cáo doanh thu; chính sách hủy phòng và hoàn tiền; quản lý người dùng và phân quyền; gửi email xác nhận.
- **Ngoài phạm vi:** Kế toán tổng hợp, quản lý nhân sự lương, tích hợp phần mềm kế toán bên ngoài (chỉ mô tả hướng mở rộng nếu cần).

## 5. Công nghệ và công cụ sử dụng

| Thành phần         | Công nghệ / Công cụ                                                                 |
| ------------------ | ----------------------------------------------------------------------------------- |
| Backend            | Java 17, Spring Boot 3.2, Spring Security, JWT (JJWT), Spring Data JPA, Spring Mail |
| API                | RESTful API, JSON                                                                   |
| Frontend           | React 18, TypeScript, Vite, React Router, Axios, Context API                        |
| Cơ sở dữ liệu      | MySQL 8                                                                             |
| Công cụ phát triển | IntelliJ IDEA / VS Code                                                             |
| Quản lý mã nguồn   | Git & GitHub                                                                        |

## 6. Phương pháp thực hiện

- Phân tích yêu cầu theo **User Story** (Admin, Lễ tân, Khách hàng, Hệ thống).
- Thiết kế **Use Case** và **mô hình dữ liệu** (ER/PlantUML) từ đó sinh entity JPA.
- Phát triển **Backend** trước: Entity → Repository → Service → Controller; tích hợp Security (JWT), Payment (VNPay), Email.
- Phát triển **Frontend**: AuthContext, API client (Axios), các trang theo vai trò, bảo vệ route.
- Kiểm thử chức năng theo từng nhóm User Story và tích hợp (API + giao diện).

## 7. Cấu trúc sản phẩm đồ án

```
hotel_royal/
├── backend/                    # Spring Boot
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/royallotushotel/
│       │   ├── config/         # SecurityConfig, CORS, Exception, DataInitializer
│       │   ├── controller/     # Auth, Room, RoomType, Booking, Customer, Payment, Dashboard, User, Service, CancellationPolicy
│       │   ├── dto/
│       │   ├── entity/         # User, Role, Room, RoomType, Booking, Customer, Payment, Service, Refund, CancellationPolicy, ...
│       │   ├── repository/
│       │   ├── security/       # JwtUtil, JwtAuthFilter, UserPrincipal, CustomUserDetailsService
│       │   └── service/
│       └── resources/
│           └── application.yml
├── frontend/                   # React (Vite)
│   ├── src/
│   │   ├── api/                # Axios client (baseURL, JWT header)
│   │   ├── components/         # Layout (header, nav)
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # Home, Login, Register, RoomList, Booking, MyBookings, BookingSuccess
│   │   ├── pages/admin/        # Dashboard, Rooms, RoomTypes, Users, CancellationPolicies
│   │   ├── pages/receptionist/ # Bookings, Customers
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── README.md
├── DE_CUONG_VA_NHIEM_VU_DO_AN.md   # Tài liệu này
└── .gitignore
```

## 8. Kết quả dự kiến

- Hệ thống chạy ổn định: Backend API trên port 8090 (context-path `/api`), Frontend trên port 5173, kết nối MySQL.
- Đáp ứng đầy đủ User Story đã liệt kê (Admin, Lễ tân, Khách hàng, Hệ thống).
- Tài liệu: Đề cương và Nhiệm vụ đồ án (tài liệu này), README hướng dẫn cài đặt và chạy, có thể bổ sung báo cáo đồ án chi tiết và slide bảo vệ.

---

# PHẦN II. NHIỆM VỤ ĐỒ ÁN

## 1. Tổng quan nhiệm vụ

Đồ án thực hiện đầy đủ các nhiệm vụ tương ứng với **User Story** đã nêu, được ánh xạ vào **Backend (API)** và **Frontend (giao diện)** như bảng dưới. Các chức năng hệ thống tự động (gửi email, cập nhật dashboard, tính hoàn tiền) được triển khai trong backend và tích hợp với luồng nghiệp vụ.

## 2. Nhiệm vụ theo nhóm người dùng

### I. Quản trị viên (Admin)

| ID        | User Story                                                           | Trạng thái    | Cách triển khai (Backend / Frontend)                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US-ADM-01 | Thêm, sửa, xóa và cập nhật trạng thái phòng                          | ✅ Hoàn thành | **Backend:** `RoomController` (CRUD), `RoomService`, `PATCH /rooms/{id}/status`. **Frontend:** `admin/Rooms.tsx` (form thêm/sửa, bảng danh sách, nút xóa, cập nhật trạng thái).                                                            |
| US-ADM-02 | Quản lý loại phòng và giá phòng                                      | ✅ Hoàn thành | **Backend:** `RoomTypeController`, `RoomTypeService`, CRUD `/room-types`. **Frontend:** `admin/RoomTypes.tsx` (thêm/sửa/xóa loại phòng, giá, mô tả, số người).                                                                             |
| US-ADM-03 | Tạo và phân quyền tài khoản nhân viên                                | ✅ Hoàn thành | **Backend:** `UserController`, `UserService`, `RoleRepository`, CRUD `/users`, gán role (ROLE_ADMIN, ROLE_RECEPTIONIST, ROLE_CUSTOMER). **Frontend:** `admin/Users.tsx` (danh sách user, form thêm/sửa, chọn vai trò).                     |
| US-ADM-04 | Xem báo cáo doanh thu theo ngày, tháng, năm                          | ✅ Hoàn thành | **Backend:** `DashboardController`, `DashboardService`, `GET /dashboard/revenue?from=&to=`. **Frontend:** `admin/Dashboard.tsx` (chọn khoảng từ/đến, hiển thị doanh thu và số đơn).                                                        |
| US-ADM-05 | Xem dashboard thời gian thực                                         | ✅ Hoàn thành | **Backend:** `GET /dashboard/realtime` (tổng phòng, phòng trống, phòng đang dùng, doanh thu hôm nay, đơn hôm nay, tỉ lệ lấp phòng). **Frontend:** `admin/Dashboard.tsx` (ô thống kê realtime).                                             |
| US-ADM-06 | Xem biểu đồ thống kê (doanh thu, tỉ lệ lấp phòng, số lượt đặt phòng) | ✅ Hoàn thành | **Backend:** Dữ liệu từ `DashboardService` (revenue, bookingCount, occupancyRate). **Frontend:** `admin/Dashboard.tsx` (hiển thị số liệu; có thể mở rộng biểu đồ bằng thư viện Chart.js/Recharts).                                         |
| US-ADM-07 | Cấu hình chính sách hủy phòng và hoàn tiền                           | ✅ Hoàn thành | **Backend:** Entity `CancellationPolicy`, `CancellationPolicyController`, `CancellationPolicyService`, CRUD `/cancellation-policies`. **Frontend:** `admin/CancellationPolicies.tsx` (thêm/sửa/xóa rule: giờ trước check-in, % hoàn tiền). |

### II. Nhân viên lễ tân (Receptionist)

| ID        | User Story                                                    | Trạng thái    | Cách triển khai (Backend / Frontend)                                                                                                                                                                                                                                            |
| --------- | ------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-REC-01 | Tạo đơn đặt phòng cho khách                                   | ✅ Hoàn thành | **Backend:** `POST /bookings`, `CreateBookingRequest`, `BookingService.create()`. **Frontend:** Lễ tân dùng luồng đặt phòng (có thể mở rộng trang riêng tạo booking cho khách chọn phòng + ngày). Hiện có thể tạo qua API; giao diện `receptionist/Bookings.tsx` xem danh sách. |
| US-REC-02 | Thực hiện check-in (cập nhật trạng thái phòng “đang sử dụng”) | ✅ Hoàn thành | **Backend:** `POST /bookings/{id}/check-in`, `BookingService.checkIn()` (đổi trạng thái booking, phòng sang OCCUPIED). **Frontend:** `receptionist/Bookings.tsx` nút "Check-in".                                                                                                |
| US-REC-03 | Thực hiện check-out và xuất hóa đơn                           | ✅ Hoàn thành | **Backend:** `POST /bookings/{id}/check-out`, `BookingService.checkOut()` (phòng về AVAILABLE). **Frontend:** `receptionist/Bookings.tsx` nút "Check-out". (Xuất hóa đơn PDF có thể mở rộng sau.)                                                                               |
| US-REC-04 | Thêm dịch vụ phát sinh (ăn uống, giặt ủi…) vào hóa đơn        | ✅ Hoàn thành | **Backend:** Entity `Service`, `ServiceUsage`, `POST /services/booking/{bookingId}/add` (serviceId, quantity), `HotelServiceService`. **Frontend:** Có API sẵn; có thể thêm form trong trang chi tiết booking để gọi API thêm dịch vụ.                                          |
| US-REC-05 | Tìm kiếm nhanh thông tin khách hàng                           | ✅ Hoàn thành | **Backend:** `GET /customers?q=`, `CustomerRepository.search()`. **Frontend:** `receptionist/Customers.tsx` (ô tìm theo tên, SĐT, email).                                                                                                                                       |
| US-REC-06 | Kiểm tra trạng thái thanh toán online (VNPay/Stripe)          | ✅ Hoàn thành | **Backend:** `Payment` (status), `PaymentTransaction` (gateway, transactionCode), `GET /bookings/{id}` trả về `payment.status`. **Frontend:** Trang danh sách/chi tiết booking hiển thị trạng thái thanh toán; callback VNPay cập nhật payment và xác nhận booking.             |

### III. Khách hàng (Customer)

| ID        | User Story                                                   | Trạng thái    | Cách triển khai (Backend / Frontend)                                                                                                                                                                                                                        |
| --------- | ------------------------------------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-CUS-01 | Đăng ký và đăng nhập tài khoản                               | ✅ Hoàn thành | **Backend:** `POST /auth/register`, `POST /auth/login`, JWT, tạo Customer gắn User. **Frontend:** `Login.tsx`, `Register.tsx`, `AuthContext`, lưu token và user.                                                                                            |
| US-CUS-02 | Xem danh sách phòng còn trống cùng thông tin chi tiết và giá | ✅ Hoàn thành | **Backend:** `GET /rooms/available?checkInDate=&checkOutDate=&roomTypeId=`, `RoomRepository.findAvailableRooms()`. **Frontend:** `RoomList.tsx` (bộ lọc ngày, loại phòng; danh sách phòng, giá).                                                            |
| US-CUS-03 | Đặt phòng trực tuyến                                         | ✅ Hoàn thành | **Backend:** `POST /bookings` (customerId, checkIn, checkOut, roomIds). **Frontend:** `BookingPage.tsx` (chọn ngày, chọn phòng, gửi đơn; sau đó chuyển thanh toán).                                                                                         |
| US-CUS-04 | Thanh toán online qua VNPay hoặc Stripe                      | ✅ Hoàn thành | **Backend:** `PaymentService.createVnPayPaymentUrl()`, `GET /payments/callback`, `confirmPayment()`, `BookingService.confirmBooking()`. **Frontend:** `BookingPage.tsx` gọi `POST /payments/create-url` và redirect sang VNPay; trang success sau callback. |
| US-CUS-05 | Nhận email xác nhận sau khi đặt phòng thành công             | ✅ Hoàn thành | **Backend:** `EmailService.sendBookingConfirmation()`, gọi sau `confirmBooking()`; cấu hình SMTP trong `application.yml`. **Frontend:** Không can thiệp; thông báo trên trang success.                                                                      |
| US-CUS-06 | Hủy phòng theo chính sách hoàn tiền                          | ✅ Hoàn thành | **Backend:** `POST /bookings/{id}/cancel`, `RefundService.applyRefund()`, `RefundService.calculateRefundAmount()` theo `CancellationPolicy`. **Frontend:** `MyBookings.tsx` nút "Hủy" cho đơn PENDING/CONFIRMED.                                            |
| US-CUS-07 | Xem lịch sử đặt phòng                                        | ✅ Hoàn thành | **Backend:** `GET /bookings/my` (theo customerId của user đăng nhập). **Frontend:** `MyBookings.tsx` (bảng đơn: ngày, phòng, trạng thái, tổng tiền, hủy).                                                                                                   |

### IV. Chức năng hệ thống (Tự động)

| ID        | User Story                                                                             | Trạng thái    | Cách triển khai (Backend / Frontend)                                                                                                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-SYS-01 | Hệ thống tự động gửi email xác nhận khi khách đặt phòng thành công                     | ✅ Hoàn thành | **Backend:** `EmailService.sendBookingConfirmation()`, `@Async`, gọi trong `BookingService.confirmBooking()`; log vào `EmailLog`.                                                                                                                           |
| US-SYS-02 | Hệ thống tự động cập nhật dữ liệu dashboard theo thời gian thực                        | ✅ Hoàn thành | **Backend:** `GET /dashboard/realtime` đọc dữ liệu mới nhất từ DB (số phòng, doanh thu, đơn). **Frontend:** Admin mở Dashboard là gọi API; có thể mở rộng polling/WebSocket để auto refresh.                                                                |
| US-SYS-03 | Hệ thống tích hợp PayOS (VNPay/Stripe) để xử lý thanh toán online                      | ✅ Hoàn thành | **Backend:** `PaymentService` (VNPay URL, callback), `PaymentTransaction` lưu gateway và mã giao dịch. **Ghi chú:** Tài liệu gốc nêu PayOS; mã nguồn tích hợp VNPay, có thể bổ sung PayOS/Stripe tương tự.                                                  |
| US-SYS-04 | Hệ thống tự động tính toán số tiền hoàn lại theo thời gian hủy và chính sách hoàn tiền | ✅ Hoàn thành | **Backend:** `RefundService.calculateRefundAmount()`, `RefundService.applyRefund()`, entity `CancellationPolicy` (hoursBeforeCheckin, refundPercentage). **Frontend:** Khách hủy đơn; số tiền hoàn có thể hiển thị trong thông báo hoặc trang chi tiết đơn. |

## 3. Sản phẩm nộp (Deliverables)

- **Mã nguồn:** Thư mục `hotel_royal` (backend + frontend), có thể nén hoặc đẩy lên GitHub.
- **Cơ sở dữ liệu:** Schema được tạo tự động bởi JPA (`ddl-auto: update`) khi chạy backend; có thể export script MySQL nếu yêu cầu.
- **Tài liệu:**
  - **Đề cương và Nhiệm vụ đồ án:** File `DE_CUONG_VA_NHIEM_VU_DO_AN.md` (tài liệu này).
  - **README:** Hướng dẫn cấu hình, chạy backend/frontend, tài khoản mặc định (admin/admin123).

## 4. Hướng dẫn chạy và kiểm tra

1. **Cơ sở dữ liệu:** Cài MySQL 8; tạo database `hotel_royal` (hoặc để ứng dụng tạo nếu dùng `createDatabaseIfNotExist=true`).
2. **Backend:** Mở `backend`, cấu hình `application.yml` (datasource, jwt, mail nếu dùng), chạy `mvn spring-boot:run`. API: `http://localhost:8090/api`.
3. **Frontend:** Trong `frontend`, chạy `npm install` rồi `npm run dev`. Giao diện: `http://localhost:5173`. Proxy Vite chuyển `/api` sang backend.
4. **Kiểm tra:** Đăng nhập admin (`admin` / `admin123`), lần lượt kiểm tra Dashboard, Quản lý phòng, Loại phòng, User, Chính sách hủy; đăng ký tài khoản khách, đặt phòng, thanh toán (test VNPay sandbox hoặc callback mô phỏng), xem "Đơn của tôi", hủy phòng; đăng nhập lễ tân (nếu có), kiểm tra Booking (check-in/check-out) và tìm khách hàng.

---

_Tài liệu này dùng để nộp kèm đồ án “Website Quản lý Khách sạn Royal Lotus Hotel” (Java Spring Boot + ReactJS)._
