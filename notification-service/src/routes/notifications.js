const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { createNotification } = require('../controllers/notification.controller');

const validateNotification = [
  body('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('type').isIn(['email', 'sms', 'in-app']).withMessage('type must be one of email, sms, in-app'),
  body('subject').isString().notEmpty().withMessage('subject is required'),
  body('message').isString().notEmpty().withMessage('message is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post('/', validateNotification, createNotification);
module.exports = router;
