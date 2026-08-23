const activityLogService = require('../services/activityLogService');

const activityLogController = {
  async getLogs(req, res, next) {
    try {
      const data = await activityLogService.getLogs(req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = activityLogController;
