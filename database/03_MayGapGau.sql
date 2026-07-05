-- 1. Bảng quản lý thông tin chung của máy (Đã lược bỏ các trường liên kết đơn lẻ)
CREATE TABLE IF NOT EXISTS MayGapGau (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_may VARCHAR(100) NOT NULL,
    loai_may VARCHAR(100), -- Máy gắp mini, máy gắp khổng lồ...
    so_xu_tren_luot INT DEFAULT 2,
    trang_thai VARCHAR(50) DEFAULT 'DangHoatDong' -- 'DangHoatDong', 'HetGau', 'BaoTri'
);


CREATE TABLE IF NOT EXISTS GauTrongMay (
    id_may INT NOT NULL,
    id_gau INT NOT NULL,
    so_luong_hien_tai INT DEFAULT 0,
    ty_le_trung FLOAT DEFAULT 0.1,    
    
    PRIMARY KEY (id_may, id_gau),
    CONSTRAINT FK_GauTrongMay_May FOREIGN KEY (id_may) REFERENCES MayGapGau(id),
    CONSTRAINT FK_GauTrongMay_Gau FOREIGN KEY (id_gau) REFERENCES GauBong(id)
);