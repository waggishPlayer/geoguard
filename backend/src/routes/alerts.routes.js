const express = require('express');

const alertsController = require('../controllers/alerts.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  requireRole('SITE_ADMIN', 'SUPER_ADMIN', 'GOV_AUTHORITY'),
  alertsController.createAlert
);

router.post(
  '/sos',
  requireAuth,
  requireRole('FIELD_WORKER'),
  alertsController.raiseSOS
);

router.post(
  '/:alertId/acknowledge',
  requireAuth,
  requireRole('SITE_ADMIN', 'SUPER_ADMIN', 'GOV_AUTHORITY'),
  alertsController.acknowledge
);

router.get(
  '/slope/:slopeId',
  requireAuth,
  requireRole('SITE_ADMIN', 'SUPER_ADMIN', 'GOV_AUTHORITY'),
  alertsController.getAlertsForSlope
);

module.exports = router;


