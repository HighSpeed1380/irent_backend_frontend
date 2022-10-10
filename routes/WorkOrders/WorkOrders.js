const express =  require('express');
const router = express.Router();
var multer  = require('multer');
const FTPStorage = require('multer-ftp');

var upload = multer({
    storage: new FTPStorage({
      basepath: '/wwwroot/rent/iRentAppIMG',
      ftp: {
        host: '65.175.100.94',
        secure: false, // enables FTPS/FTP with TLS
        user: 'giovanniperazzo',
        password: 'iRent4Now!'
      },
      destination: function (req, file, options, callback) {
        const body = req.body;
        const fileName = `WKID_${body.workOrderID}.png`;
        let path = `/wwwroot/rent/iRentAppIMG/${body.propertyID}/${body.unitID}/${fileName}`;
        callback(null, path) // custom file destination, file extension is added to the end of the path
      }
    })
  });

const workOrdersController = require('../../controllers/WorkOrders/WorkOrders');

router.get('/getOpenWkSummary/:pID', workOrdersController.getOpenWKSummary);
router.get('/getPrintView/:wkID', workOrdersController.getPrintView);
router.get('/getMaintenance/:pID', workOrdersController.getMaintenanceUsers);
router.get('/getOpens/:pID', workOrdersController.getOpenWorkOrders);
router.get('/getClosed/:pID', workOrdersController.getClosedWorkOrders);
router.post('/add', workOrdersController.addWorkOrder);
router.post('/addFileNotification', upload.single('file'), workOrdersController.addFileNotification);
router.post('/getImage', workOrdersController.getImage);
router.get('/getbyID/:wkID', workOrdersController.getbyID);
router.get('/getUnit/:uID', workOrdersController.getUnit);
router.post('/update', workOrdersController.update);
router.get('/getRecurring/:pID', workOrdersController.getRecurringByProperty);
router.post('/addRecurring', workOrdersController.addRecurring);
router.get('/getRecurringByID/:id', workOrdersController.getRecurringByID);
router.post('/updateRecurring', workOrdersController.updateRecurring);
router.get('/inactivateRecurring/:id', workOrdersController.inactivateRecurring);
router.get('/getAddWKUnits/:pID', workOrdersController.getAddWKUnits);

module.exports = router;