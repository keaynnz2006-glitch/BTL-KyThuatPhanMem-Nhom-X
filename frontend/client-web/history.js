const CORE_SERVICE_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('user_token');
const userId = localStorage.getItem('user_id');

// Kiểm tra bảo mật đầu trang
if (!token || !userId) {
    alert('Bro vui lòng đăng nhập trước nhé!');
    window.location.href = 'login.html';
}

const fetchOptions = {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
};

// 1. Lấy thông tin số dư tài khoản
async function loadUserDashboard() {
    try {
        const response = await fetch(`${CORE_SERVICE_URL}/user/balance`, fetchOptions);
        const data = await response.json();
        if (response.ok) {
            document.getElementById('user-display').innerText = `Xin chào, ${data.fullName}!`;
            document.getElementById('coin-balance').innerText = `💰 ${data.coins} Xu`;
        }
    } catch (err) {
        console.error('Lỗi lấy số dư:', err);
    }
}

// 2. Lấy dữ liệu lịch sử thời gian thực từ MySQL và tính điểm khấu trừ
async function loadPlayHistoryRealTime() {
    const tableBody = document.getElementById('history-table-body');
    const totalPointsDisplay = document.getElementById('total-exchange-points'); 
    if (!tableBody) return;

    try {
        // Chỉ gọi duy nhất API lịch sử
        const response = await fetch(`${CORE_SERVICE_URL}/user/history`, fetchOptions);
        const data = await response.json();

        if (!response.ok || !data.success) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #d63031; padding: 20px;">Không thể tải dữ liệu lịch sử!</td></tr>';
            return;
        }

        if (data.history.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #636e72; padding: 30px;">Bro chưa chơi lượt nào cả, ra trang chủ gắp ngay đi! 🧸</td></tr>';
            if (totalPointsDisplay) totalPointsDisplay.innerText = '0 điểm';
            return;
        }

        let totalAccumulatedPoints = 0; 
        
      
        const diemDaTieu = data.history[0].diem_da_tieu || 0;

        tableBody.innerHTML = data.history.map(row => {
            const thoiGianFormat = new Date(row.thoi_gian).toLocaleString('vi-VN', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
            });
            
            const tenMay = row.ten_may || `Máy gắp số #${row.id_may}`;
            const isWin = row.id_gau_trung !== null;
            
            const currentPoints = isWin ? parseInt(row.gia_tri_diem || 0) : 0;
            totalAccumulatedPoints += currentPoints;

            const badgeHtml = isWin 
                ? `<span class="badge-result badge-win"> TRÚNG: ${row.ten_gau || `Gấu ID ${row.id_gau_trung}`}</span>` 
                : `<span class="badge-result badge-lose">HỤT RỒI</span>`;

            return `
                <tr>
                    <td>${thoiGianFormat}</td>
                    <td><strong>${tenMay}</strong></td>
                    <td>${badgeHtml}</td>
                    <td style="font-weight: bold; color: ${isWin ? '#2e7d32' : '#b2bec3'};">
                        ${isWin ? `+${currentPoints} điểm` : '0'}
                    </td>
                </tr>
            `;
        }).join('');

        //  HIỂN THỊ ĐIỂM THỰC TẾ SAU KHẤU TRỪ
        if (totalPointsDisplay) {
            const finalPoints = totalAccumulatedPoints - diemDaTieu;
            totalPointsDisplay.innerText = `${finalPoints} điểm`;
        }

    } catch (err) {
        console.error('Lỗi kết nối lịch sử:', err);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #d63031; padding: 20px;">Mất kết nối tới máy chủ dữ liệu!</td></tr>';
    }
}

// Chức năng Đổi Quà 
async function handleExchange(idGau, giftName, requiredPoints) {
    const currentPointsText = document.getElementById('total-exchange-points').innerText;
    const currentPoints = parseInt(currentPointsText) || 0;

    if (currentPoints < requiredPoints) {
        alert(`Không đủ điểm !\nQuà này cần [${requiredPoints} điểm], hiện tại mới tích lũy được [${currentPoints} điểm]. Đi gắp thêm gấu nhé! 💪`);
        return;
    }

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/tickets/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                id_khach_hang: userId,          
                id_gau_muon_doi: idGau,         
                so_diem_tieu_hao: requiredPoints 
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(` Chúc mừng! Đã gửi yêu cầu đổi quà [${giftName}] thành công.\nHãy báo nhân viên tại quầy duyệt phiếu nhé!`);
            loadPlayHistoryRealTime();
        } else {
            alert('Lỗi tạo phiếu: ' + (data.error || 'Vui lòng thử lại!'));
        }

    } catch (err) {
        console.error('Lỗi kết nối đổi quà:', err);
        alert('Mất kết nối tới máy chủ khi tạo phiếu đổi quà!');
    }
}

window.onload = () => {
    loadUserDashboard();
    loadPlayHistoryRealTime();
};