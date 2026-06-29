const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("user_token");
const userId = localStorage.getItem("user_id");

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
            throw new Error(data.message || "Không lấy được thông tin.");
        }
        document.getElementById("user-display").textContent =
            `Xin chào, ${data.fullName}`;
        document.getElementById("coin-balance").textContent =
            `💰 ${data.coins} Xu`;
    }
    catch (error) {
        alert(error.message);
        logout();
    }

}

// ĐỔI QUÀ
function handleExchange(giftName) {
    alert(
`🎁 Bạn đã chọn đổi:
${giftName} ()`
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