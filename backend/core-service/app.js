const express = require('express');
const balanceController = require('./src/controllers/balance.controller');

const app = express();
app.use(express.json());

// Định nghĩa API Endpoint theo quy chuẩn số nhiều và kebab-case
// Dấu :userId đại diện cho tham số động truyền vào
app.get('/api/balances/:userId', balanceController.getBalance);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});