
// 1. CẤU HÌNH CỔNG API CHO CÁC SERVICE
const CORE_SERVICE_URL = 'http://localhost:3000/api';       // Xử lý Thành viên, Số dư, Nạp tiền
const OPERATION_SERVICE_URL = 'http://localhost:3001/api';  // Xử lý Danh sách máy, Lượt chơi Gacha

const userId = localStorage.getItem('user_id');
const token = localStorage.getItem('user_token'); //  Sử dụng duy nhất user_token toàn file
let selectedPaymentMethod = 'momo'; // Mặc định chọn ví momo ở giao diện
// 2. BẢO VỆ TRANG (ROUTE GUARD)
// ==========================================
if (!token || !userId) {
    alert('Bro vui lòng đăng nhập trước!');
    window.location.href = 'login.html';
}
// 3. LOGIC HIỂN THỊ THÔNG TIN NGƯỜI DÙNG
// ==========================================
async function loadUserDashboard() {
    try {
        const response = await fetch(`${CORE_SERVICE_URL}/user/balance`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById('user-display').innerText = `Xin chào, ${data.fullName}!`;
            document.getElementById('coin-balance').innerText = `💰 ${data.coins} Xu`;
        } else {
            // Token hết hạn hoặc không hợp lệ -> sút ra trang login
            logout();
        }
    } catch (error) {
        console.error('Không kết nối được server lấy số dư:', error);
    }
}
// 4. LOGIC TƯƠNG TÁC GIAO DIỆN NẠP TIỀN
function selectPreset(amount, element) {
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('recharge-amount').value = amount;
}

function clearPresets() {
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
}

function selectPayment(method, element) {
    document.querySelectorAll('.method-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    selectedPaymentMethod = method;
}

async function handleRechargeNew() {
    const amountVnd = document.getElementById('recharge-amount').value;
    if (!amountVnd || amountVnd < 1000) {
        alert('Vui lòng nhập số tiền hợp lệ (tối thiểu 1.000 VND)!');
        return;
    }

    let methodBackend = 'Momo';
    if (selectedPaymentMethod === 'vnpay') methodBackend = 'VNPAY';
    if (selectedPaymentMethod === 'zalopay') methodBackend = 'ZaloPay';

    const confirmed = confirm(`Bạn có chắc chắn muốn thanh toán ${parseInt(amountVnd).toLocaleString()} VND qua Ví ${methodBackend} không?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/user/recharge`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                userId: parseInt(userId), 
                amountVnd: parseInt(amountVnd),
                phuongThuc: methodBackend
            })
        });
        const data = await response.json();

        if (response.ok) {
            alert(`🎉 [Ví ${methodBackend}] ${data.message}`);
            loadUserDashboard(); 
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Có lỗi xảy ra trong quá trình kết nối cổng thanh toán!');
    }
}


