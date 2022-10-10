const db = require('../util/database');

module.exports = class BackgroundReferences {

    async getByTenantID(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM BackgroundReferences WHERE Tenantid = ${tID}
            `);
            response = res[0]
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}