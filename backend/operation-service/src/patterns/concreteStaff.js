const StaffObserver = require('./staffObserver');
const { dsMayGap } = require('../models/machine.model');

class ConcreteStaff extends StaffObserver {
    constructor(staffName, staffEmail) {
        super(staffName, staffEmail);
    }

    update(message) {
        const timestamp = new Date().toLocaleString();
        console.log(`\n======================================================`);
        console.log(`[REAL-TIME NOTIFICATION] 🕒 ${timestamp}`);
        console.log(` Gửi tới Nhân viên: ${this.staffName} (${this.staffEmail})`);
        console.log(` NỘI DUNG BÁO LỖI: "${message}"`);
        console.log(`======================================================\n`);
    }
}

const nhanVienKyThuat = new ConcreteStaff("Anh Linh Kỹ Thuật", "linh55.tech@gau.com");
const nhanVienQuanLy = new ConcreteStaff("Trưởng ca điều hành", "manager@gau.com");

dsMayGap.forEach(may => {
    may.attach(nhanVienKyThuat);
    may.attach(nhanVienQuanLy);
});

module.exports = {
    nhanVienKyThuat,
    nhanVienQuanLy
};