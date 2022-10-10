const db = require('../util/database');

module.exports = class AddOnProducts {

    async add(companyID) {
        try {
            await db.execute(`
                INSERT INTO AddOnProducts (CreditCheck, CompanyID, VICTIG)
                VALUES (1, ${companyID}, 1)
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByCompany(companyID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From AddOnProducts Where CompanyID = ${companyID}
            `);
            if(res[0].length > 0)
                response = res[0][0]
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}