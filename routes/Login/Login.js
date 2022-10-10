const express =  require('express');
const router = express.Router();

const loginController = require('../../controllers/Login/Login');

router.post('/login', loginController.login);
router.post('/forgetPassword', loginController.forgetPassword);
router.get('/getNotifications/:uID', loginController.getUserNotifications);

module.exports = router;