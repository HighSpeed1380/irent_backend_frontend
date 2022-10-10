const express =  require('express');
const router = express.Router();

const compProfileController = require('../../controllers/Company/profile');

router.get('/getDetails/:cID', compProfileController.getCompanyDetails);
router.get('/getCurrencies', compProfileController.getCurrencies);
router.post('/updateSettings', compProfileController.updateSettings);
router.post('/updateDetails', compProfileController.updateDetails);
router.get('/getExpenseTypes/:cID', compProfileController.getExistingExpenseTypes);
router.get('/getAccountTypes/:cID', compProfileController.getAccountTypes);
router.post('/addExpenseType', compProfileController.addExpenseType);
router.get('/deleteExpenseType/:etID', compProfileController.deleteExpenseType);
router.post('/mergeExpenseTypes', compProfileController.mergeExpenseTypes);

module.exports = router;