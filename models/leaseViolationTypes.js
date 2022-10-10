const db = require('../util/database');

module.exports = class LeaseViolationTypes {

    async getAll() {
        let response = []
        try {
            const res = await db.execute(`
                select * from leaseviolationtypes Order By LeaseViolationType
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}