# Royal Lotus Hotel - Hệ thống quản lý khách sạn

Website quản lý khách sạn xây dựng bằng **Java Spring Boot** (backend) và **React** (frontend).

## Công nghệ

- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA, MySQL
- **Frontend:** React 18, Vite, React Router, Axios, TypeScript
- **Database:** MySQL 8

## Yêu cầu

- JDK 17+
- Node.js 18+
- MySQL 8 (hoặc dùng URL tạo DB tự động: `createDatabaseIfNotExist=true`)

## Cấu hình Backend

1. Tạo database (hoặc để Spring tạo): `hotel_royal`
2. Sửa `backend/src/main/resources/application.yml` nếu cần:
   - `spring.datasource.url`: URL MySQL (mặc định: `localhost:3306/hotel_royal`, user `root`, password trống)
   - `jwt.secret`: chuỗi bí mật JWT (nên đặt biến môi trường `JWT_SECRET`)
   - Mail (tùy chọn): `MAIL_USERNAME`, `MAIL_PASSWORD` để gửi email xác nhận
   - payOS (tùy chọn, thanh toán thật): `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`; local có thể bật `PAYOS_DEV_MODE=true` (xem `application.yml`)

## Chạy Backend

```bash
cd backend
./mvnw spring-boot:run
```

API chạy tại: **http://localhost:8090/api** (mặc định; có thể đổi qua `SERVER_PORT`)

Tài khoản mặc định (tạo lần đầu):

- **Admin:** `admin` / `admin123`

## Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Giao diện: **http://localhost:5173**

(Proxy Vite chuyển `/api` sang `http://localhost:8090`)

## Chức năng chính

### Quản trị viên (Admin)

- Quản lý phòng (thêm/sửa/xóa, cập nhật trạng thái)
- Quản lý loại phòng và giá
- Quản lý người dùng và phân quyền
- Dashboard thời gian thực (số phòng, doanh thu, tỉ lệ lấp phòng)
- Báo cáo doanh thu theo ngày/tháng/năm
- Cấu hình chính sách hủy phòng và hoàn tiền

### Lễ tân (Receptionist)

- Tạo đơn đặt phòng, check-in / check-out
- Thêm dịch vụ phát sinh vào hóa đơn
- Tìm kiếm khách hàng

### Khách hàng (Customer)

- Đăng ký / đăng nhập
- Xem danh sách phòng trống, tìm theo ngày và loại phòng
- Đặt phòng trực tuyến, thanh toán qua **payOS**
- Nhận email xác nhận (khi cấu hình SMTP)
- Hủy phòng theo chính sách hoàn tiền
- Xem lịch sử đặt phòng

## Cấu trúc dự án

```
hotel_royal/
├── backend/          # Spring Boot API
│   └── src/main/java/com/royallotushotel/
│       ├── config/   # Security, CORS, Exception
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── repository/
│       ├── security/ # JWT, UserPrincipal
│       └── service/
├── frontend/         # React (Vite)
│   └── src/
│       ├── api/       # Axios client
│       ├── components/
│       ├── context/  # AuthContext
│       └── pages/     # Admin, Receptionist, Customer
└── README.md
```

## Git

Khởi tạo và đẩy lên GitHub:

```bash
git init
git add .
git commit -m "Initial: Royal Lotus Hotel - Spring Boot + React"
git remote add origin <url-repo>
git push -u origin main
```
