const express = require('express');
const benchmark = require('../libs/benchmark');
const { artifacts } = require('../config/artifact');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  const { models } = await benchmark.getBenchmarkFiles();
  res.render('index', { models });
});

/* GET artifact runner page */
router.get('/artifact', (req, res) => {
  const names = Object.keys(artifacts);
  res.render('artifact', { artifacts, names });
});

module.exports = router;
