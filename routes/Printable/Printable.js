const express =  require('express');
const router = express.Router();

const printableController = require('../../controllers/Printable/Printable');

router.post('/getForm', printableController.getForm);
router.post('/sendDocTenantSignature', printableController.sendDocTenantSignature);
router.post('/saveThreeDayNotice', printableController.saveThreeDayNotice);
router.get('/getLeaseViolationTypes', printableController.getLeaseViolationTypes);
router.post('/addLeaseViolationComment', printableController.addLeaseViolationComment);

module.exports = router;