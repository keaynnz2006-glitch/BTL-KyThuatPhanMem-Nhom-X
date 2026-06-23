class MayGapGauSubject {
    constructor(id, name, coinsPerPlay, currentToys) {
        this.id = id;
        this.name = name;
        this.coinsPerPlay = coinsPerPlay;
        this.currentToys = currentToys;
        this.trangThai = 'Active'; 
        this.observers = [];       
    }

    attach(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    detach(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(message) {
        this.observers.forEach(observer => {
            observer.update(message);
        });
    }

    setTrangThai(newStatus, reason) {
        this.trangThai = newStatus;
        if (newStatus === 'Sự cố' || newStatus === 'Hết gấu') {
            const msg = `CẢNH BÁO: Máy gắp [ID: ${this.id} - ${this.name}] vừa chuyển sang trạng thái [${newStatus}]. Lý do: ${reason}`;
            this.notifyObservers(msg);
        }
    }
}

let dsMayGap = [
    new MayGapGauSubject(1, "Máy gấu Pikachu", 2, 5),
    new MayGapGauSubject(2, "Máy gấu Lotso Dâu", 4, 10)
];

// Xuất bản theo kiểu CommonJS
module.exports = {
    MayGapGauSubject,
    dsMayGap
};