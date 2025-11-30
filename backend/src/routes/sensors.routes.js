const express = require('express');

const sensorsController = require('../controllers/sensors.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requireRole('FIELD_WORKER', 'SITE_ADMIN', 'SUPER_ADMIN'),
  sensorsController.listSensors
);

router.get(
  '/:sensorId',
  requireAuth,
  requireRole('SITE_ADMIN', 'SUPER_ADMIN'),
  sensorsController.getSensor
);

router.post(
  '/',
  requireAuth,
  requireRole('SITE_ADMIN', 'SUPER_ADMIN'),
  sensorsController.addSensor
);

router.post(
  '/:sensorId/readings',
  requireAuth,
  requireRole('FIELD_WORKER', 'SITE_ADMIN', 'SUPER_ADMIN'),
  sensorsController.addReading
);

router.get(
  '/:sensorId/readings',
  requireAuth,
  requireRole('FIELD_WORKER', 'SITE_ADMIN', 'SUPER_ADMIN'),
  sensorsController.getReadings
);

module.exports = router;


