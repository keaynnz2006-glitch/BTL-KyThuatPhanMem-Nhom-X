const StaffModel = require('../models/staffModel');
const db = require('../config/database'); 


exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await StaffModel.getAllTickets();
        return res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error(" Lỗi lấy danh sách phiếu:", error);
        return res.status(500).json({ success: false, message: 'Không thể lấy danh sách phiếu!' });
    }
};


exports.approveTicket = async (req, res) => {
    const ticketId = req.params.id; 
    const { staffId } = req.body; 
    const finalStaffId = staffId || req.user?.id || 1; 

   
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [ticketRows] = await connection.query('SELECT * FROM phieudoiqua WHERE id = ?', [ticketId]);
        const ticket = ticketRows[0];
        if (!ticket) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu đổi quà này bro!' });
        }

        if (ticket.id_nhan_vien_duyet !== null) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Phiếu này đã được duyệt cấp quà từ trước rồi bro!' });
        }

        const idKhachHang = ticket.id_khach_hang;
        const idGauMuonDoi = ticket.id_gau_muon_doi; 
        const soDiemPhieuNay = parseInt(ticket.so_diem_tieu_hao || 0);

       
        const [bearInfo] = await connection.query('SELECT ten_gau, so_luong_kho FROM gaubong WHERE id = ?', [idGauMuonDoi]);
        if (bearInfo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Loại quà tặng/gấu bông này không tồn tại trong hệ thống!' });
        }
        
        const tenGau = bearInfo[0].ten_gau;
        const khoTongHienTai = parseInt(bearInfo[0].so_luong_kho || 0);

       
        const cleanString = (str) => {
            return str.normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/đ/g, "d")
                      .replace(/Đ/g, "d")
                      .toLowerCase();
        };

        // ĐIỀU KIỆN NHẬN BIẾT GẤU SIÊU KHỔNG LỒ (Check ID 7,8,9 trong database hoặc check tên chứa chữ "khong lo")
        const isSieuKhongLo = [7, 8, 9].includes(parseInt(idGauMuonDoi)) || 
                              cleanString(tenGau).includes('khong lo');
        
        let idMayCanTru = null;

       
        if (isSieuKhongLo) {
            // TRƯỜNG HỢP A: Gấu khổng lồ -> Kiểm tra và trừ trực tiếp tại KHO TỔNG
            if (khoTongHienTai <= 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: ` Không thể duyệt! Gấu siêu khổng lồ [${tenGau}] trong kho tổng đã hết sạch, vui lòng nhập thêm hàng vào kho tổng!` 
                });
            }
            
            // Tiến hành trừ 1 con ở kho tổng (bảng gaubong)
            await connection.query(
                `UPDATE gaubong SET so_luong_kho = so_luong_kho - 1 WHERE id = ?`,
                [idGauMuonDoi]
            );
        } else {
            // TRƯỜNG HỢP B: Gấu thường -> Tìm xem máy gắp nào còn hàng (> 0) để chuẩn bị trừ kho trong máy
            const [machineBearRows] = await connection.query(
                `SELECT id_may, so_luong_hien_tai 
                 FROM gautrongmay 
                 WHERE id_gau = ? AND so_luong_hien_tai > 0 
                 ORDER BY so_luong_hien_tai DESC 
                 LIMIT 1`, 
                [idGauMuonDoi]
            );

            if (machineBearRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: ` Không thể duyệt! Loại gấu thường [${tenGau}] ở tất cả các máy gắp đã hết sạch, hãy nạp thêm gấu vào máy!` 
                });
            }
            
            idMayCanTru = machineBearRows[0].id_may;

            // Tiến hành trừ 1 con tại máy gắp (bảng gautrongmay)
            await connection.query(
                `UPDATE gautrongmay 
                 SET so_luong_hien_tai = so_luong_hien_tai - 1 
                 WHERE id_may = ? AND id_gau = ?`, 
                [idMayCanTru, idGauMuonDoi]
            );
        }

        // Bước 3: KIỂM TRA ĐIỂM KHÁCH HÀNG (Đảm bảo an toàn số dư điểm thực tế)
        const [pointsRows] = await connection.query(
            `SELECT COALESCE(SUM(g.gia_tri_diem), 0) as tong_trung 
             FROM lichsuchoi l 
             JOIN gaubong g ON l.id_gau_trung = g.id 
             WHERE l.id_khach_hang = ?`, 
            [idKhachHang]
        );
        const tongTrung = parseInt(pointsRows[0].tong_trung || 0);

        const [spentRows] = await connection.query(
            `SELECT COALESCE(SUM(so_diem_tieu_hao), 0) as da_tieu 
             FROM phieudoiqua 
             WHERE id_khach_hang = ? AND id_nhan_vien_duyet IS NOT NULL`, 
            [idKhachHang]
        );
        const tongDaTieu = parseInt(spentRows[0].da_tieu || 0);

        const diemThucTeConLai = tongTrung - tongDaTieu;

        if (diemThucTeConLai < soDiemPhieuNay) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: `Khách chỉ còn [${diemThucTeConLai} điểm] thực tế. Không đủ [${soDiemPhieuNay} điểm] để duyệt thêm phiếu này!` 
            });
        }

        // Bước 4: Cập nhật ID nhân viên vào phiếu đổi quà (Xác nhận duyệt)
        await connection.query('UPDATE phieudoiqua SET id_nhan_vien_duyet = ? WHERE id = ?', [finalStaffId, ticketId]);

        // Xác nhận hoàn tất Transaction lưu thay đổi
        await connection.commit();

        // Trả về câu thông báo động tương ứng với kho bị trừ
        if (isSieuKhongLo) {
            return res.status(200).json({ 
                success: true, 
                message: ` Duyệt cấp quà thành công! Đã trừ 1 gấu [${tenGau}] trực tiếp từ KHO TỔNG của cửa hàng.` 
            });
        } else {
            return res.status(200).json({ 
                success: true, 
                message: ` Duyệt cấp quà thành công! Đã tự động trừ 1 gấu thường tại Máy số #${idMayCanTru}.` 
            });
        }

    } catch (error) {
        await connection.rollback();
        console.error(" Lỗi cập nhật duyệt phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi duyệt phiếu!' });
    } finally {
        connection.release();
    }
};

