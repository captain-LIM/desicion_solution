const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const decisionsRouter = require('./routes/decisions');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json({ type: 'application/json' }));

app.use('/api/auth', authRouter);
app.use('/api/decisions', decisionsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/debug-db', (req, res) => {
  res.json({
    MYSQL_URL: process.env.MYSQL_URL ? process.env.MYSQL_URL.replace(/:([^:@]+)@/, ':***@') : 'NOT SET',
    DB_HOST: process.env.DB_HOST || 'NOT SET',
    DB_PORT: process.env.DB_PORT || 'NOT SET',
    DB_USER: process.env.DB_USER || 'NOT SET',
    DB_NAME: process.env.DB_NAME || 'NOT SET',
    DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  });
});

// 프로덕션: React 빌드 파일 서빙
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
