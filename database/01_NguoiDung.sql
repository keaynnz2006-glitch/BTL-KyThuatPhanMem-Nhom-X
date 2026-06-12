CREATE TABLE NguoiDung (
    id INT IDENTITY(1,1) PRIMARY KEY,

    tai_khoan VARCHAR(50) NOT NULL UNIQUE,

    mat_khau VARCHAR(255) NOT NULL,

    ho_ten NVARCHAR(100) NOT NULL,

    so_dien_thoai VARCHAR(15),

    so_du_xu INT NOT NULL DEFAULT 0,

    vai_tro VARCHAR(20) NOT NULL
        CHECK (vai_tro IN ('Admin', 'NhanVien', 'KhachHang'))
);