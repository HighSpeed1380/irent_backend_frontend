const express =  require('express');
const router = express.Router();

const screeningController = require('../../controllers/BackgroundScreening/tazworks');
const cicController = require('../../controllers/BackgroundScreening/cic');

router.post('/tazworks/request', screeningController.requestReport);
router.post('/tazworks/getReport', screeningController.getReport);
router.post('/cic/getReport', cicController.getReport);
router.post('/cic/runReport', cicController.runReport);

module.exports = router;