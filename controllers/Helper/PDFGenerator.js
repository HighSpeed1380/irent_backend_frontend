const html_to_pdf = require('html-pdf-node');
const Email = require('../../util/email');

exports.generatePDF = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        const content = data.html;
        let options = { 
            format: 'A4', 
        };
        let file = { content };
        html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            //res.setHeader('Content-Type', 'application/pdf')
            //return res.end(pdfBuffer.toString('base64'));
                //console.log(pdfBuffer.toString('base64'));
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Content-Type', 'application/pdf');
            return res.end(pdfBuffer);
        });
    } catch(err) {
            console.log(err);
        /*
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Helper-PDFGenerator Controller - generatePDF"
        );
        */
        return res.json(-1);
    }  
}