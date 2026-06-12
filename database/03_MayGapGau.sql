CREATE TABLE MayGapGau (
    id INT IDENTITY(1,1) PRIMARY KEY,

    ten_may NVARCHAR(100) NOT NULL,

    loai_may NVARCHAR(100) NOT NULL,

    so_xu_tren_luot INT NOT NULL
        CHECK (so_xu_tren_luot > 0),

    trang_thai NVARCHAR(20) NOT NULL
        CHECK (trang_thai IN (N'DangHoatDong', N'HetGau', N'BaoTri')),

    id_gau_trong_may INT NOT NULL,

    so_luong_gau_hien_tai INT NOT NULL DEFAULT 0
        CHECK (so_luong_gau_hien_tai >= 0),

    CONSTRAINT FK_MayGapGau_GauBong
        FOREIGN KEY (id_gau_trong_may)
        REFERENCES GauBong(id)
);