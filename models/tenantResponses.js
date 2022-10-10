const db = require('../util/database');
const moment = require('moment');

module.exports = class TenantResponses {

    async getByTenant(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM TenantResponses WHERE Tenantid = ${tID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}