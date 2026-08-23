const activityLogModel = require('../models/activityLogModel');

const activityLogService = {
  async getLogs(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      activityLogModel.findAll({
        limit,
        offset,
        entity_type: query.entity_type,
        action: query.action
      }),
      activityLogModel.countAll({
        entity_type: query.entity_type,
        action: query.action
      })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};

module.exports = activityLogService;
