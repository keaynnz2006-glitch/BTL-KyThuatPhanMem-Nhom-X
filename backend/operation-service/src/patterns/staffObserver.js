class StaffObserver {
    constructor(staffName, staffEmail) {
        this.staffName = staffName;
        this.staffEmail = staffEmail;
    }

    update(message) {
        throw new Error("Phương thức 'update(message)' phải được cài đặt ở Concrete Observer!");
    }
}

module.exports = StaffObserver;