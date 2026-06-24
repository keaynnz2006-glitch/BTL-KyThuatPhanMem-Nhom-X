CREATE TABLE IF NOT EXISTS HoaDonNapXu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_khach_hang INT NOT NULL,
    so_tien_vnd DECIMAL(18,2) NOT NULL,
    so_xu_nhan INT NOT NULL,
    phuong_thuc VARCHAR(50) DEFAULT 'Momo', -- 'Momo', 'VNPAY', 'TienMat'
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(20) DEFAULT 'ThanhCong', -- 'ThanhCong', 'ThatBai'
    CONSTRAINT FK_HoaDonNapXu_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES NguoiDung(id)
);