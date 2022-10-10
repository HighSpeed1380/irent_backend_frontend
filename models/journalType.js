const db = require('../util/database');
const moment = require('moment');

module.exports = class JournalType {

    async getAll() {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM JournalType ORDER BY JournalType              
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}