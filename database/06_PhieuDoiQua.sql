CREATE TABLE PhieuDoiQua (
    id INT IDENTITY(1,1) PRIMARY KEY,

    id_khach_hang INT NOT NULL,

    id_nhan_vien_duyet INT NOT NULL,

    id_gau_muon_doi INT NOT NULL,

    so_diem_tieu_hao INT NOT NULL
        CHECK (so_diem_tieu_hao > 0),

    thoi_gian DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_PhieuDoiQua_KhachHang
        FOREIGN KEY (id_khach_hang)
        REFERENCES NguoiDung(id),

    CONSTRAINT FK_PhieuDoiQua_NhanVien
        FOREIGN KEY (id_nhan_vien_duyet)
        REFERENCES NguoiDung(id),

    CONSTRAINT FK_PhieuDoiQua_GauBong
        FOREIGN KEY (id_gau_muon_doi)
        REFERENCES GauBong(id)
);