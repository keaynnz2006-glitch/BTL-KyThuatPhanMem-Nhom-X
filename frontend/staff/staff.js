const CORE_SERVICE_URL = 'http://localhost:3000';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');
const staffId = localStorage.getItem('user_id'); 

if (!token || role !== 'NhanVien') {
    alert('Bro không có quyền truy cập trang này!');
    window.location.href = '../login.html';
}

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
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #999;">Hiện tại chưa có phiếu đổi quà nào chờ duyệt!</td></tr>`;
                return;
            }

            data.tickets.forEach(ticket => {
                const dateFormatted = new Date(ticket.thoi_gian).toLocaleString('vi-VN');
                const actionHtml = `<button class="btn-approve" onclick="approveTicket(${ticket.id})">✔ Duyệt cấp quà</button>`;

                const row = `
                    <tr>
                        <td>#${ticket.id}</td>
                        <td><strong>${ticket.ten_khach}</strong></td>
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
            alert('❌ Lỗi: ' + data.message);
        }
    } catch (error) {
        alert('❌ Lỗi kết nối server!');
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

fetchExchangeTickets();
setInterval(fetchExchangeTickets, 3000); // 👈 Tự quét sau 3 giây để cập nhật thời gian thực