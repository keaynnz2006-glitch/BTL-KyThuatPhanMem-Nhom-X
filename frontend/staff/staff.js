const CORE_SERVICE_URL = 'http://localhost:3000';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');

//  Kiểm tra quyền bảo mật hệ thống nghiêm ngặt
if (!token || role !== 'NhanVien') {
    alert('Bro không có quyền truy cập trang này!');
    window.location.href = 'login.html';
}

// Tải danh sách phiếu từ DB lên bảng
async function fetchExchangeTickets() {
    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/tickets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            const tbody = document.getElementById('ticket-list');
            tbody.innerHTML = ''; 

            if (data.tickets.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6">Hiện tại chưa có phiếu đổi quà nào!</td></tr>`;
                return;
            }

            data.tickets.forEach(ticket => {
                const dateFormatted = new Date(ticket.thoi_gian).toLocaleString('vi-VN');
                const isApproved = ticket.id_nhan_vien_duyet !== null; // Kiểm tra đã duyệt chưa
                
                const actionHtml = isApproved
                    ? `<span class="status-badge status-done">Đã giao quà</span>`
                    : `<button class="btn-approve" onclick="approveTicket(${ticket.id})">Duyệt cấp quà</button>`;

                const row = `
                    <tr>
                        <td>#${ticket.id}</td>
                        <td>Khách #${ticket.id_khach_hang}</td>
                        <td><strong>${ticket.so_diem_tieu_hao} điểm</strong></td>
                        <td>${dateFormatted}</td>
                        <td>${ticket.id_nhan_vien_duyet ? `NV #${ticket.id_nhan_vien_duyet}` : '---'}</td>
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

// Hàm gửi yêu cầu duyệt phiếu lên backend
async function approveTicket(ticketId) {
    if (!confirm(`Bro có chắc chắn xác nhận đã giao quà cho phiếu #${ticketId} không?`)) return;

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/approve/${ticketId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            alert('🎉 Duyệt phiếu thành công!');
            fetchExchangeTickets(); // Làm mới lại bảng
        } else {
            alert('❌ Lỗi: ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi kết nối server!');
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Chạy tải dữ liệu khi trang sẵn sàng
fetchExchangeTickets();