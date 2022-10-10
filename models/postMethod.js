const db = require('../util/database');

module.exports = class PostMethod {

    async get() {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From PostMethod Order By PostMethod
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}