const multer = require('multer');

const mlService = require('../services/ml.service');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const respond = (res, payload) => res.status(200).json(payload);

const predict = async (req, res, next) => {
  try {
    const { slopeId, sensorData = {} } = req.body;
    const result = await mlService.predict({ slopeId, sensorData });
    return respond(res, result);
  } catch (error) {
    next(error);
  }
};

const detect = [
  upload.single('image'),
  async (req, res, next) => {
    try {
      const file = req.file || null;
      const imageUrl = req.body?.image_url || null;
      const result = await mlService.detect({ file, imageUrl });
      return respond(res, result);
    } catch (error) {
      next(error);
    }
  }
];

const forecast = async (req, res, next) => {
  try {
    const { slopeId } = req.body;
    const result = await mlService.forecast({ slopeId });
    return respond(res, result);
  } catch (error) {
    next(error);
  }
};

const explain = async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    const { slopeId = null } = req.query;
    const result = await mlService.explain({ predictionId, slopeId });
    return respond(res, result);
  } catch (error) {
    next(error);
  }
};

const listPredictions = async (req, res, next) => {
  try {
    const result = await mlService.listPredictions();
    return respond(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predict,
  detect,
  forecast,
  explain,
  listPredictions
};

