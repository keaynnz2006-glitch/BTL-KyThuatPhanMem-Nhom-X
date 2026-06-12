CREATE TABLE GauBong (
    id INT IDENTITY(1,1) PRIMARY KEY,

    ten_gau NVARCHAR(100) NOT NULL,

    hinh_anh VARCHAR(255),

    gia_tri_diem INT NOT NULL
        CHECK (gia_tri_diem >= 0),

    so_luong_kho INT NOT NULL DEFAULT 0
        CHECK (so_luong_kho >= 0)
);