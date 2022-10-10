const db = require('../util/database');

module.exports = class Reports {

    async getReports() {
        let reports = [];
        try {
            const res = await db.execute(`
                Select * From Reports Order By Report
            `);
            reports = res[0];
        } catch(err) {
            console.log(err);
        }
        return reports;
    }

    async getApplicationSummary(data) {
        let response = [];
        try {
            const res = await db.execute(`
                Select t.tenantFname, t.tenantLName, t.ProspectStartDate, l.LeadSource, tp.Description
                From Tenants t
                LEFT JOIN LeadSource l ON t.LeadSourceID = l.LeadSourceID
                LEFT JOIN tenantsprospect tp ON t.prospect = tp.ProspectID
                Where PropertyID = ${data.propertyID}
                AND ProspectStartDate BETWEEN '${data.startDate}' AND '${data.endDate}'
                Order By ProspectStartDate
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}