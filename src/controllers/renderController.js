const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const templateService = require('../services/templateService');
const renderService = require('../services/renderService');
const { sanitizeTextData } = require('../utils/sanitize');
const logger = require('../utils/logger');

const MAX_SIZE_BYTES = (parseInt(process.env.MAX_FILE_SIZE_MB) || 3) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(Object.assign(new Error('Invalid file type. Only JPEG, PNG, WEBP allowed.'), { status: 400 }), false);
    }
    cb(null, true);
  },
});

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};


router.post('/',
  upload.single('image'),
  [
    body('templateId').isMongoId().withMessage('Invalid templateId'),
    body('textData').optional(),
  ],
  handleValidation,
  async (req, res, next) => {
    const startTime = Date.now();
    try {
      const { templateId } = req.body;

      // Parse textData (sent as JSON string in multipart)
      let textData = {};
      if (req.body.textData) {
        try {
          textData = typeof req.body.textData === 'string'
            ? JSON.parse(req.body.textData)
            : req.body.textData;
        } catch {
          return res.status(400).json({ error: 'textData must be valid JSON' });
        }
      }

      // Sanitize all text inputs
      textData = sanitizeTextData(textData);

      // Load template
      const template = await templateService.getTemplateById(templateId);

      // Require image only if template has image elements
      const hasImageElement = template.elements.some(e => e.type === 'image');
      if (hasImageElement && !req.file) {
        return res.status(400).json({ error: 'Image file required for this template' });
      }

      const imageBuffer = req.file?.buffer || null;

      // Render
      const outputBuffer = await renderService.render(template, imageBuffer, textData);

      const elapsed = Date.now() - startTime;
      logger.info(`Rendered template ${templateId} in ${elapsed}ms (${outputBuffer.length} bytes)`);

      // Stream PNG output
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="generated-${templateId}-${Date.now()}.png"`,
        'Content-Length': outputBuffer.length,
        'X-Render-Time-Ms': elapsed,
        'Cache-Control': 'no-store',
      });
      res.send(outputBuffer);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/render/preview — same as render but returns base64 for live preview
router.post('/preview',
  upload.single('image'),
  async (req, res, next) => {
    try {
      const { templateId } = req.body;
      if (!templateId || !/^[a-f\d]{24}$/i.test(templateId)) {
        return res.status(400).json({ error: 'Invalid templateId' });
      }

      let textData = {};
      if (req.body.textData) {
        try { textData = JSON.parse(req.body.textData); } catch { }
      }
      textData = sanitizeTextData(textData);

      const template = await templateService.getTemplateById(templateId);
      const imageBuffer = req.file?.buffer || null;
      const outputBuffer = await renderService.render(template, imageBuffer, textData);

      res.json({
        image: `data:image/png;base64,${outputBuffer.toString('base64')}`,
        size: outputBuffer.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
