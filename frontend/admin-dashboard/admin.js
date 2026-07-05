const API_URL = 'http://localhost:3000/api/admin/stats';
const TOY_API_URL = 'http://localhost:3000/api/admin/toys'; // API quản lý gấu bông riêng biệt
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');

// 🛡️ Kiểm tra quyền truy cập hệ thống bảo mật
if (!token || role !== 'Admin') {
    alert('Bro không có quyền truy cập vùng này!');
    window.location.href = '../login.html'; 
}
// 1. QUẢN LÝ SỐ LIỆU DASHBOARD REAL-TIME

async function loadDashboardData() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Nạp số liệu tổng quan vào các ô
            document.getElementById('stat-revenue').innerText = Number(data.stats.totalRevenue || 0).toLocaleString('vi-VN') + 'đ';
            document.getElementById('stat-stuffed').innerText = (data.stats.totalStuffed || 0) + ' con';
            document.getElementById('stat-machines').innerText = (data.stats.totalMachines || 0) + ' máy';

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
                        <td><strong style="color: #20bf6b;">+${Number(order.so_tien_vnd || 0).toLocaleString('vi-VN')}đ</strong></td>
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

// 2. TÍNH NĂNG THÊM / BỚT GẤU TRONG KHO


// Hàm lấy danh sách gấu đập vào bảng quản lý kho gấu
async function loadToyInventory() {
    try {
        const response = await fetch(TOY_API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Tìm bảng danh sách gấu 
        const tbody = document.getElementById('toy-inventory-list');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!data.success || data.toys.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">Kho gấu đang trống trơn bro ơi!</td></tr>`;
            return;
        }

       data.toys.forEach(toy => {
    const row = `
        <tr>
            <td>#${toy.id}</td>
            <td><strong>${toy.ten_gau}</strong></td>
            <td>${toy.gia_tri_diem} điểm</td>
            <td><strong style="color: #ff9f43;">${toy.so_luong || 0} con</strong></td> <td>
                <button onclick="handleDeleteToy(${toy.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">
                     Bớt (Xóa)
                </button>
            </td> </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
});
    } catch (error) {
        console.error('Lỗi khi tải danh sách kho gấu bông:', error);
    }
}

// Hàm xử lý gửi dữ liệu THÊM GẤU 

async function handleAddToy(event) {
    if (event) event.preventDefault(); // Chặn reload trang

    const nameInput = document.getElementById('input-toy-name');
    const pointInput = document.getElementById('input-toy-point');
    const quantityInput = document.getElementById('input-toy-quantity'); // Ô nhập số lượng

    const ten_gau = nameInput ? nameInput.value.trim() : '';
    const gia_tri_diem = pointInput ? parseInt(pointInput.value) : 0;
    const so_luong_kho = quantityInput ? parseInt(quantityInput.value) : 0; // Đổi tên thành so_luong_kho cho đồng bộ

    if (!ten_gau || !gia_tri_diem || so_luong_kho <= 0) {
        alert('Bro nhập thiếu Tên gấu, Điểm đổi hoặc Số lượng phải lớn hơn 0 nhé!');
        return;
    }

    try {
        const response = await fetch(`${TOY_API_URL}/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
           
            body: JSON.stringify({ 
                ten_gau, 
                gia_tri_diem, 
                so_luong_kho, 
                hinh_anh: 'default.png' 
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert(' Đã thêm gấu vào kho thành công !');
            if (nameInput) nameInput.value = '';
            if (pointInput) pointInput.value = '';
            if (quantityInput) quantityInput.value = ''; 
            
           
            loadDashboardData();
            loadToyInventory();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (error) {
        console.error('Lỗi thêm gấu:', error);
    }
}

// Hàm xử lý BỚT (XÓA) GẤU KHỎI KHO
window.handleDeleteToy = async function(id) {
    if (!confirm(`Bro có chắc chắn muốn BỚT (XÓA) mã gấu #${id} này khỏi kho không?`)) return;

    try {
        const response = await fetch(`${TOY_API_URL}/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('🗑️ Đã bớt gấu thành công!');
            
        
            loadDashboardData();
            loadToyInventory();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (error) {
        console.error('Lỗi xóa gấu:', error);
    }
}


// KHỞI CHẠY HỆ THỐNG3. 

function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

// Kích hoạt chạy dữ liệu khi trang sẵn sàng
loadDashboardData();
loadToyInventory(); // Tải kho gấu bông luôn

// Real-time cập nhật số liệu tổng quan sau 3 giây
setInterval(loadDashboardData, 3000);