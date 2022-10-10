const express =  require('express');
const router = express.Router();

const profileController = require('../../controllers/Profile/Profile');

router.get('/getUserProfileData/:uID', profileController.getUserProfileData);
router.post('/updateNotifications', profileController.updateNotifications);
router.post('/updatePreferences', profileController.updatePreferences);
router.post('/updatePassword', profileController.updatePassword);
router.post('/updateSignature', profileController.updateSignature);

module.exports = router;