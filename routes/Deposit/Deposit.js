const express =  require('express');
const router = express.Router();

const depositController = require('../../controllers/Deposit/Deposit');

router.post('/getSlip', depositController.getSlip);
router.get('/paymentTypes', depositController.getPaymentTypes);
router.get('/getProspects/:pID', depositController.getProspects);
router.get('/getCurrentTenants/:pID', depositController.getTenants);
router.get('/getFormerTenants/:pID', depositController.getFormerTenants);
router.post('/pendingTransactions', depositController.getPendingTransactions);
router.get('/getAllDepositSources', depositController.getAllDepositSources);
router.post('/emailReceipt', depositController.emailReceipt);
router.get('/delete/:ttID', depositController.delete);
router.post('/addTempTransaction', depositController.add);
router.post('/postDeposits', depositController.post);
router.get('/getTemp/:ttID', depositController.getTemp);
router.get('/getDepositSource/:dpID', depositController.getDepositSource);
router.post('/updateTempTransaction', depositController.updateTempTransaction);
router.get('/getDepositBreakdown/:crID', depositController.getDepositBreakdown);
router.post('/markSecurityDepositAsPaid', depositController.markSecurityDepositAsPaid);
router.post('/addLender', depositController.addLender);
router.get('/getHistory/:pID', depositController.getHistory);
router.get('/deleteDepositHistory/:crID', depositController.deleteDepositHistory);
router.get('/getEditDeposits/:crID', depositController.getEditDeposits);
router.get('/getTenantsByProperty/:pID', depositController.getTenantsByProperty);
router.post('/processTenantCCPayment', depositController.processTenantCCPayment);

module.exports = router;