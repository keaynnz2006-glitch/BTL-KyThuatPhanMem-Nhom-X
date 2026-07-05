const API_URL = 'http://localhost:3000/api/admin/stats';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');

// 🛡️ Kiểm tra quyền truy cập hệ thống bảo mật
if (!token || role !== 'Admin') {
    alert('Bro không có quyền truy cập vùng này!');
    window.location.href = '../login.html'; 
}

// Gọi API Backend lấy số liệu đổ vào giao diện HTML
async function loadDashboardData() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Nạp số liệu tổng quan vào các ô
            document.getElementById('stat-revenue').innerText = Number(data.stats.totalRevenue).toLocaleString('vi-VN') + 'đ';
            document.getElementById('stat-stuffed').innerText = data.stats.totalStuffed + ' con';
            document.getElementById('stat-machines').innerText = data.stats.totalMachines + ' máy';

            // Nạp bảng dữ liệu nạp xu gần đây
            const tbody = document.getElementById('recent-orders-list');
            tbody.innerHTML = '';

            if (data.recentOrders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4">Hệ thống chưa có đơn nạp xu nào!</td></tr>`;
                return;
            }

            data.recentOrders.forEach(order => {
                const timeStr = new Date(order.thoi_gian).toLocaleString('vi-VN');
                const row = `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.ho_ten}</td>
                       <td><strong style="color: #20bf6b;">+${Number(order.so_tien_vnd).toLocaleString('vi-VN')}đ</strong></td>
                        <td>${timeStr}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

// Kích hoạt hàm chạy dữ liệu khi trang web sẵn sàng
loadDashboardData(); // Chạy lần đầu khi mở trang


setInterval(loadDashboardData, 3000);