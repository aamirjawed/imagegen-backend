const mongoose = require('mongoose');

const textElementSchema = new mongoose.Schema({
  type: { type: String, enum: ['text'], required: true },
  id: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  fontSize: { type: Number, default: 40 },
  fontFamily: { type: String, default: 'Arial' },
  color: { type: String, default: '#ffffff' },
  fontWeight: { type: String, default: 'normal' },
  textAlign: { type: String, default: 'left' },
  maxWidth: { type: Number },
}, { _id: false });

const imageElementSchema = new mongoose.Schema({
  type: { type: String, enum: ['image'], required: true },
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  mask: { type: String }, // filename of mask SVG/PNG in template folder
  shape: { type: String, enum: ['rectangle', 'circle', 'custom'], default: 'rectangle' },
}, { _id: false });

const elementSchema = new mongoose.Schema({}, { strict: false, _id: false });

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  category: { type: String, trim: true, default: 'General' },
  thumbnailUrl: { type: String },
  width: { type: Number, required: true, default: 1080 },
  height: { type: Number, required: true, default: 1080 },
  background: { type: String, required: true }, // path relative to templates/
  elements: [{ type: mongoose.Schema.Types.Mixed }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  tags: [{ type: String, trim: true }],
}, {
  timestamps: true,
});

// Auto-expire index
templateSchema.index({ expiresAt: 1 }, { sparse: true });
templateSchema.index({ isActive: 1, createdAt: -1 });

// Virtual: check if expired
templateSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save: auto deactivate if expired
templateSchema.pre('save', function (next) {
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isActive = false;
  }
  next();
});

module.exports = mongoose.model('Template', templateSchema);
