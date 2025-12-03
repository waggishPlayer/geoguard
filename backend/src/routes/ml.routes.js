const express = require('express');

const mlController = require('../controllers/ml.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const mlAccess = [requireAuth, requireRole('FIELD_WORKER', 'SITE_ADMIN', 'SUPER_ADMIN')];

router.post('/predict', ...mlAccess, mlController.predict);
router.post('/forecast', ...mlAccess, mlController.forecast);
router.post('/detect', ...mlAccess, ...mlController.detect);
router.get('/explain/:predictionId', ...mlAccess, mlController.explain);
router.get('/predictions', ...mlAccess, mlController.listPredictions);

module.exports = router;

