require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 8083;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/blockchain', paymentRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'blockchain-payment-system', port: PORT });
});

app.listen(PORT, () => {
    console.log(`Blockchain Payment System running on port ${PORT}`);
});
