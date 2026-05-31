const express = require('express');
const router = express.Router();
const { register, login, getMe, checkEmail } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/check-email', checkEmail);

module.exports = router;
