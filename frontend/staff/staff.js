const CORE_SERVICE_URL = 'http://localhost:3000';
const token = localStorage.getItem('user_token');
const role = localStorage.getItem('user_role');
const staffId = localStorage.getItem('user_id'); 

if (!token || (role !== 'NhanVien' && role !== 'Admin')) {
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
                
                const actionHtml = `
                    <button class="btn-approve" onclick="approveTicket(${ticket.id})">✔ Duyệt cấp quà</button>
                    <button class="btn-reject" onclick="rejectTicket(${ticket.id})" style="background-color: #d63031; color: white; border: none; padding: 6px 12px; margin-left: 5px; border-radius: 4px; cursor: pointer; font-weight: bold;">❌ Hủy phiếu</button>
                `;

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
            loadMachinesInventory(); 
        } else {
            alert(' Lỗi: ' + data.message);
        }
    } catch (error) {
        alert(' Lỗi kết nối server!');
    }
}

// 3. HÀM HỦY PHIẾU ĐỔI QUÀ
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
            alert(' Đã hủy và xóa phiếu thành công!');
            fetchExchangeTickets(); 
        } else {
            alert(' Lỗi: ' + data.message);
        }
    } catch (error) {
        alert(' Lỗi kết nối server khi hủy phiếu!');
    }
}

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
        console.error(' Lỗi khởi tạo dữ liệu form nạp gấu:', error);
    }
}

// 5. Đón sự kiện khi nhân viên ấn nút "XÁC NHẬN NẠP" trên Form
document.getElementById('replenish-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 

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
            document.getElementById('input-quantity').value = ''; 
            loadMachinesInventory(); 
        } else {
            alert(' Lỗi: ' + data.message);
        }
    } catch (error) {
        alert(' Lỗi kết nối server khi nạp gấu!');
    }
});

// 6. TẢI TOÀN BỘ KHO GẤU TRONG MÁY (CÓ TÍCH HỢP NÚT XÓA)
async function loadMachinesInventory() {
    const container = document.getElementById('machines-inventory-container');
    if (!container) return; 

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/machines-inventory`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (response.ok && result.success) {
            container.innerHTML = ''; 

            if (result.data.length === 0) {
                container.innerHTML = `<p style="color: #ff7675; font-weight: bold;">Hệ thống chưa có máy gắp gấu nào được cấu hình bro ơi!</p>`;
                return;
            }

            result.data.forEach(machine => {
                let listGauHTML = '';

                if (machine.danh_sach_gau.length === 0) {
                    listGauHTML = `<li style="color: #ff7675; list-style: none; font-size: 13px; font-style: italic; padding: 6px 0;"> Máy trống, chưa được cài loại gấu nào!</li>`;
                } else {
                    machine.danh_sach_gau.forEach(gau => {
                        // Cảnh báo nếu gấu trong máy sắp hết (<= 5 con)
                        const isWarning = gau.so_luong <= 5;
                        const qtyColor = isWarning ? '#ff7675' : '#20bf6b';
                        const badgeWarning = isWarning ? ' <span style="color: red; font-size: 11px; font-weight: bold;">(Sắp hết!)</span>' : '';

                        //  hàm onclick gọi API delete
                        listGauHTML += `
                            <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #eee; font-size: 14px;">
                                <span style="color: #2d3436;"> ${gau.ten_gau}</span>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-weight: bold; color: ${qtyColor};">${gau.so_luong} con${badgeWarning}</span>
                                    <button onclick="removeToyFromMachine(${machine.id_may}, ${gau.id_gau}, '${gau.ten_gau}')" 
                                            style="background: #ff7675; color: white; border: none; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 11px; font-weight: bold;" 
                                            title="Xóa gấu khỏi máy">
                                         Xóa
                                    </button>
                                </div>
                            </li>
                        `;
                    });
                }

                const cardHTML = `
                    <div style="background: #ffffff; border: 1px solid #dfe6e9; border-radius: 8px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: all 0.3s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #6c5ce7; padding-bottom: 8px;">
                            <strong style="color: #6c5ce7; font-size: 15px;"> ${machine.ten_may} (ID: #${machine.id_may})</strong>
                            <span style="font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${machine.trang_thai === 'Hoạt động' ? '#e8f5e9' : '#ffeacc'}; color: ${machine.trang_thai === 'Hoạt động' ? '#2e7d32' : '#ef6c00'};">
                                ${machine.trang_thai}
                            </span>
                        </div>
                        <ul style="padding: 0; margin: 0; list-style: none;">
                            ${listGauHTML}
                        </ul>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            container.innerHTML = `<p style="color: red;"> Không thể tải danh sách: ${result.message}</p>`;
        }
    } catch (error) {
        console.error("Lỗi gọi API kho máy:", error);
        container.innerHTML = `<p style="color: red;"> Lỗi kết nối máy chủ Backend!</p>`;
    }
}


async function removeToyFromMachine(machineId, toyId, toyName) {
    if (!confirm(`Bro có chắc chắn muốn XÓA hẳn loại gấu [${toyName}] ra khỏi Máy #${machineId} không?`)) return;

    try {
        const response = await fetch(`${CORE_SERVICE_URL}/api/staff/machines/remove-toy`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_may: machineId, id_gau: toyId }) // Truyền đúng 2 trường id_may và id_gau theo Controller
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(' ' + data.message);
            loadMachinesInventory(); // Tải lại danh sách kho máy thời gian thực để cập nhật UI
        } else {
            alert(' Lỗi: ' + data.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API xóa gấu khỏi máy:', error);
        alert(' Không thể kết nối server để xóa gấu!');
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '../login.html';
}

// KHỞI CHẠY HỆ THỐNG BAN ĐẦU
fetchExchangeTickets();
initReplenishForm();
loadMachinesInventory(); 

// THIẾT LẬP THỜI GIAN ĐỊNH KỲ QUÉT TỰ ĐỘNG
setInterval(fetchExchangeTickets, 5000);   
setInterval(loadMachinesInventory, 10000); 