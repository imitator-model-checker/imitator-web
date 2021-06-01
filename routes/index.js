const express = require('express');
const benchmark = require('../libs/benchmark');
const { artifacts } = require('../config/artifact');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  const files = await benchmark.getBenchmarkFiles();
  res.render('index', files);
});

/* GET artifact runner page */
router.get('/artifact', (req, res) => {
  const names = Object.keys(artifacts);
  res.render('artifact', { artifacts, names });
});

module.exports = router;
