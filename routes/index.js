const express = require('express');
const benchmark = require('../libs/benchmark');
const docker = require('../libs/docker');
const { artifacts } = require('../config/artifact');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  const benchmarks = await benchmark.getBenchmarkFiles();
  const versions = await docker.getImitatorVersions();
  res.render('index', { benchmarks, versions });
});

/* GET artifact runner page */
router.get('/artifact', (req, res) => {
  const names = Object.keys(artifacts);
  res.render('artifact', { artifacts, names });
});

module.exports = router;
