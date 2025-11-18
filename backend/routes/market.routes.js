const express = require('express');
const router = express.Router();
const governateController = require('../controllers/governate.controller');

// Markets are represented by governates (markets list comes from governates)
router.get('/', governateController.getGovernates);
router.get('/:id', governateController.getGovernateById);

module.exports = router;
