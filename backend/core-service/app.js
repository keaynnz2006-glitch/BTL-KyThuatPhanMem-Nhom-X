const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Tất cả các API sẽ có tiền tố là /api
app.use('/api', apiRoutes);

const PORT = 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Core Service đang chạy mượt mà tại cổng http://localhost:${PORT}`));
}

module.exports = app; // Export app ra để làm Unit Test