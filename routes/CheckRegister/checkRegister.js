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
            console.log(file);
        const dt = new Date();
        const body = req.body;
        const month = (dt.getMonth() + 1).toString().padStart(2, "0");
        let path = `/wwwroot/rent/Receipts/${body.propertyID}/${dt.getFullYear()}/${month}/${body.checkRegisterID}.pdf`;
        callback(null, path) // custom file destination, file extension is added to the end of the path
      }
    })
  });

const checkRegisterController = require('../../controllers/CheckRegister/checkRegister');

router.post('/get', checkRegisterController.get);
router.get('/reconcile/:crID', checkRegisterController.reconcile);
router.get('/delete/:crID/:uID', checkRegisterController.delete);
router.post('/reconcile/debits', checkRegisterController.reconcileDebits);
router.post('/reconcile/credits', checkRegisterController.reconcileCredits);
router.get('/reconcileLog/:pID', checkRegisterController.getReconcileLog);
router.post('/getPreviousReconcile', checkRegisterController.getPreviousReconcile);
router.post('/completeReconcile', checkRegisterController.completeReconcile);
router.get('/getByID/:crID', checkRegisterController.getByID);
router.post('/updateBill', checkRegisterController.updateBill);
router.post('/updBillReceipt', upload.single('file'), checkRegisterController.updBillReceipt);
router.post('/updItem', checkRegisterController.updateItem);
router.get('/getEditTransactionData/:ttID', checkRegisterController.getEditTransactionData);

module.exports = router;