const express = require('express');
const router  = express.Router();
const { login, getMe, seedAdmin, seedAll } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login',      login);
router.get('/me',          protect, getMe);
router.post('/seed-admin', seedAdmin);
router.get('/seed-db',     seedAll);

module.exports = router;
