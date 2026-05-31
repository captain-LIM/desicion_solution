const express = require('express');
const router = express.Router();
const {
  createDecision,
  getHistory,
  getDecisionById,
  reviewDecision,
  getPendingReviews,
  deleteDecision,
} = require('../controllers/decisionController');

router.post('/', createDecision);
router.get('/history', getHistory);
router.get('/pending-reviews', getPendingReviews);
router.get('/:id', getDecisionById);
router.patch('/:id/review', reviewDecision);
router.delete('/:id', deleteDecision);

module.exports = router;