// 5. LOGIC RENDER DANH SÁCH MÁY GẮP GẤU ĐỘNG
// 5. LOGIC RENDER DANH SÁCH MÁY GẮP GẤU ĐỘNG
async function loadMachines() {
    const machineGrid = document.getElementById('machine-container') || document.getElementById('machine-grid') || document.querySelector('.machine-grid');
    if (!machineGrid) return;

    try {
        // 🎯 ĐỔI TỪ CỔNG 3000 SANG CỔNG 3001 ĐỂ LẤY MẢNG RAM
        const response = await fetch('http://localhost:3001/api/machines', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const responseData = await response.json(); 

        // Sửa lại theo cấu trúc dữ liệu con 3001 trả về (ví dụ data: dsMayGap hoặc responseData.data)
        const quantitiesList = responseData.success ? (responseData.data || responseData.machines) : []; 
        machineGrid.innerHTML = ''; 

        quantitiesList.forEach(item => {
            let machineName = item.name; // Đọc trực tiếp từ object MayGapGauSubject
            let icon = '🧸';
            let bgColors = '#74b9ff';
            let coinsPerPlay = parseInt(item.coinsPerPlay); // Đọc từ mảng RAM con 3001
            let tongSoLuong = item.currentToys; // Đọc từ mảng RAM con 3001

            if (item.id === 1) {
                icon = '🧸';
                bgColors = '#74b9ff';
            } else if (item.id === 2) {
                icon = '🐱';
                bgColors = '#ffeaa7';
            } else {
                icon = '🦊'; // Icon cho máy cáo hoặc máy Pro
                bgColors = '#ffbe76';
            }

            const cardHtml = `
                <div class="machine-card" style="border: 1px solid #ddd; padding: 20px; border-radius: 12px; min-width: 240px; background: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.05); text-align: center; display: inline-block; margin: 10px; vertical-align: top;">
                    <span class="status-badge" style="padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; color: #fff; background: ${item.trangThai === 'Active' ? '#20bf6b' : '#ff4d4d'};">${item.trangThai}</span>
                    <div class="machine-img" style="background: ${bgColors}; width: 70px; height: 70px; line-height: 70px; border-radius: 50%; font-size: 36px; margin: 15px auto 10px auto;">${icon}</div>
                    <div class="machine-body">
                        <div class="machine-name" style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #333;">${machineName}</div>
                        <div class="machine-cost" style="color: #666; font-size: 14px; margin-bottom: 5px;">Giá chơi: <span style="color: #ff4d4d; font-weight: bold;">${coinsPerPlay} Xu</span> / lượt</div>
                        <div class="machine-toys" style="color: #888; font-size: 13px; margin-bottom: 15px;">Số lượng: <strong>${tongSoLuong} con</strong></div>
                        <button class="btn-play" 
                                style="width: 100%; padding: 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; background: #6c5ce7; color: #fff;"
                                onclick="playGame(${item.id}, ${coinsPerPlay}, '${machineName}')">
                            Vào Chơi Ngay
                        </button>
                    </div>
                </div>
            `;
            machineGrid.insertAdjacentHTML('beforeend', cardHtml);
        });

    } catch (error) {
        console.error('Lỗi kết nối API lấy danh sách máy:', error);
        machineGrid.innerHTML = '<p style="color: red; font-weight: bold; padding: 20px;">❌ Không kết nối được tới Service quản lý máy 3001!</p>';
    }
}

// 6. LOGIC GỬI LƯỢT CHƠI (GẮP GẤU REAL-TIME & LƯU LỊCH SỬ)
async function playGame(machineId, cost, machineName) {
    const confirmed = confirm(`Xác nhận dùng ${cost} Xu để quay tủ Gacha [${machineName}] không bro?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${OPERATION_SERVICE_URL}/play`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Gửi user_token chuẩn chỉ
            },
            body: JSON.stringify({ machineId: parseInt(machineId) })
        });
        
        const data = await response.json();

        if (response.ok && data.success) {
            if (data.ketQua === "WIN") { 
                alert(`🎉 CHÚC MỪNG! ${data.message}\n🧸 Số gấu còn lại trong máy: ${data.soGauConLaiTrongMay}`);
            } else {
                alert(`😢 ${data.message} (Còn lại ${data.soGauConLaiTrongMay} con gấu trong máy)`);
            }
            // Chơi xong re-load real-time số dư ví tiền và trạng thái máy gắp
            await loadUserDashboard(); 
            await loadMachines();
        } else {
            alert(`❌ Thất bại: ${data.message || 'Không thể thực hiện lượt chơi này!'}`);
            await loadMachines(); 
        }
    } catch (error) {
        alert('❌ Không kết nối được tới Service vận hành máy!');
    }
}


// 7. LOGIC TẢI LỊCH SỬ CHƠI TỪ MYSQL (RENDER LÊN TRANG HISTORY.HTML)
async function loadPlayHistory() {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody) return; // Nếu không đứng ở trang history.html thì bỏ qua không chạy

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/user/history`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            tableBody.innerHTML = ''; 

            if (data.history.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Bro chưa chơi lượt nào cả, ra gắp ngay đi! 🧸</td></tr>';
                return;
            }

            data.history.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>Máy gắp #${row.id_may}</td>
                    <td>${row.id_gau_trung ? `<span style="color: #2ecc71; font-weight: bold;">Trúng Gấu 🧸 (ID: ${row.id_gau_trung})</span>` : '<span style="color: #95a5a6;">Hụt 😢</span>'}</td>
                    <td>${new Date(row.thoi_gian).toLocaleString('vi-VN')}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Lỗi lấy lịch sử chơi từ MySQL:", error);
    }
}


// 8. LOGIC ĐĂNG XUẤT VÀ KHỞI CHẠY
function logout() {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    localStorage.clear();
    window.location.href = 'login.html';
}

async function initApp() {
    // Tự động phân tách trang để load hàm thích hợp
    if (window.location.pathname.includes('history.html')) {
        await loadPlayHistory();
    } else {
        await loadUserDashboard();
        await loadMachines();
    }
}

document.addEventListener('DOMContentLoaded', initApp);