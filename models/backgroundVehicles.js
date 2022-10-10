const db = require('../util/database');

module.exports = class BackgroundVehicles {

    async getByTenantID(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM BackgroundVehicles WHERE Tenantid = ${tID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}