CREATE TABLE IF NOT EXISTS NguoiDung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tai_khoan VARCHAR(50) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(100) NOT NULL, -- MySQL dùng VARCHAR kèm định dạng utf8mb4 để lưu tiếng Việt
    so_dien_thoai VARCHAR(15),
    so_du_xu INT NOT NULL DEFAULT 0,
    vai_tro VARCHAR(20) NOT NULL 
        CHECK (vai_tro IN ('Admin', 'NhanVien', 'KhachHang'))
);
