const express = require('express');
const cors = require('cors'); // 1. BẮT BUỘC PHẢI CÓ DÒNG NÀY
const machineRoutes = require('./src/routes/machine.routes');
const stockRoutes = require('./src/routes/stock.routes');
const playRoutes = require('./src/routes/play.routes');

const app = express();
const PORT = 3001;

app.use(cors()); // 
app.use(express.json());

app.use('/api/machines', machineRoutes);
app.use('/api/toys', stockRoutes);
app.use('/api/play', playRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server MVC (CommonJS) đang chạy tại: http://localhost:${PORT}`);
});