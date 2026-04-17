const express = require('express');
const router = express.Router({ mergeParams: true });

const kebutuhanController = require('./kebutuhan.controller');
const kebutuhanValidation = require('./kebutuhan.validation');
const { assertMember, assertEditor } = require('../../../middlewares/memberCheck');
const validate = require('../../../middlewares/validate');

router.get('/', assertMember, kebutuhanController.getAll);
router.post(
  '/',
  assertMember,
  assertEditor,
  validate(kebutuhanValidation.createKebutuhan),
  kebutuhanController.create
);
router.patch(
  '/:kebutuhanId',
  assertMember,
  assertEditor,
  validate(kebutuhanValidation.updateKebutuhan),
  kebutuhanController.update
);
router.patch(
  '/:kebutuhanId/status',
  assertMember,
  assertEditor,
  validate(kebutuhanValidation.updateStatus),
  kebutuhanController.updateStatus
);
router.delete('/:kebutuhanId', assertMember, assertEditor, kebutuhanController.remove);

module.exports = router;
