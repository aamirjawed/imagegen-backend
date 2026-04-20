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
          },
          {
            type: 'text',
            id: 'name',
            label: 'Full Name',
            placeholder: 'Enter name',
            x: 540,
            y: 900,
            fontSize: 70,
            color: '#333333',
            textAlign: 'center',
            fontWeight: 'bold'
          },
          {
            type: 'text',
            id: 'number',
            label: 'Phone Number',
            placeholder: 'Enter number',
            x: 540,
            y: 1000,
            fontSize: 45,
            color: '#666666',
            textAlign: 'center'
          },
          {
            type: 'text',
            id: 'city',
            label: 'City',
            placeholder: 'Enter city',
            x: 540,
            y: 1060,
            fontSize: 40,
            color: '#888888',
            textAlign: 'center'
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
          },
          {
            type: 'text',
            id: 'name',
            label: 'Name',
            placeholder: 'Enter name',
            x: 540,
            y: 1100,
            fontSize: 60,
            color: '#a04245',
            textAlign: 'center',
            fontWeight: 'bold'
          },
          {
            type: 'text',
            id: 'number',
            label: 'Phone',
            placeholder: 'Enter number',
            x: 540,
            y: 1200,
            fontSize: 40,
            color: '#bb6a71',
            textAlign: 'center'
          },
          {
            type: 'text',
            id: 'city',
            label: 'City',
            placeholder: 'Enter city',
            x: 540,
            y: 1280,
            fontSize: 40,
            color: '#bb6a71',
            textAlign: 'center'
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
          },
          {
            type: 'text',
            id: 'name',
            label: 'Name',
            placeholder: 'Recipient Name',
            x: 1240, 
            y: 2500,
            fontSize: 140,
            color: '#ec4899',
            fontWeight: 'bold',
            textAlign: 'center'
          },
          {
            type: 'text',
            id: 'number',
            label: 'Number',
            placeholder: 'Enter number',
            x: 1240,
            y: 2700,
            fontSize: 80,
            color: '#333333',
            textAlign: 'center'
          },
          {
            type: 'text',
            id: 'city',
            label: 'City',
            placeholder: 'Enter city',
            x: 1240,
            y: 2850,
            fontSize: 80,
            color: '#333333',
            textAlign: 'center'
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
