const express = require('express');
const router = express.Router();
const governateController = require('../controllers/governate.controller');

router.get('/', governateController.getGovernates);
router.get('/:id', governateController.getGovernateById);

module.exports = router;
