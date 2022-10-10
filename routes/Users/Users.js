const express =  require('express');
const router = express.Router();

const usersController = require('../../controllers/Users/Users');

router.get('/getUsers/:cID', usersController.getUsers);
router.get('/getPropertiesByCompany/:cID', usersController.getPropertiesByCompany);
router.get('/getSecurityLevels', usersController.getSecurityLevels);
router.post('/add', usersController.addUser);
router.get('/deactivateUser/:uID', usersController.deactivateUser);
router.get('/getUser/:uID', usersController.getUser);
router.post('/editUser', usersController.editUser);

module.exports = router;