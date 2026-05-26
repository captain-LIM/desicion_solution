const express = require('express');
const cors = require('cors');
require('dotenv').config();

const decisionsRouter = require('./routes/decisions');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ type: 'application/json' }));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api/decisions', decisionsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
