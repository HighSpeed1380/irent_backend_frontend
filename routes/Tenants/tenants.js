const express =  require('express');
const router = express.Router();
var multer  = require('multer');
const FTPStorage = require('multer-ftp');

var upload = multer({
    storage: new FTPStorage({
      basepath: '/wwwroot/rent/TenantFiles',
      ftp: {
        host: '65.175.100.94',
        secure: false, // enables FTPS/FTP with TLS
        user: 'giovanniperazzo',
        password: 'iRent4Now!'
      },
      destination: function (req, file, options, callback) {
        const body = req.body;
        let path = `/wwwroot/rent/TenantFiles/${body.propertyID}/${body.tenantID}/${body.docName}`;
        callback(null, path) // custom file destination, file extension is added to the end of the path
      }
    })
  });

const tenantsController = require('../../controllers/Tenants/Tenants');

router.post('/getTenants', tenantsController.getTenants);
router.get('/getBalance/:tID', tenantsController.getTenantBalance);
router.get('/getRefundableDeposit/:tID', tenantsController.getRefundableDeposit);
router.get('/getMoveOutReasons/:cID', tenantsController.getMoveOutReasons);
router.post('/moveOut', tenantsController.moveOut);
router.post('/updEviction', tenantsController.updEviction);
router.get('/tenant/:tID', tenantsController.getTenant);
router.get('/unit/:tID', tenantsController.getTenantUnit);
router.get('/othersOnLease/:tID', tenantsController.getOthersOnLease);
router.get('/leadSource/:lsID', tenantsController.getLeadSource);
router.get('/leaseAgent/:uID', tenantsController.getLeaseAgent);
router.get('/vehicles/:tID', tenantsController.getVehicles);
router.post('/getApplication', tenantsController.getApplication);
router.post('/getCreditReport', tenantsController.getCreditReport);
router.get('/documents/:tID', tenantsController.getDocuments);
router.get('/forms/:tID', tenantsController.getForms);
router.post('/formsList', tenantsController.getListForms);
router.get('/3DayNoticeAmt/:pID', tenantsController.get3DayNoticeAmt);
router.get('/ledger/:tID', tenantsController.getLedger);
router.get('/deleteTransaction/:ttID', tenantsController.deleteTransaction);
router.get('/workOrders/:tID', tenantsController.getWorkOrders);
router.get('/deleteWK/:wkID', tenantsController.deleteWK);
router.get('/commentsNotes/:tID', tenantsController.getCommentsNotes);
router.post('/addCommentNote', tenantsController.addCommentNote);
router.get('/promissToPay/:tID', tenantsController.getPromiss);
router.post('/addPromissToPay', tenantsController.addPromissToPay);
router.post('/editPromissToPay', tenantsController.editPromissToPay);
router.get('/deletePromissToPay/:ppID', tenantsController.deletePromissToPay);
router.post('/addOthersOnLease', tenantsController.addOthersOnLease);
router.post('/updateOthersOnLease', tenantsController.updateOthersOnLease);
router.post('/addVehicle', tenantsController.addVehicle);
router.post('/editVehicle', tenantsController.editVehicle);
router.get('/deleteVehicle/:tvID', tenantsController.deleteVehicle);
router.get('/deleteOthersOnLease/:tolID', tenantsController.deleteOthersOnLease);
router.get('/emergencyContacts/:tID', tenantsController.getEmergencyContacts);
router.post('/addEmergencyContact', tenantsController.addEmergencyContact);
router.get('/deleteEmergencyContact/:tecID', tenantsController.deleteEmergencyContacts);
router.post('/updateEmergencyContact', tenantsController.updateEmergencyContact);
router.get('/leaseViolations/:tID', tenantsController.getLeaseViolations);
router.get('/deleteLeaseViolation/:lvID', tenantsController.deleteLeaseViolation);
router.get('/threeDayNotices/:tID', tenantsController.getThreeDayNotice);
router.get('/vacantUnits/:pID', tenantsController.getVacantUnitByProperty);
router.get('/background/:tID', tenantsController.getTenantBackground);
router.post('/transfer', tenantsController.transferTenant);
router.get('/getAllocatedPayments/:ttID', tenantsController.getAllocatedPayments);
router.get('/getPaymentCategories/:pID', tenantsController.getPaymentCategories);
router.get('/transactionAmount/:ttID', tenantsController.getTransactionAmount);
router.post('/allocatePayment', tenantsController.saveAllocatePayment);
router.post('/addPaymentCategory', tenantsController.addPaymentCategory);
router.post('/updDetails', tenantsController.updateTenantDetails);
router.post('/updRecurringCharges', tenantsController.updateRecurringCharges);
router.post('/updRecurringConcession', tenantsController.updateRecurringConcession);
router.post('/updLeaseDates', tenantsController.updateLeaseDates);
router.get('/futureLeaseChange/:tID', tenantsController.getFutureLeaseChange);
router.post('/updFutureLeaseChanges', tenantsController.updateFutureLeaseChanges);
router.get('/documentTypes', tenantsController.getDocumentTypes);
router.get('/getDocuments/:tID', tenantsController.getEditTenantDocuments);
router.post('/addDocument', upload.single('file'), tenantsController.addDoument);
router.post('/createDirectory', tenantsController.createDirectory);
router.post('/deleteDocument', tenantsController.deleteDocument);
router.get('/isTransactionClosed/:ttID', tenantsController.isTransactionClosedOut);
router.get('/getEditTransactionDetails/:ttID', tenantsController.getEditTransactionDetails);
router.get('/getEditTransactionType/:ttypeID', tenantsController.getEditTransactionTypes);
router.get('/getEditTransactionTenants/:tID', tenantsController.getEditTransactionTenants);
router.post('/editTransaction', tenantsController.editTransaction);
router.get('/getUnitCharges/:uID', tenantsController.getUnitCharges);
router.post('/addTenant', tenantsController.addTenant);
router.get('/getChargeTypes', tenantsController.getChargeTypes);
router.post('/applyAdditionalCharges', tenantsController.applyAdditionalCharges);
router.post('/getPreviousTenants', tenantsController.getPreviousTenants);
router.post('/getReconcilePrevious', tenantsController.getReconcilePreviousTenants);
router.get('/getSendToCollection/:cID', tenantsController.getSendToCollection);
router.get('/sendToCollection/:tID', tenantsController.sendToCollection);
router.get('/getCompanyPropDetails/:tID', tenantsController.getCompanyPropertyDetails);
router.post('/getBalanceUntil', tenantsController.getTenantBalanceUntil);
router.post('/getTransactionsAfterDate', tenantsController.getTransactionsAfterDate);
router.get('/getTempTransactionDetails/:ttID', tenantsController.getTempTransactionDetails);
router.post('/getAllTenantsStatement', tenantsController.getAllTenantsStatement);
router.get('/getMoveOutStatementData/:tID', tenantsController.getMoveOutStatementData);
router.get('/getTenantTransactionsStatement/:tID', tenantsController.getTenantTransactionsStatement);
router.post('/sendLedgerToTenant', tenantsController.sendLedgerToTenant);
router.get('/getByUnit/:uID', tenantsController.getByUnit);
router.post('/updMoveOutDate', tenantsController.updMoveOutDate);
router.get('/getPreLeaseProspects/:pID', tenantsController.getPreLeaseProspects);
router.post('/setPreLeased', tenantsController.setPreLeased);
router.get('/deletePreLeased/:plID', tenantsController.deletePreLeased);
router.post('/updateTenantTransactionType', tenantsController.updateTenantTransactionType);
router.post('/updateDelinquencyComment', tenantsController.updateDelinquencyComment);

module.exports = router;