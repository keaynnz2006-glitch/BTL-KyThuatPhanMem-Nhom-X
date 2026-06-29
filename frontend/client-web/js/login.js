const API_URL = "http://localhost:3000/api";
let isLoginMode = true;

// CHUYỂN ĐĂNG NHẬP / ĐĂNG KÝ

function toggleMode(event) {
    event.preventDefault();
    isLoginMode = !isLoginMode;
    const title = document.getElementById("form-title");
    const desc = document.getElementById("form-desc");
    const btnText = document.getElementById("btn-text");
    const switchText = document.getElementById("switch-text");
    const switchBtn = document.getElementById("switch-btn");
    const fullnameGroup = document.getElementById("group-fullname");
    const fullname = document.getElementById("fullname");
    const errorBox = document.getElementById("error-box");
    errorBox.style.display = "none";

    if (isLoginMode) {
        title.textContent = "Royal Teddy Machine";
        desc.textContent = "Chào mừng bạn quay trở lại.";
        btnText.textContent = "Đăng nhập";
        switchText.textContent = "Chưa có tài khoản?";
        switchBtn.textContent = "Đăng ký ngay";
        fullnameGroup.style.display = "none";
        fullname.required = false;
    } else {
        title.textContent = "Đăng ký tài khoản";
        desc.textContent = "Tạo tài khoản để bắt đầu chơi.";
        btnText.textContent = "Đăng ký";
        switchText.textContent = "Đã có tài khoản?";
        switchBtn.textContent = "Đăng nhập";
        fullnameGroup.style.display = "block";
        fullname.required = true;
    }
}

// XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ
async function handleAuth(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const fullname = document.getElementById("fullname").value.trim();
    const errorBox = document.getElementById("error-box");
    errorBox.style.display = "none";
    try {

        // ĐĂNG NHẬP

        if (isLoginMode) {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tai_khoan: username,
                    mat_khau: password
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || "Đăng nhập thất bại");
            }

            // Lưu JWT

            localStorage.setItem("user_token", data.token);

            // Lưu ID người dùng

            localStorage.setItem("user_id", data.userId);
            alert("Đăng nhập thành công!");
            window.location.href = "index.html";
        }

        // ĐĂNG KÝ

        else {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tai_khoan: username,
                    mat_khau: password,
                    ho_ten: fullname,
                    vai_tro: "KhachHang"
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || "Đăng ký thất bại");
            }
            alert("Đăng ký thành công!");

            // Quay về màn hình đăng nhập
            toggleMode(event);
        }
    }

    catch (error) {
        errorBox.innerHTML = error.message;
        errorBox.style.display = "block";
    }
}