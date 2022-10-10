const express =  require('express');
const router = express.Router();
var multer  = require('multer');
const FTPStorage = require('multer-ftp');

var upload = multer({
  storage: new FTPStorage({
    basepath: '/wwwroot/Receipts',
    ftp: {
      host: '65.175.100.94',
      secure: false, // enables FTPS/FTP with TLS
      user: 'giovanniperazzo',
      password: 'iRent4Now!'
    },
    destination: function (req, file, options, callback) {
      const dt = new Date();
      const body = req.body;
      const month = (dt.getMonth() + 1).toString().padStart(2, "0");
      let path = `/wwwroot/rent/Receipts/${body.propertyID}/${dt.getFullYear()}/${month}/${body.checkRegisterID}.pdf`;
      callback(null, path) // custom file destination, file extension is added to the end of the path
    }
  })
});

var upload2 = multer({
  storage: new FTPStorage({
    basepath: '/wwwroot/rent/ReceiptsRecurring',
    ftp: {
      host: '65.175.100.94',
      secure: false, // enables FTPS/FTP with TLS
      user: 'giovanniperazzo',
      password: 'iRent4Now!'
    },
    destination: function (req, file, options, callback) {
      const dt = new Date();
      const body = req.body;
      const month = (dt.getMonth() + 1).toString().padStart(2, "0");
      let path = `/wwwroot/rent/ReceiptsRecurring/${body.propertyID}/${dt.getFullYear()}/${month}/${body.recurringBillID}.pdf`;
      callback(null, path) // custom file destination, file extension is added to the end of the path
    }
  })
});

const billsController = require('../../controllers/Bills/bills');

router.get('/payees/:cID', billsController.getPayees);
router.get('/expenseTypes/:cID', billsController.getExpenseTypes);
router.get('/lenders/:cID', billsController.getLenders);
router.get('/units/:pID', billsController.getUnits);
router.post('/unpaid', billsController.getUnpaidBills);
router.post('/paid', billsController.getPaidBills);
router.get('/delete/:crID', billsController.deleteBill);
router.get('/markPaid/:crID/:uID', billsController.markPaid);
router.get('/markUnpaid/:crID/:uID', billsController.markUnpaid);
router.post('/addBill', billsController.add);
router.post('/addReceipt', upload.single('file'), billsController.addBillReceipt);
router.get('/isClosedOut/:crID', billsController.isCheckRegisterClosedOut);
router.post('/getAppBill', billsController.billUploadedApp);
router.get('/frequency', billsController.getFrequency);
router.get('/postMethods', billsController.getPostMethod);
router.post('/recurringBills', billsController.getRecurringBills);
router.get('/deleteReccuring/:rbID', billsController.deleteRecurring);
router.post('/addRecurring', billsController.addRecurring);
router.post('/addRecurringReceipt', upload2.single('file'), billsController.addRecurringReceipt);
router.get('/userProperties/:uID', billsController.getUserProperties);
router.get('/updatedPayee/:pID/:vID', billsController.getPayeeUpdate);
router.post('/markAllPaid', billsController.markAllPaid);
router.get('/getDupes/:pID', billsController.getDupes);

module.exports = router;