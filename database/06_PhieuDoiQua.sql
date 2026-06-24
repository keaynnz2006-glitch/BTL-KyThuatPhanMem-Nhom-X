CREATE TABLE IF NOT EXISTS PhieuDoiQua (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_khach_hang INT NOT NULL,
    id_nhan_vien_duyet INT NOT NULL,
    id_gau_muon_doi INT NOT NULL,
    so_diem_tieu_hao INT NOT NULL,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_PhieuDoiQua_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES NguoiDung(id),
    CONSTRAINT FK_PhieuDoiQua_NhanVien FOREIGN KEY (id_nhan_vien_duyet) REFERENCES NguoiDung(id),
    CONSTRAINT FK_PhieuDoiQua_GauBong FOREIGN KEY (id_gau_muon_doi) REFERENCES GauBong(id)
);