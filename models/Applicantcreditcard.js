const db = require('../util/database');
const moment = require('moment');

module.exports = class ApplicantCreditCard {

    async getByTenant(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From applicantcreditcard Where TenantID = ${tID}
            `);
            response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}