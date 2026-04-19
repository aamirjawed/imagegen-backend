const mongoose = require('mongoose');
const Template = require('./src/models/Template');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/imagegen', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    // Clear out testing templates
    await Template.deleteMany({});

    const templates = [
      {
        name: 'Basic Profile Template',
        description: 'A simple template with user photo.',
        category: 'General',
        thumbnailUrl: '/assets/sample-bg.png',
        width: 1080,
        height: 1080,
        background: 'sample-bg.png',
        elements: [
          {
            type: 'image',
            id: 'userPhoto',
            x: 290,
            y: 350,
            width: 500,
            height: 500,
            shape: 'circle'
          }
        ]
      },
      {
        name: 'Happy Birthday Card',
        description: 'Birthday template based on the uploaded image.',
        category: 'Birthday',
        thumbnailUrl: '/assets/birthday-bg.jpg',
        width: 1080,
        height: 1530,
        background: 'birthday-bg.jpg',
        elements: [
          {
            type: 'image',
            id: 'userPhoto',
            x: 180, 
            y: 300,
            width: 720,
            height: 720,
            shape: 'rectangle'
          }
        ]
      },
      {
        name: 'Cute Cupcakes Border',
        description: 'A beautiful colorful cupcake page border perfectly sized for A4.',
        category: 'General',
        thumbnailUrl: '/assets/Pink%20Colorful%20Cute%20Cupcakes%20Page%20Border%20A4%20Document.png',
        width: 2480,
        height: 3508,
        background: 'Pink Colorful Cute Cupcakes Page Border A4 Document.png',
        elements: [
          {
            type: 'image',
            id: 'userPhoto',
            x: 440,
            y: 800,
            width: 1600,
            height: 1600,
            shape: 'rectangle'
          }
        ]
      }
    ];

    const savedTemplates = await Template.insertMany(templates);
    console.log('Successfully inserted templates:');
    savedTemplates.forEach(t => console.log(`- ${t.name}: ${t._id}`));

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
