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

app.get('/debug-db', async (req, res) => {
  const pool = require('./config/db');
  try {
    const [rows] = await pool.execute('SELECT 1 as ok');
    res.json({ connected: true, mysql_url_set: !!process.env.MYSQL_URL, url_preview: (process.env.MYSQL_URL || '').replace(/:([^:@]+)@/, ':***@') });
  } catch (err) {
    res.json({ connected: false, code: err.code, message: err.message, mysql_url_set: !!process.env.MYSQL_URL, url_preview: (process.env.MYSQL_URL || '').replace(/:([^:@]+)@/, ':***@') });
  }
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
