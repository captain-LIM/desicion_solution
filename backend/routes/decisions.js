const express = require('express');
const router = express.Router();
const {
  createDecision, getHistory, getDecisionById,
  toggleBookmark, reviewDecision, getPendingReviews,
  getStats, deleteDecision, getInsights,
  togglePublish, getCommunityFeed, voteOnDecision, getVoteResults,
} = require('../controllers/decisionController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/', authMiddleware, createDecision);
router.get('/history', authMiddleware, getHistory);
router.get('/pending-reviews', authMiddleware, getPendingReviews);
router.get('/stats', authMiddleware, getStats);
router.get('/insights', authMiddleware, getInsights);
router.get('/community', optionalAuth, getCommunityFeed);
router.get('/:id/votes', optionalAuth, getVoteResults);
router.post('/:id/vote', authMiddleware, voteOnDecision);
router.patch('/:id/publish', authMiddleware, togglePublish);
router.get('/:id', optionalAuth, getDecisionById);
router.patch('/:id/bookmark', authMiddleware, toggleBookmark);
router.patch('/:id/review', authMiddleware, reviewDecision);
router.delete('/:id', authMiddleware, deleteDecision);

module.exports = router;
