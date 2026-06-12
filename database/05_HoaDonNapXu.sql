CREATE TABLE HoaDonNapXu (
    id INT IDENTITY(1,1) PRIMARY KEY,

    id_khach_hang INT NOT NULL,

    so_tien_vnd DECIMAL(18,2) NOT NULL
        CHECK (so_tien_vnd > 0),

    so_xu_nhan INT NOT NULL
        CHECK (so_xu_nhan > 0),

    phuong_thuc VARCHAR(20) NOT NULL
        CHECK (phuong_thuc IN ('Momo', 'VNPAY', 'TienMat')),

    thoi_gian DATETIME NOT NULL DEFAULT GETDATE(),

    trang_thai VARCHAR(20) NOT NULL
        CHECK (trang_thai IN ('ThanhCong', 'ThatBai')),

    CONSTRAINT FK_HoaDonNapXu_NguoiDung
        FOREIGN KEY (id_khach_hang)
        REFERENCES NguoiDung(id)
);