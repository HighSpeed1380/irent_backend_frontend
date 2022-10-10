const db = require('../util/database');

module.exports = class Currencies {

    async getAll() {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Currencies Order By Name
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}