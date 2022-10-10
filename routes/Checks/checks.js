const express =  require('express');
const router = express.Router();

const checkController = require('../../controllers/Checks/checks');

router.get('/', checkController.getChecks);

module.exports = router;