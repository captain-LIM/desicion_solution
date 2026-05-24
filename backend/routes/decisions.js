const express = require('express');
const router = express.Router();
const { createDecision, getHistory, deleteDecision } = require('../controllers/decisionController');

router.post('/', createDecision);
router.get('/history', getHistory);
router.delete('/:id', deleteDecision);

module.exports = router;
