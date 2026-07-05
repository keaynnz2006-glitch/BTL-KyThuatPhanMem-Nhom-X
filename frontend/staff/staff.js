const CORE_SERVICE_URL = 'http://localhost:3000';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');
const staffId = localStorage.getItem('user_id'); 

if (!token || role !== 'NhanVien') {
    alert('Bro không có quyền truy cập trang này!');
    window.location.href = '../login.html';
}

// 1. TẢI DANH SÁCH PHIẾU LÊN BẢNG GIAO DIỆN
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

// 2. HÀM XỬ LÝ KHI BẤM DUYỆT PHIẾU
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
            alert('❌ Lỗi: ' + data.message); // Hiện thông báo chặn nếu khách bị hết điểm thực tế
        }
    } catch (error) {
        alert('❌ Lỗi kết nối server!');
    }
}

// 3. HÀM XỬ LÝ KHI BẤM HỦY PHIẾU
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

function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

fetchExchangeTickets();
setInterval(fetchExchangeTickets, 3000); // Quét lại danh sách sau mỗi 3 giây