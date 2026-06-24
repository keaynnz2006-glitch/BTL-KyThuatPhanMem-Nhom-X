CREATE TABLE IF NOT EXISTS MayGapGau (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_may VARCHAR(100) NOT NULL,
    loai_may VARCHAR(100), -- Máy gắp mini, máy gắp khổng lồ...
    so_xu_tren_luot INT DEFAULT 2,
    trang_thai VARCHAR(50) DEFAULT 'DangHoatDong', -- 'DangHoatDong', 'HetGau', 'BaoTri'
    id_gau_trong_may INT,
    so_luong_gau_hien_tai INT DEFAULT 0,
    CONSTRAINT FK_MayGapGau_GauBong FOREIGN KEY (id_gau_trong_may) REFERENCES GauBong(id)
);