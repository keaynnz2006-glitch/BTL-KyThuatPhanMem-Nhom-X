const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("user_token");
const userId = localStorage.getItem("user_id");
let selectedPaymentMethod = "momo";

// KIỂM TRA ĐĂNG NHẬP

if (!token || !userId) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "login.html";
}

// LẤY THÔNG TIN NGƯỜI DÙNG

async function loadUserDashboard() {
    try {
        const response = await fetch(`${API_URL}/user/balance`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Không lấy được thông tin người dùng.");
        }

        // Hiển thị tên
        document.getElementById("user-display").textContent =
            `Xin chào, ${data.fullName}`;
        // Hiển thị số xu trên Navbar
        document.getElementById("coin-balance").textContent =
            `💰 ${data.coins} Xu`;
        // Hiển thị số xu ở thẻ lớn
        const balanceBig = document.getElementById("balance-big");
        if (balanceBig) {
            balanceBig.textContent =
                `💰 ${data.coins} Xu`;
        }
    }
    catch (error) {
        alert(error.message);
        logout();
    }
}

// CHỌN GÓI NẠP

function selectPreset(amount, button) {
    document
        .querySelectorAll(".preset-btn")
        .forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    document.getElementById("recharge-amount").value = amount;
}

// CHỌN PHƯƠNG THỨC THANH TOÁN

function selectPayment(method, card) {
    selectedPaymentMethod = method;
    document
        .querySelectorAll(".payment-card")
        .forEach(item => item.classList.remove("active"));
    card.classList.add("active");
}

// NẠP XU
async function handleRechargeNew() {
    const amount = Number(
        document.getElementById("recharge-amount").value
    );
    if (amount <= 0) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }
    const ok = confirm(
        `Xác nhận nạp ${amount.toLocaleString()} VNĐ bằng ${selectedPaymentMethod.toUpperCase()} ?`
    );
    if (!ok) return;
    try {
        const response = await fetch(`${API_URL}/user/recharge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: Number(userId),
                amountVnd: amount
            })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Nạp xu thất bại!");
        }
        alert(data.message);

        // Cập nhật lại số xu
        loadUserDashboard();
    }

    catch (error) {
        alert(error.message);
    }
}

// VÀO CHƠI

function playGame(machineId, coinCost, machineName) {
    alert(
        `Máy: ${machineName}
Chi phí: ${coinCost} Xu
(Backend Dev 2 sẽ xử lý API chơi game.)`
    );
}

// ĐĂNG XUẤT

function logout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
}

// LOAD TRANG

window.onload = function () {
    loadUserDashboard();
};