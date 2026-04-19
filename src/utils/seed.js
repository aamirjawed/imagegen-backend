require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Template = require('../models/Template');

const TEMPLATES_DIR = path.join(process.cwd(), 'templates');

const sampleTemplates = [
  {
    name: 'Beach Event Poster',
    description: 'A vibrant beach-themed poster for summer events',
    category: 'Events',
    width: 1080,
    height: 1080,
    background: 'beach/background.svg',
    thumbnailUrl: '/assets/beach/background.svg',
    tags: ['summer', 'beach', 'event', 'poster'],
    elements: [
      {
        type: 'image',
        id: 'userPhoto',
        x: 390,
        y: 280,
        width: 300,
        height: 300,
        shape: 'circle',
      },
      {
        type: 'text',
        id: 'eventName',
        label: 'Event Name',
        placeholder: 'Summer Beach Party',
        x: 540,
        y: 650,
        fontSize: 64,
        fontFamily: 'Georgia, serif',
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 900,
      },
      {
        type: 'text',
        id: 'date',
        label: 'Date',
        placeholder: 'July 15, 2025',
        x: 540,
        y: 730,
        fontSize: 36,
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        textAlign: 'center',
      },
      {
        type: 'text',
        id: 'location',
        label: 'Location',
        placeholder: 'Miami Beach, FL',
        x: 540,
        y: 790,
        fontSize: 28,
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        textAlign: 'center',
      },
    ],
    isActive: true,
  },
  {
    name: 'Professional ID Card',
    description: 'Clean corporate ID card template',
    category: 'Corporate',
    width: 1080,
    height: 680,
    background: 'id-card/background.svg',
    thumbnailUrl: '/assets/id-card/background.svg',
    tags: ['id', 'corporate', 'professional', 'card'],
    elements: [
      {
        type: 'image',
        id: 'userPhoto',
        x: 80,
        y: 140,
        width: 220,
        height: 260,
        shape: 'rectangle',
      },
      {
        type: 'text',
        id: 'fullName',
        label: 'Full Name',
        placeholder: 'John Doe',
        x: 360,
        y: 220,
        fontSize: 52,
        fontFamily: 'Arial, sans-serif',
        color: '#1a1a2e',
        fontWeight: 'bold',
      },
      {
        type: 'text',
        id: 'jobTitle',
        label: 'Job Title',
        placeholder: 'Senior Engineer',
        x: 360,
        y: 290,
        fontSize: 30,
        fontFamily: 'Arial, sans-serif',
        color: '#4a4a8a',
      },
      {
        type: 'text',
        id: 'company',
        label: 'Company',
        placeholder: 'Acme Corporation',
        x: 360,
        y: 350,
        fontSize: 26,
        fontFamily: 'Arial, sans-serif',
        color: '#666666',
      },
      {
        type: 'text',
        id: 'employeeId',
        label: 'Employee ID',
        placeholder: 'EMP-001',
        x: 360,
        y: 430,
        fontSize: 24,
        fontFamily: 'monospace',
        color: '#888888',
      },
    ],
    isActive: true,
  },
  {
    name: 'Birthday Celebration Card',
    description: 'Festive birthday card with confetti design',
    category: 'Celebrations',
    width: 1080,
    height: 1080,
    background: 'birthday/background.svg',
    thumbnailUrl: '/assets/birthday/background.svg',
    tags: ['birthday', 'celebration', 'card', 'festive'],
    elements: [
      {
        type: 'image',
        id: 'userPhoto',
        x: 340,
        y: 200,
        width: 400,
        height: 400,
        shape: 'circle',
      },
      {
        type: 'text',
        id: 'personName',
        label: "Person's Name",
        placeholder: 'Happy Birthday Sarah!',
        x: 540,
        y: 680,
        fontSize: 72,
        fontFamily: 'Georgia, serif',
        color: '#ff6b6b',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 960,
      },
      {
        type: 'text',
        id: 'message',
        label: 'Message',
        placeholder: 'Wishing you a wonderful day!',
        x: 540,
        y: 800,
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
        color: '#6b6bff',
        textAlign: 'center',
        maxWidth: 900,
      },
    ],
    isActive: true,
  },
  {
    name: 'Motivational Quote Card',
    description: 'Inspiring quote card — no photo required',
    category: 'Social Media',
    width: 1080,
    height: 1080,
    background: 'quote/background.svg',
    thumbnailUrl: '/assets/quote/background.svg',
    tags: ['quote', 'motivational', 'social', 'inspiration'],
    elements: [
      {
        type: 'text',
        id: 'quote',
        label: 'Quote',
        placeholder: 'The only way to do great work is to love what you do.',
        x: 540,
        y: 440,
        fontSize: 56,
        fontFamily: 'Georgia, serif',
        color: '#ffffff',
        fontWeight: 'normal',
        textAlign: 'center',
        maxWidth: 860,
      },
      {
        type: 'text',
        id: 'author',
        label: 'Author',
        placeholder: '— Steve Jobs',
        x: 540,
        y: 620,
        fontSize: 36,
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        textAlign: 'center',
      },
    ],
    isActive: true,
  },
];

