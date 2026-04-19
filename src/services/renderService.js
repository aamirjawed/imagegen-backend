const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { sanitizeText } = require('../utils/sanitize');
const logger = require('../utils/logger');

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');
const MAX_INPUT_DIMENSION = 4000;

class RenderService {
  /**
   * Main render pipeline: composite user image + text overlays onto background
   */
  async render(templateDoc, userImageBuffer, textData) {
    const { width, height, background, elements } = templateDoc;

    // 1. Load & validate background
    const bgPath = path.join(TEMPLATES_DIR, background);
    await this._assertFileExists(bgPath, 'Background image not found');

    // 2. Start with background as base
    let base = sharp(bgPath).resize(width, height, { fit: 'cover' });

    // 3. Build composites array
    const composites = [];

    for (const element of elements) {
      if (element.type === 'image' && userImageBuffer) {
        const composite = await this._buildImageComposite(element, userImageBuffer, templateDoc);
        if (composite) composites.push(composite);
      }
    }

    // 4. Build SVG text overlay
    const textOverlaySvg = this._buildTextSvg(width, height, elements, textData);
    if (textOverlaySvg) {
      composites.push({
        input: Buffer.from(textOverlaySvg),
        top: 0,
        left: 0,
      });
    }

    // 5. Compose final image
    const output = await base
      .composite(composites)
      .png({ quality: 95, compressionLevel: 6 })
      .toBuffer();

    return output;
  }

  /**
   * Process and position user image element, applying mask if defined
   */
  async _buildImageComposite(element, userImageBuffer, templateDoc) {
    const { x, y, width, height, mask, shape } = element;

    try {
      // Resize user photo to fit element box
      let userImg = sharp(userImageBuffer);

      // Safety: limit huge inputs
      const meta = await userImg.metadata();
      if (meta.width > MAX_INPUT_DIMENSION || meta.height > MAX_INPUT_DIMENSION) {
        userImg = userImg.resize(MAX_INPUT_DIMENSION, MAX_INPUT_DIMENSION, { fit: 'inside' });
      }

      let processedBuffer = await userImg
        .resize(width, height, { fit: 'cover', position: 'centre' })
        .toBuffer();

      // Apply mask
      if (mask) {
        processedBuffer = await this._applyMask(processedBuffer, mask, width, height, shape, templateDoc._id.toString());
      } else if (shape === 'circle') {
        processedBuffer = await this._applyCircleMask(processedBuffer, width, height);
      }

      return {
        input: processedBuffer,
        top: Math.round(y),
        left: Math.round(x),
      };
    } catch (err) {
      logger.error(`Image composite error for element ${element.id}: ${err.message}`);
      return null;
    }
  }

  /**
   * Apply SVG or PNG mask file to an image buffer
   */
  async _applyMask(imageBuffer, maskFilename, width, height, shape, templateId) {
    const maskPath = path.join(TEMPLATES_DIR, templateId, maskFilename);

    try {
      await this._assertFileExists(maskPath);
      const maskBuffer = await fs.readFile(maskPath);
      const isSvg = maskFilename.toLowerCase().endsWith('.svg');

      let mask;
      if (isSvg) {
        // Rasterize SVG mask to PNG at target size
        mask = await sharp(maskBuffer, { density: 300 })
          .resize(width, height)
          .png()
          .toBuffer();
      } else {
        mask = await sharp(maskBuffer).resize(width, height).png().toBuffer();
      }

      // Composite mask as alpha channel
      return sharp(imageBuffer)
        .resize(width, height, { fit: 'cover' })
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();
    } catch (err) {
      logger.warn(`Mask application failed (${maskFilename}): ${err.message}. Falling back to no mask.`);
      return imageBuffer;
    }
  }

  /**
   * Generate a circular mask and apply it
   */
  async _applyCircleMask(imageBuffer, width, height) {
    const r = Math.min(width, height) / 2;
    const cx = width / 2;
    const cy = height / 2;
    const circleSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>
    </svg>`;

    const mask = await sharp(Buffer.from(circleSvg)).resize(width, height).png().toBuffer();

    return sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  /**
   * Build an SVG overlay containing all text elements
   */
  _buildTextSvg(canvasWidth, canvasHeight, elements, textData) {
    const textElements = elements.filter(e => e.type === 'text');
    if (!textElements.length) return null;

    const textNodes = textElements.map(el => {
      const rawText = textData[el.id] || '';
      if (!rawText) return '';

      const text = sanitizeText(rawText);
      const fontFamily = el.fontFamily || 'Arial, sans-serif';
      const fontSize = el.fontSize || 40;
      const color = el.color || '#ffffff';
      const fontWeight = el.fontWeight || 'normal';
      const textAnchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';

      // Handle long text wrapping via multiple tspan
      const lines = this._wrapText(text, el.maxWidth, fontSize);
      const lineHeight = fontSize * 1.2;

      const tspans = lines.map((line, i) =>
        `<tspan x="${el.x}" dy="${i === 0 ? 0 : lineHeight}">${this._escapeXml(line)}</tspan>`
      ).join('');

      return `<text
        x="${el.x}"
        y="${el.y}"
        font-family="${this._escapeAttr(fontFamily)}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${this._escapeAttr(color)}"
        text-anchor="${textAnchor}"
      >${tspans}</text>`;
    });

    const validNodes = textNodes.filter(Boolean);
    if (!validNodes.length) return null;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
  ${validNodes.join('\n  ')}
</svg>`;
  }

  /**
   * Simple word wrap for text elements
   */
  _wrapText(text, maxWidth, fontSize) {
    if (!maxWidth) return [text];
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
    if (text.length <= charsPerLine) return [text];

    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      if ((current + ' ' + word).trim().length <= charsPerLine) {
        current = (current + ' ' + word).trim();
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  _escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  _escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  async _assertFileExists(filePath, message) {
    try {
      await fs.access(filePath);
    } catch {
      throw Object.assign(new Error(message || `File not found: ${filePath}`), { status: 500 });
    }
  }
}

module.exports = new RenderService();
