const express =  require('express');
const router = express.Router();

const homeController = require('../../controllers/Home/home');

router.get('/vacancySnapshots/:pID', homeController.getVacancySnapshot);
router.get('/plSnapshot/:pID', homeController.getPLSnapshot);
router.get('/actionItems/:pID', homeController.getActionItems);
router.get('/workOrders/:pID', homeController.getWKSnapshot);
router.get('/missingEmailPhone/:pID', homeController.getMissingPhoneEmails);
router.get('/concessiongRequests/:pID', homeController.getConcessionRequests);
router.get('/audit/:pID', homeController.getAudit);
router.get('/securityDeposit/:pID', homeController.getSecurityDeposit);
router.get('/missedPromisesPay/:pID', homeController.getMissedPromisePays);
router.get('/delinquenciesOver/:pID', homeController.getDelinquenciesOver);
router.get('/getThisMonthPayments/:pID', homeController.getThisMonthPayments);
router.get('/getLast6MonthsPayment/:pID', homeController.getLast6Months);
router.get('/getUserFullName/:uID', homeController.getUserFullName);
router.post('/updateVacantDate', homeController.updateVacantDate);
router.post('/updateNote', homeController.updateUnitNote);
router.get('/getActionItem/:aiID', homeController.getActionItem);
router.post('/updateActionItem', homeController.updateActionItem);
router.post('/updatePromissToPay', homeController.updatePromissToPay);
router.get('/getMissedPromisePayDetails/:ppID', homeController.getMissedPromisePayDetails);
router.post('/updPromissToPayDetails', homeController.updPromissToPayDetails);
router.get('/getNotifications/:pID', homeController.getNotifications);

module.exports = router;