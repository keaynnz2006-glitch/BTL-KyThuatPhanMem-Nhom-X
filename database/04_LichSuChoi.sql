CREATE TABLE LichSuChoi (
    id INT IDENTITY(1,1) PRIMARY KEY,

    id_khach_hang INT NOT NULL,

    id_may INT NOT NULL,

    thoi_gian DATETIME NOT NULL DEFAULT GETDATE(),

    ket_qua BIT NOT NULL,

    CONSTRAINT FK_LichSuChoi_NguoiDung
        FOREIGN KEY (id_khach_hang)
        REFERENCES NguoiDung(id),

    CONSTRAINT FK_LichSuChoi_MayGapGau
        FOREIGN KEY (id_may)
        REFERENCES MayGapGau(id)
);