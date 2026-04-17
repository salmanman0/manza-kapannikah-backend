const express = require('express');
const router = express.Router({ mergeParams: true });

const reminderController = require('./reminder.controller');
const reminderValidation = require('./reminder.validation');
const { assertMember } = require('../../../middlewares/memberCheck');
const validate = require('../../../middlewares/validate');

router.get('/', assertMember, reminderController.getAll);
router.post(
  '/',
  assertMember,
  validate(reminderValidation.createReminder),
  reminderController.create
);
router.delete('/:reminderId', assertMember, reminderController.remove);

module.exports = router;