// 3. Nhân viên hủy bỏ phiếu đổi quà
exports.rejectTicket = async (req, res) => {
    const ticketId = req.params.id; 

    try {
        const [result] = await db.query(
            'DELETE FROM phieudoiqua WHERE id = ? AND id_nhan_vien_duyet IS NULL', 
            [ticketId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: 'Không thể hủy phiếu hoặc phiếu đã được duyệt rồi bro!' });
        }

        return res.status(200).json({ success: true, message: ' Đã hủy phiếu đổi quà thành công!' });
    } catch (error) {
        console.error(" Lỗi khi hủy phiếu:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi hủy phiếu!' });
    }
};

// 4. Lấy danh sách máy hoạt động đổ vào <select> ở giao diện
exports.getAllMachines = async (req, res) => {
    try {
        const [machines] = await db.query('SELECT id, ten_may FROM maygapgau WHERE trang_thai = "Hoạt động"');
        return res.status(200).json({ success: true, machines });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Lấy danh sách tất cả loại gấu đổ vào <select> ở giao diện
exports.getAllBears = async (req, res) => {
    try {
        const [bears] = await db.query('SELECT id, ten_gau FROM gaubong');
        return res.status(200).json({ success: true, bears });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Xử lý nạp gấu vào máy gắp (Tự động CỘNG DỒN vào máy và TRỪ KHO TỔNG)
exports.replenishBearToMachine = async (req, res) => {
    const { id_may, id_gau, so_luong_them } = req.body;
    const qty = parseInt(so_luong_them);

    if (!id_may || !id_gau || !qty || qty <= 0) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ và hợp lệ các thông tin bro ơi!' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [bearStock] = await connection.query(
            'SELECT so_luong_kho, ten_gau FROM gaubong WHERE id = ?',
            [id_gau]
        );

        if (bearStock.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy loại quà này trong kho tổng!' });
        }

        const currentStock = parseInt(bearStock[0].so_luong_kho || 0);
        const tenGau = bearStock[0].ten_gau;

        if (currentStock < qty) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false, 
                message: ` Kho tổng chỉ còn [${currentStock} con ${tenGau}]. Không đủ số lượng để nạp ${qty} con vào máy!` 
            });
        }

        await connection.query(
            'UPDATE gaubong SET so_luong_kho = so_luong_kho - ? WHERE id = ?',
            [qty, id_gau]
        );

        const queryReplenish = `
            INSERT INTO gautrongmay (id_may, id_gau, so_luong_hien_tai, ty_le_trung)
            VALUES (?, ?, ?, 0.3)
            ON DUPLICATE KEY UPDATE so_luong_hien_tai = so_luong_hien_tai + ?
        `;
        await connection.query(queryReplenish, [id_may, id_gau, qty, qty]);

        await connection.commit();

        return res.status(200).json({ 
            success: true, 
            message: ` Thành công! Đã nạp ${qty} con [${tenGau}] vào Máy #${id_may} và trừ ${qty} con ở kho tổng.` 
        });

    } catch (error) {
        await connection.rollback();
        console.error(" Lỗi nạp gấu vào máy:", error.message);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống, không thể nạp gấu vào máy!' });
    } finally {
        connection.release();
    }
};

// 7. API lấy danh sách chi tiết gấu trong máy phục vụ khối real-time
exports.getMachinesInventory = async (req, res) => {
    try {
        const rows = await StaffModel.getMachinesAndToys();
        
        const machinesMap = {};
        
        rows.forEach(row => {
            if (!machinesMap[row.id_may]) {
                machinesMap[row.id_may] = {
                    id_may: row.id_may,
                    ten_may: row.ten_may,
                    trang_thai: row.trang_thai,
                    danh_sach_gau: []
                };
            }
            if (row.id_gau) {
                machinesMap[row.id_may].danh_sach_gau.push({
                    id_gau: row.id_gau,
                    ten_gau: row.ten_gau,
                    so_luong: row.so_luong_hien_tai
                });
            }
        });

        const finalData = Object.values(machinesMap);
        return res.status(200).json({ success: true, data: finalData });
    } catch (error) {
        console.error(" Lỗi khi tổng hợp kho gấu trong máy:", error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tải kho gấu của máy!' });
    }
};