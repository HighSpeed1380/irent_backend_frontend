const db = require('../util/database');
const moment = require('moment');

module.exports = class CreditCheckLog {

    async getByTenantID(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From CreditCheckLog 
                Where TenantID = ${tID} 
                AND TenantsOthersOnLeaseID=0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByOthersOnLeaseID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM CreditCheckLog WHERE TenantsOthersOnLeaseID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            let sql = "Insert Into CreditCheckLog (PropertyID, Submittedby, SubmittedOn, ReportID, `Key`, `Status`, StatusCode, ViewID,";
            sql += `
                RequestAdvisement, AdvisementResults, Link, Note, Paid, PaidDate, TenantID, TenantsOthersOnLeaseID)
                VALUES (${data.propertyID}, ${data.userID}, '${moment.utc().format("YYYY-MM-DD")}', '${data.reportID}',
                '${data.key}', '0', 0, '0', '0', '0', '0', '0', 0, '${moment.utc().format("YYYY-MM-DD")}',
                ${data.tenantID}, ${data.tenantOthersOnLeaseID})
            `
            await db.execute(sql);
        } catch(err) {
            console.log(err);
        }
    }
}