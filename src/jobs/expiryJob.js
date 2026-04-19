const cron = require('node-cron');
const templateService = require('../services/templateService');
const logger = require('../utils/logger');

function startExpiryJob() {
  // Run every hour at :00
  cron.schedule('0 * * * *', async () => {
    try {
      const count = await templateService.expireOldTemplates();
      if (count > 0) {
        logger.info(`[ExpiryJob] Deactivated ${count} expired template(s)`);
      }
    } catch (err) {
      logger.error(`[ExpiryJob] Error: ${err.message}`);
    }
  });

  logger.info('[ExpiryJob] Template expiry cron started (runs every hour)');
}

module.exports = { startExpiryJob };
