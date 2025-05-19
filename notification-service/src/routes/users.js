const express = require('express');
const router = express.Router();
const { getUserNotifications } = require('../controllers/user.controller');

router.get('/:id/notifications', getUserNotifications);
module.exports = router;
