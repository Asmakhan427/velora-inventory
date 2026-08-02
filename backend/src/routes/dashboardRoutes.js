const express = require('express');
const { summary, trends } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summary', summary);
router.get('/trends', trends);

module.exports = router;
