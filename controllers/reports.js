const reportsModel = require('../models/reports');
const Email = require('../util/email');

const reports = new reportsModel();

exports.getReports = async (req, res, next) => {
    try {
        let response = await reports.getReports();
        return res.json(response);
    } catch(err) {
        const email = new Email();
        email.errorEmail(
            err,
            "Reports Controler - getReports"
        );
        return res.json([]);
    }   
}

exports.getApplicationSummary = async (req, res, next) => {
    try {
        const data = req.params;
        let response = await reports.getApplicationSummary({
            propertyID: data.pID,
            startDate: data.sDt,
            endDate: data.eDt
        });
        return res.json(response);
    } catch(err) {
        const email = new Email();
        email.errorEmail(
            err,
            "Reports Controler - getApplicationSummary"
        );
        return res.json([]);
    }   
};