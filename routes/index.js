const express = require('express');
const { artifacts } = require('../config/artifact');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

/* GET artifact runner page */
router.get('/artifact', (req, res) => {
  const names = Object.keys(artifacts);
  res.render('artifact', { artifacts, names });
});

module.exports = router;
