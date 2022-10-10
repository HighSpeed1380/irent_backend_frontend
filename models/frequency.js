const db = require('../util/database');

module.exports = class Frequency {

    async get() {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Frequency Order By Frequency
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}