const express = require('express');
const swagger = require('../libs/swagger');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(swagger, { explorer: true }));

module.exports = router;
