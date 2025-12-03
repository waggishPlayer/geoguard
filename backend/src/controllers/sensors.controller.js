const {
  createSensor,
  getSensorsBySlope,
  getAllSensors,
  getSensorById,
  insertSensorReading,
  getSensorHistory,
  getSlopeById
} = require('../models/queries');

const listSensors = async (req, res, next) => {
  try {
    const { slopeId } = req.query;
    const sensors = slopeId
      ? await getSensorsBySlope(slopeId)
      : await getAllSensors();

    return res.json({
      success: true,
      data: sensors.rows
    });
  } catch (error) {
    next(error);
  }
};

const addSensor = async (req, res, next) => {
  try {
    const { slopeId, name, sensorType, unit } = req.body;

    const slope = await getSlopeById(slopeId);
    if (slope.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slope not found'
      });
    }

    const created = await createSensor(slopeId, name, sensorType, unit);
    return res.status(201).json({
      success: true,
      data: created.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const addReading = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const { value, status = 'ok' } = req.body;

    const sensor = await getSensorById(sensorId);
    if (sensor.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    // TODO: Attach TimescaleDB-specific hypertable logic when we enable Timescale.
    const created = await insertSensorReading(sensorId, value, status);
    return res.status(201).json({
      success: true,
      data: created.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getReadings = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 100;

    const sensor = await getSensorById(sensorId);
    if (sensor.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    const readings = await getSensorHistory(sensorId, limit);
    return res.json({
      success: true,
      data: readings.rows
    });
  } catch (error) {
    next(error);
  }
};

const getSensor = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const sensor = await getSensorById(sensorId);

    if (sensor.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    return res.json({
      success: true,
      data: sensor.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSensors,
  addSensor,
  addReading,
  getReadings,
  getSensor
};


