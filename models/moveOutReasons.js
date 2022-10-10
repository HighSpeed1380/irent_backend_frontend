const db = require('../util/database');

module.exports = class MoveOutReasons {

    async getByCompany(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM MoveOutReason 
                WHERE CompanyID = ${cID} 
                ORDER BY MoveOutReason
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}