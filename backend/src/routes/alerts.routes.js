const express = require('express');

const alertsController = require('../controllers/alerts.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/all', requireAuth, alertsController.listAllAlerts);

router.post(
  '/advisory',
  requireAuth,
  requireRole('GOV_AUTHORITY', 'SUPER_ADMIN'),
  alertsController.postAdvisory
);

router.post(
  '/',
  requireAuth,
  alertsController.createAlert
);

router.post(
  '/sos',
  requireAuth,
  alertsController.raiseSOS
);

router.put(
  '/:alertId/acknowledge',
  requireAuth,
  alertsController.acknowledge
);

router.get(
  '/slope/:slopeId',
  requireAuth,
  requireRole('SITE_ADMIN', 'SUPER_ADMIN', 'GOV_AUTHORITY'),
  alertsController.getAlertsForSlope
);

module.exports = router;


