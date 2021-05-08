const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Imitator API',
      version: '0.1.0',
      description: 'API to run imitator',
      license: {
        name: 'GPL 3.0',
        url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
      },
      contact: {
        name: 'Jaime Arias',
        email: 'arias@univ-paris13.fr',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/imitator.js', './routes/artifact.js'],
};

module.exports = swaggerJSDoc(options);
