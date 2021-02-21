const express = require('express');

const router = express.Router();

router.get('/', (req, res) => res.send(req.session?.passport?.user));

router.get('/failure', (req, res) => res.send(`Failure!`));

module.exports = { router };
