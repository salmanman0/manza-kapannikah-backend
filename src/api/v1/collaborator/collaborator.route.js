const express = require('express');
const router = express.Router({ mergeParams: true });

const collaboratorController = require('./collaborator.controller');
const collaboratorValidation = require('./collaborator.validation');
const validate = require('../../../middlewares/validate');

router.get('/', collaboratorController.getCollaborators);
router.post(
  '/',
  validate(collaboratorValidation.inviteCollaborator),
  collaboratorController.inviteCollaborator
);
router.patch(
  '/:collaboratorId',
  validate(collaboratorValidation.updateCollaboratorRole),
  collaboratorController.updateCollaboratorRole
);
router.delete('/:collaboratorId', collaboratorController.removeCollaborator);

module.exports = router;
