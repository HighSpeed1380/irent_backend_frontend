const db = require('../util/database');

module.exports = class Approve {

    async getAll() {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Approve
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}