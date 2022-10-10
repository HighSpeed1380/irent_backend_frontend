const db = require('../util/database');

module.exports = class LeadSource {

    async get(lsID) {
        let response = {};
        try {
            const res = await db.execute(`
                SELECT * FROM LeadSource 
                Where LeadSourceID = ${lsID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByCompany(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM LeadSource WHERE CompanyID = ${cID}
            `);
            response = res[0]
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}