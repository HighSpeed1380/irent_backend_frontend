const express =  require('express');
const router = express.Router();

const ownersController = require('../../controllers/Owners/Owners');

router.get('/getOwners/:cID', ownersController.getOwners);
router.get('/deleteOwner/:oID', ownersController.deleteOwner);
router.post('/add', ownersController.addOwner);
router.get('/getOwner/:oID', ownersController.getOwner);
router.post('/edit', ownersController.editOwner);

module.exports = router;