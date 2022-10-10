const db = require('../util/database');

module.exports = class Status {

    async getByID(statusID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From Status Where StatusID = ${statusID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}