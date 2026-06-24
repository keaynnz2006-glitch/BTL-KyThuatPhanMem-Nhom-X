CREATE TABLE IF NOT EXISTS LichSuChoi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_khach_hang INT NOT NULL,
    id_may INT NOT NULL,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP, -- Đổi sang CURRENT_TIMESTAMP của MySQL
    ket_qua BOOLEAN DEFAULT FALSE, -- True nếu gắp trúng, False nếu trượt
    CONSTRAINT FK_LichSuChoi_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES NguoiDung(id),
    CONSTRAINT FK_LichSuChoi_May FOREIGN KEY (id_may) REFERENCES MayGapGau(id)
);