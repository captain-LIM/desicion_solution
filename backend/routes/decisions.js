const express = require('express');
const router = express.Router();
const {
  createDecision, getHistory, getDecisionById,
  toggleBookmark, reviewDecision, getPendingReviews, deleteDecision,
} = require('../controllers/decisionController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/', authMiddleware, createDecision);
router.get('/history', authMiddleware, getHistory);
router.get('/pending-reviews', authMiddleware, getPendingReviews);
router.get('/:id', optionalAuth, getDecisionById);
router.patch('/:id/bookmark', authMiddleware, toggleBookmark);
router.patch('/:id/review', authMiddleware, reviewDecision);
router.delete('/:id', authMiddleware, deleteDecision);

module.exports = router;
