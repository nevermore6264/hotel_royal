-- Chạy một lần trên MySQL nếu insert tin_nhan_chat báo Incorrect string value (emoji / ký tự 4 byte).
-- Charset cột vẫn là utf8 cũ dù đã đổi URL JDBC — cần ALTER cột/bảng.

ALTER DATABASE hotel_royal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE tin_nhan_chat
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
