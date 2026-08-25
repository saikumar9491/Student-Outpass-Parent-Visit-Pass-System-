const express = require('express');
const router = express.Router();
const { verifyPass } = require('../controllers/verifyController');

router.get('/pass/:passId', verifyPass);

module.exports = router;
