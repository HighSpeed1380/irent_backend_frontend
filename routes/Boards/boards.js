const express =  require('express');
const router = express.Router();

const oodleController = require('../../controllers/Boards/oodle');
const facebookController = require('../../controllers/Boards/facebook');

//oodle
router.get('/oodle', oodleController.getXML);
router.post('/oodle/create', oodleController.createFeed);
// facebook
router.get('/facebook', facebookController.getXML);
router.post('/facebook/create', facebookController.createFeed);

module.exports = router;