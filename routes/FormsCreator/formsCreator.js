const express =  require('express');
const router = express.Router();

const formsController = require('../../controllers/FormsCreator/formsCreator');

router.get('/getForms/:pID', formsController.getForms);
router.get('/getForm/:pID/:formID', formsController.getForm);
router.delete('/:formID/:pID', formsController.delete);
router.get('/getDefault/:pID/:formID', formsController.loadDefault);
router.post('/save', formsController.save);
router.post('/create', formsController.createForm);
router.post('/variables', formsController.getFormsVaraibles);
router.get('/getPDF/:formID/PDF', formsController.openPDFForm);
router.get('/getSignedForm/:tID/:formID', formsController.getSignedForm);
router.post('/sendPDFEmail', formsController.sendPDFEmail);

module.exports = router;