// SVG backgrounds
const backgrounds = {
  'beach/background.svg': `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5e9"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#7dd3fc"/>
      </linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#0c4a6e"/>
      </linearGradient>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fde68a"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#sky)"/>
    <ellipse cx="200" cy="130" rx="80" ry="40" fill="white" opacity="0.6"/>
    <ellipse cx="320" cy="100" rx="120" ry="50" fill="white" opacity="0.5"/>
    <ellipse cx="800" cy="160" rx="100" ry="45" fill="white" opacity="0.55"/>
    <rect x="0" y="500" width="1080" height="300" fill="url(#sea)"/>
    <ellipse cx="540" cy="500" rx="540" ry="40" fill="#0369a1"/>
    <rect x="0" y="780" width="1080" height="300" fill="url(#sand)"/>
    <ellipse cx="540" cy="780" rx="540" ry="30" fill="#fde68a"/>
    <circle cx="900" cy="130" r="70" fill="#fbbf24" opacity="0.95"/>
    <circle cx="900" cy="130" r="82" fill="#fbbf24" opacity="0.15"/>
  </svg>`,

  'id-card/background.svg': `<svg width="1080" height="680" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="header" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#16213e"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="680" fill="#f8f9ff" rx="20"/>
    <rect width="1080" height="100" fill="url(#header)" rx="20"/>
    <rect y="80" width="1080" height="20" fill="url(#header)"/>
    <rect x="30" y="35" width="200" height="30" fill="#4a4a8a" rx="4"/>
    <rect x="30" y="75" width="120" height="4" fill="#7b7bcc" opacity="0.5"/>
    <rect x="0" y="580" width="1080" height="100" fill="#1a1a2e" rx="0"/>
    <rect x="0" y="560" width="1080" height="20" fill="#1a1a2e"/>
    <rect x="30" y="600" width="180" height="12" fill="#4a4a8a" opacity="0.6" rx="3"/>
    <rect x="30" y="625" width="120" height="8" fill="#4a4a8a" opacity="0.4" rx="2"/>
    <rect x="880" y="595" width="160" height="50" fill="#4a4a8a" opacity="0.3" rx="8"/>
    <rect x="60" y="130" width="240" height="280" fill="#e8eaf6" rx="8"/>
  </svg>`,

  'birthday/background.svg': `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fdf2f8"/>
        <stop offset="100%" stop-color="#fce7f3"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg)"/>
    ${Array.from({length: 40}, (_, i) => {
      const colors = ['#ff6b6b','#ffd700','#6b6bff','#ff9f43','#48dbfb','#ff9ff3'];
      const c = colors[i % colors.length];
      const x = Math.round(50 + (i * 997) % 980);
      const y = Math.round(20 + (i * 757) % 1040);
      const r = Math.round(5 + (i * 13) % 15);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="0.35"/>`;
    }).join('')}
    <text x="540" y="140" font-family="Georgia, serif" font-size="90" fill="#ff6b6b" text-anchor="middle" opacity="0.15">🎂</text>
    <rect x="80" y="80" width="920" height="920" fill="none" stroke="#ff6b6b" stroke-width="6" rx="40" opacity="0.2"/>
  </svg>`,

  'quote/background.svg': `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f0c29"/>
        <stop offset="50%" stop-color="#302b63"/>
        <stop offset="100%" stop-color="#24243e"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg)"/>
    <text x="80" y="380" font-size="400" font-family="Georgia, serif" fill="white" opacity="0.04">"</text>
    <circle cx="540" cy="540" r="420" fill="none" stroke="white" stroke-width="1" opacity="0.08"/>
    <circle cx="540" cy="540" r="480" fill="none" stroke="white" stroke-width="0.5" opacity="0.05"/>
    ${Array.from({length: 80}, (_, i) => {
      const angle = (i / 80) * Math.PI * 2;
      const r = 490;
      const x = Math.round(540 + Math.cos(angle) * r);
      const y = Math.round(540 + Math.sin(angle) * r);
      return `<circle cx="${x}" cy="${y}" r="2" fill="white" opacity="${(0.1 + (i % 5) * 0.06).toFixed(2)}"/>`;
    }).join('')}
  </svg>`,
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagegen');
  console.log('Connected to MongoDB');

  // Clear existing
  await Template.deleteMany({});
  console.log('Cleared existing templates');

  // Create SVG background files
  for (const [file, svg] of Object.entries(backgrounds)) {
    const fullPath = path.join(TEMPLATES_DIR, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, svg);
    console.log(`Created background: ${file}`);
  }

  // Seed templates
  for (const tpl of sampleTemplates) {
    const doc = new Template(tpl);
    await doc.save();
    fs.mkdirSync(path.join(TEMPLATES_DIR, doc._id.toString()), { recursive: true });
    console.log(`Seeded template: ${tpl.name} (${doc._id})`);
  }

  console.log('\nSeeding complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
