const {
  createAlert,
  acknowledgeAlert,
  getAlertsBySlope,
  getUsersByRole
} = require('../models/queries');
const { notifyUsers } = require('../services/notification.service');

const createAlertController = async (req, res, next) => {
  try {
    const { slopeId, alertType, message, severity } = req.body;

    const created = await createAlert(slopeId, alertType, message, severity);
    return res.status(201).json({
      success: true,
      data: created.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const acknowledge = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User id required to acknowledge alert'
      });
    }

    const updated = await acknowledgeAlert(alertId, userId);
    if (updated.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    return res.json({
      success: true,
      data: updated.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getAlertsForSlope = async (req, res, next) => {
  try {
    const { slopeId } = req.params;
    const alerts = await getAlertsBySlope(slopeId);

    return res.json({
      success: true,
      data: alerts.rows
    });
  } catch (error) {
    next(error);
  }
};

const raiseSOS = async (req, res, next) => {
  try {
    const { message = 'Emergency reported by field worker', slopeId = null } = req.body;
    const created = await createAlert(slopeId, 'sos', message, 'critical');

    const [siteAdmins, govAuthorities] = await Promise.all([
      getUsersByRole('site_admin'),
      getUsersByRole('gov_authority')
    ]);

    const recipients = [
      ...siteAdmins.rows.map((user) => user.id),
      ...govAuthorities.rows.map((user) => user.id)
    ];

    await notifyUsers(req.app, recipients, {
      type: 'sos',
      title: 'SOS Triggered',
      body: `${req.user.name || 'Field worker'}: ${message}`,
      metadata: {
        slopeId,
        alertId: created.rows[0].id
      }
    });

    return res.status(201).json({
      success: true,
      data: created.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert: createAlertController,
  acknowledge,
  getAlertsForSlope,
  raiseSOS
};


