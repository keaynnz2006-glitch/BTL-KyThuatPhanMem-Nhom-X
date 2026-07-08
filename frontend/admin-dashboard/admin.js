const API_URL = 'http://localhost:3000/api/admin/stats';
const TOY_API_URL = 'http://localhost:3000/api/admin/toys'; 
const REVENUE_API_URL = 'http://localhost:3000/api/admin/revenue-report';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');


if (!token || role !== 'Admin') {
    alert('Bro không có quyền truy cập vùng này!');
    window.location.href = '../login.html'; 
}


// QUẢN LÝ SỐ LIỆU DASHBOARD REAL-TIME

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


async function loadRevenueReport(type, btnElement) {
    // Nếu có truyền vào nút bấm thì cập nhật class CSS active, không thì thôi
    if (btnElement) {
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active-filter'));
        btnElement.classList.add('active-filter');
    }

    const tbody = document.getElementById('revenue-table-body');
    if (!tbody) return; // Tránh lỗi nếu chưa kịp chèn HTML bảng vào giao diện
    
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 30px;">⏳ Đang xử lý dữ liệu tài chính...</td></tr>`;

    try {
        const response = await fetch(`${REVENUE_API_URL}?type=${type}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 30px; color: #fab1a0;">Chưa có dữ liệu doanh thu cho mốc thời gian này!</td></tr>`;
                return;
            }

            tbody.innerHTML = ''; // Xóa thông báo cũ đi để ghi dữ liệu mới
            
            result.data.forEach(item => {
                // Định dạng số tiền VND
                const formattedRevenue = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(item.tong_doanh_thu);

                const row = `
                    <tr style="border-bottom: 1px solid #f1f2f6;">
                        <td style="padding: 15px; font-weight: 600; color: #2d3436;">${item.moc_thoi_gian}</td>
                        <td style="padding: 15px; color: #636e72;">
                            <span style="background: #e8f0fe; color: #1a73e8; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                                ${item.so_luot_giao_dich} đơn hàng
                            </span>
                        </td>
                        <td style="padding: 15px; text-align: right; font-weight: bold; color: #00b894; font-size: 16px;">
                            ${formattedRevenue}
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 30px; color: #d63031;"> Lỗi: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Lỗi gọi API doanh thu:", error);
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 30px; color: #d63031;"> Không thể kết nối tới máy chủ Backend!</td></tr>`;
    }
}


async function loadToyInventory() {
    try {
        const response = await fetch(TOY_API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

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
                    <td><strong style="color: #ff9f43;">${toy.so_luong || 0} con</strong></td> 
                    <td>
                        <button onclick="handleDeleteToy(${toy.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">
                             Bớt (Xóa)
                        </button>
                    </td> 
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách kho gấu bông:', error);
    }
}

async function handleAddToy(event) {
    if (event) event.preventDefault(); 

    const nameInput = document.getElementById('input-toy-name');
    const pointInput = document.getElementById('input-toy-point');
    const quantityInput = document.getElementById('input-toy-quantity'); 

    const ten_gau = nameInput ? nameInput.value.trim() : '';
    const gia_tri_diem = pointInput ? parseInt(pointInput.value) : 0;
    const so_luong_kho = quantityInput ? parseInt(quantityInput.value) : 0; 

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
            alert('🎉 Đã thêm gấu vào kho thành công!');
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

window.handleDeleteToy = async function(id) {
    if (!confirm(`Bro có chắc chắn muốn BỚT (XÓA) mã gấu #${id} này khỏi kho không?`)) return;

    try {
        const response = await fetch(`${TOY_API_URL}/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            alert('Đã bớt gấu thành công!');
            loadDashboardData();
            loadToyInventory();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (error) {
        console.error('Lỗi xóa gấu:', error);
    }
}


//  2. TÍNH NĂNG MỚI: TẢI DANH SÁCH THÀNH VIÊN THỰC TẾ RA BẢNG

async function loadUserManagement() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/users', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const tbody = document.getElementById('user-management-list');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!data.success || !data.users || data.users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Không có thành viên nào!</td></tr>`;
            return;
        }

        data.users.forEach(user => {
            let roleBadge = '';
            if (user.vai_tro === 'Admin') {
                roleBadge = `<span style="background: #fed330; color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Admin</span>`;
            } else if (user.vai_tro === 'NhanVien') {
                roleBadge = `<span style="background: #45aaf2; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Nhân Viên</span>`;
            } else {
                roleBadge = `<span style="background: #a5b1c2; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Khách Hàng</span>`;
            }

            const row = `
                <tr>
                    <td><strong>#${user.id}</strong></td>
                    <td style="text-align: left; padding-left: 15px;">${user.ho_ten}</td>
                    <td><code>${user.tai_khoan}</code></td>
                    <td>${roleBadge}</td>
                    <td>
                        <select onchange="handleUpdateUserRole(${user.id}, this.value)" style="padding: 5px 10px; border-radius: 4px; border: 1px solid #ccc; font-size: 13px; cursor: pointer; background: white;">
                            <option value="">-- Cấp quyền --</option>
                            <option value="KhachHang" ${user.vai_tro === 'KhachHang' ? 'disabled' : ''}>Khách Hàng</option>
                            <option value="NhanVien" ${user.vai_tro === 'NhanVien' ? 'disabled' : ''}>Nhân Viên</option>
                            <option value="Admin" ${user.vai_tro === 'Admin' ? 'disabled' : ''}>Admin</option>
                        </select>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Lỗi tải danh sách người dùng:', error);
    }
}




window.handleUpdateUserRole = async function(targetUserId, newRole) {
    if (!newRole) return;

    if (!confirm(`Bro có chắc muốn đổi vai trò của tài khoản #${targetUserId} thành [${newRole}] không?`)) {
        loadUserManagement();
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/admin/update-role', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                target_user_id: targetUserId,
                new_role: newRole
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('🎉 ' + data.message);
            loadUserManagement(); 
        } else {
            alert('Lỗi: ' + data.message);
            loadUserManagement();
        }
    } catch (error) {
        console.error('Lỗi cập nhật phân quyền:', error);
        alert('Không thể kết nối đến server backend!');
        loadUserManagement();
    }
}


function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}


loadDashboardData();
loadToyInventory(); 
loadUserManagement(); // Gọi danh sách user mới

loadRevenueReport('day', null);

// Đồng bộ real-time số liệu dashboard cũ của bro
setInterval(loadDashboardData, 3000);