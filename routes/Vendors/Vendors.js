const express =  require('express');
const router = express.Router();

const vendorsController = require('../../controllers/Vendors/Vendors');

router.get('/getAll/:cID', vendorsController.getAll);
router.get('/getByID/:vID', vendorsController.getByID);
router.post('/add', vendorsController.add);
router.get('/deactive/:vID', vendorsController.deactive);
router.post('/merge', vendorsController.merge);
router.post('/update', vendorsController.update);

module.exports = router;