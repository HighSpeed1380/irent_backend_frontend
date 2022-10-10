const db = require('../util/database');

module.exports = class AccountType {

    async getByCompany(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM AccountType WHERE CompanyID = ${cID} AND Active=0
                Order By AccountType
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}