const express =  require('express');
const router = express.Router();

const reportsController = require('../controllers/reports');

router.get('/getReports', reportsController.getReports);
router.get('/getApplicationSummary/:pID/:sDt/:eDt', reportsController.getApplicationSummary);

module.exports = router;