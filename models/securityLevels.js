const db = require('../util/database');

module.exports = class SecurityLevels {

    async get() {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM SecurityLevel ORDER BY SecurityLevel
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM SecurityLevel Where SecurityLevelID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];  
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}