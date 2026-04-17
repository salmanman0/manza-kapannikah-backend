const Joi = require('joi');

// ── Invite Collaborator ───────────────────────────────────────────────────────
const inviteCollaborator = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email kolaborator wajib diisi',
  }),
  role: Joi.string().valid('editor', 'viewer').default('viewer').messages({
    'any.only': 'Role hanya boleh editor atau viewer',
  }),
});

// ── Update Collaborator Role ──────────────────────────────────────────────────
const updateCollaboratorRole = Joi.object({
  role: Joi.string().valid('editor', 'viewer').required().messages({
    'any.only': 'Role hanya boleh editor atau viewer',
    'any.required': 'Role wajib diisi',
  }),
});

module.exports = { inviteCollaborator, updateCollaboratorRole };
