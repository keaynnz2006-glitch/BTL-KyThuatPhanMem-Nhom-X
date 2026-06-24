CREATE TABLE IF NOT EXISTS GauBong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_gau VARCHAR(100) NOT NULL,
    hinh_anh VARCHAR(255),
    gia_tri_diem INT DEFAULT 10,
    so_luong_kho INT DEFAULT 0
);