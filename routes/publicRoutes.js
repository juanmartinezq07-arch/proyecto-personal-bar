const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();

router.get('/', publicController.home);
router.get('/menu', publicController.menu);
router.get('/nosotros', publicController.about);

module.exports = router;
