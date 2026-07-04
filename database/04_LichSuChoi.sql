CREATE TABLE IF NOT EXISTS LichSuChoi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_khach_hang INT NOT NULL,
    id_may INT NOT NULL,
    id_gau_trung INT NULL, 
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_LichSuChoi_KhachHang FOREIGN KEY (id_khach_hang) REFERENCES NguoiDung(id),
    CONSTRAINT FK_LichSuChoi_May FOREIGN KEY (id_may) REFERENCES MayGapGau(id),
  
    CONSTRAINT FK_LichSuChoi_GauTrung FOREIGN KEY (id_gau_trung) REFERENCES GauBong(id)
);