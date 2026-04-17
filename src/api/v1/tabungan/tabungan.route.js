const express = require('express');
const router = express.Router({ mergeParams: true });

const tabunganController = require('./tabungan.controller');
const tabunganValidation = require('./tabungan.validation');
const { assertMember } = require('../../../middlewares/memberCheck');
const validate = require('../../../middlewares/validate');

router.get('/', assertMember, tabunganController.getAll);
router.post(
  '/',
  assertMember,
  validate(tabunganValidation.createTabungan),
  tabunganController.create
);
router.delete('/:tabunganId', assertMember, tabunganController.remove);

module.exports = router;
