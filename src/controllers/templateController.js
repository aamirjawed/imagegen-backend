const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const templateService = require('../services/templateService');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// GET /api/templates — list active templates
router.get('/',
  [query('category').optional().isString().trim().escape()],
  handleValidation,
  async (req, res, next) => {
    try {
      const templates = await templateService.getActiveTemplates(req.query.category);
      res.json({ templates, count: templates.length });
    } catch (err) { next(err); }
  }
);

// GET /api/templates/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await templateService.getCategories();
    res.json({ categories });
  } catch (err) { next(err); }
});

// GET /api/templates/:id
router.get('/:id',
  [param('id').isMongoId()],
  handleValidation,
  async (req, res, next) => {
    try {
      const template = await templateService.getTemplateById(req.params.id);
      res.json(template);
    } catch (err) { next(err); }
  }
);

// POST /api/templates — create
router.post('/',
  [
    body('name').isString().trim().notEmpty().isLength({ max: 100 }),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('category').optional().isString().trim().isLength({ max: 50 }),
    body('width').isInt({ min: 100, max: 4000 }),
    body('height').isInt({ min: 100, max: 4000 }),
    body('background').isString().notEmpty(),
    body('elements').isArray(),
    body('isActive').optional().isBoolean(),
    body('expiresAt').optional().isISO8601(),
    body('tags').optional().isArray(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const template = await templateService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (err) { next(err); }
  }
);

// PATCH /api/templates/:id — update
router.patch('/:id',
  [
    param('id').isMongoId(),
    body('name').optional().isString().trim().isLength({ max: 100 }),
    body('isActive').optional().isBoolean(),
    body('expiresAt').optional().isISO8601(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const template = await templateService.updateTemplate(req.params.id, req.body);
      res.json(template);
    } catch (err) { next(err); }
  }
);

// DELETE /api/templates/:id
router.delete('/:id',
  [
    param('id').isMongoId(),
    query('removeFiles').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await templateService.deleteTemplate(
        req.params.id,
        req.query.removeFiles === 'true'
      );
      res.json(result);
    } catch (err) { next(err); }
  }
);

module.exports = router;
