const express = require('express');
const router = express.Router();
const { createDecision, getHistory, getDecisionById, deleteDecision } = require('../controllers/decisionController');

router.post('/', createDecision);
router.get('/history', getHistory);
router.get('/:id', getDecisionById);
router.delete('/:id', deleteDecision);

module.exports = router;
