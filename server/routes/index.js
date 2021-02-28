const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session?.passport?.user) {
    res.send({ active: true });
  } else {
    res.send({ active: false, message: 'No valid user session' });
  }
});

module.exports = { router };
