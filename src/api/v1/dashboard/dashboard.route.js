const express = require('express');
const router = express.Router({ mergeParams: true });

const dashboardController = require('./dashboard.controller');
const { assertMember } = require('../../../middlewares/memberCheck');

router.get('/', assertMember, dashboardController.getSummary);

module.exports = router;
