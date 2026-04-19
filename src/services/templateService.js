const fs = require('fs').promises;
const path = require('path');
const Template = require('../models/Template');
const logger = require('../utils/logger');

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');

class TemplateService {
  /**
   * Get all active (non-expired) templates
   */
  async getActiveTemplates(category) {
    const query = {
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };
    if (category) query.category = category;

    return Template.find(query).select('-__v').sort({ createdAt: -1 });
  }

  /**
   * Get a single template by ID (must be active)
   */
  async getTemplateById(id) {
    const template = await Template.findOne({ _id: id, isActive: true });
    if (!template) throw Object.assign(new Error('Template not found'), { status: 404 });
    if (template.expiresAt && template.expiresAt < new Date()) {
      throw Object.assign(new Error('Template has expired'), { status: 410 });
    }
    return template;
  }

  /**
   * Create a new template with its directory structure
   */
  async createTemplate(data) {
    const template = new Template(data);
    await template.save();

    // Create template asset directory
    const dir = path.join(TEMPLATES_DIR, template._id.toString());
    await fs.mkdir(dir, { recursive: true });
    logger.info(`Template dir created: ${dir}`);

    return template;
  }

  /**
   * Update a template
   */
  async updateTemplate(id, data) {
    const template = await Template.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!template) throw Object.assign(new Error('Template not found'), { status: 404 });
    return template;
  }

  /**
   * Soft-delete by marking inactive; optionally remove files
   */
  async deleteTemplate(id, removeFiles = false) {
    const template = await Template.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!template) throw Object.assign(new Error('Template not found'), { status: 404 });

    if (removeFiles) {
      const dir = path.join(TEMPLATES_DIR, id);
      try {
        await fs.rm(dir, { recursive: true, force: true });
        logger.info(`Template files removed: ${dir}`);
      } catch (e) {
        logger.warn(`Could not remove template files for ${id}: ${e.message}`);
      }
    }

    return { success: true, id };
  }

  /**
   * Expire all templates past their expiresAt date
   */
  async expireOldTemplates() {
    const result = await Template.updateMany(
      { isActive: true, expiresAt: { $lte: new Date() } },
      { isActive: false }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} template(s)`);
    }
    return result.modifiedCount;
  }

  /**
   * Get all categories
   */
  async getCategories() {
    return Template.distinct('category', { isActive: true });
  }
}

module.exports = new TemplateService();
