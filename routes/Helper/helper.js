const express =  require('express');
const router = express.Router();

const pdfGeneratorController = require('../../controllers/Helper/PDFGenerator');

router.post('/generatePDF', pdfGeneratorController.generatePDF);

module.exports = router;