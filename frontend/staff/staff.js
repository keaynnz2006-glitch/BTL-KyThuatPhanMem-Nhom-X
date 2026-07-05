const CORE_SERVICE_URL = 'http://localhost:3000';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');
const staffId = localStorage.getItem('user_id'); 

if (!token || role !== 'NhanVien') {
    alert('Bro không có quyền truy cập trang này!');
    window.location.href = '../login.html';
}

// 1. TẢI DANH SÁCH PHIẾU LÊN BẢNG GIAO DIỆN (Giữ nguyên của bro)
async function fetchExchangeTickets() {
    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/tickets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            const tbody = document.getElementById('ticket-list');
            if (!tbody) return;
            tbody.innerHTML = ''; 

            if (data.tickets.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Hiện tại chưa có phiếu đổi quà nào chờ duyệt!</td></tr>`;
                return;
            }

            data.tickets.forEach(ticket => {
                const dateFormatted = new Date(ticket.thoi_gian).toLocaleString('vi-VN');
                
                // Tạo đồng thời cả nút Duyệt và nút Hủy phiếu
                const actionHtml = `
                    <button class="btn-approve" onclick="approveTicket(${ticket.id})">✔ Duyệt cấp quà</button>
                    <button class="btn-reject" onclick="rejectTicket(${ticket.id})" style="background-color: #d63031; color: white; border: none; padding: 6px 12px; margin-left: 5px; border-radius: 4px; cursor: pointer; font-weight: bold;">❌ Hủy phiếu</button>
                `;

                // Chèn thêm cột hiển thị điểm hiện tại của khách hàng (${ticket.diem_hien_tai})
                const row = `
                    <tr>
                        <td>#${ticket.id}</td>
                        <td><strong>${ticket.ten_khach}</strong></td>
                        <td><span style="color: #2ed573; font-weight: bold;">${ticket.diem_hien_tai || 0} điểm</span></td>
                        <td><span style="color: #6c5ce7; font-weight: 600;">${ticket.ten_gau || 'Quà tặng'}</span></td>
                        <td><strong style="color: #ff7675;">-${ticket.so_diem_tieu_hao} điểm</strong></td>
                        <td>${dateFormatted}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        }
    } catch (error) {
        console.error('Lỗi lấy danh sách phiếu:', error);
    }
}

// 2. HÀM XỬ LÝ KHI BẤM DUYỆT PHIẾU (Giữ nguyên của bro)
async function approveTicket(ticketId) {
    if (!confirm(`Bro có chắc chắn xác nhận đã giao quà cho phiếu #${ticketId} không?`)) return;
    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/approve/${ticketId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ staffId: staffId })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            alert('🎉 Duyệt phiếu thành công!');
            fetchExchangeTickets(); 
        } else {
            alert('❌ Lỗi: ' + data.message); // Hiện thông báo chặn nếu khách bị hết điểm thực tế hoặc máy hết gấu
        }
    } catch (error) {
        alert('❌ Lỗi kết nối server!');
    }
}

// 3. HÀM XỬ LÝ KHI BẤM HỦY PHIẾU (Giữ nguyên của bro)
async function rejectTicket(ticketId) {
    if (!confirm(`Bro có chắc chắn muốn HỦY và XÓA hẳn phiếu #${ticketId} này không?`)) return;
    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/tickets/reject/${ticketId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok && data.success) {
            alert('❌ Đã hủy và xóa phiếu thành công!');
            fetchExchangeTickets(); 
        } else {
            alert('❌ Lỗi: ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi kết nối server khi hủy phiếu!');
    }
}

// ====================================================================
// 🔥 THÊM MỚI: CÁC HÀM LOGIC XỬ LÝ NẠP GẤU VÀO MÁY CHO NHÂN VIÊN
// ====================================================================

// 4. Tự động tải danh sách Máy và Gấu đổ vào các ô <select> khi nhân viên mở trang
async function initReplenishForm() {
    try {
        // Tải danh sách các máy gắp
        const resMachines = await fetch(`${CORE_SERVICE_URL}/api/staff/machines`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataMachines = await resMachines.json();
        if (resMachines.ok && dataMachines.success) {
            const selectMachine = document.getElementById('select-machine');
            if (selectMachine) {
                selectMachine.innerHTML = '<option value="">-- Chọn máy cần nạp --</option>';
                dataMachines.machines.forEach(m => {
                    selectMachine.innerHTML += `<option value="${m.id}">${m.ten_may} (ID: ${m.id})</option>`;
                });
            }
        }

        // Tải danh sách tất cả các loại gấu
        const resBears = await fetch(`${CORE_SERVICE_URL}/api/staff/bears`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataBears = await resBears.json();
        if (resBears.ok && dataBears.success) {
            const selectBear = document.getElementById('select-bear');
            if (selectBear) {
                selectBear.innerHTML = '<option value="">-- Chọn gấu bông --</option>';
                dataBears.bears.forEach(b => {
                    selectBear.innerHTML += `<option value="${b.id}">${b.ten_gau}</option>`;
                });
            }
        }
    } catch (error) {
        console.error('❌ Lỗi khởi tạo dữ liệu form nạp gấu:', error);
    }
}

// 5. Đón sự kiện khi nhân viên ấn nút "XÁC NHẬN NẠP" trên Form
document.getElementById('replenish-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Chặn hành vi load lại trang mặc định

    const idMay = document.getElementById('select-machine').value;
    const idGau = document.getElementById('select-bear').value;
    const soLuongThem = document.getElementById('input-quantity').value;

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/bears/replenish`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_may: idMay, id_gau: idGau, so_luong_them: soLuongThem })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(data.message);
            document.getElementById('input-quantity').value = ''; // Reset rỗng ô số lượng để tiện nhập lần sau
        } else {
            alert('❌ Lỗi: ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi kết nối server khi nạp gấu!');
    }
});

function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

// Chạy khởi tạo danh sách phiếu và danh sách lựa chọn của form nạp gấu
fetchExchangeTickets();
initReplenishForm();

// Quét định kỳ lại danh sách phiếu đổi quà sau mỗi 3 giây
setInterval(fetchExchangeTickets, 3000);