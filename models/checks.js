const db = require('../util/database');

module.exports = class Check {

    async get() {
        let response = null;
        try {
            const res = await db.execute(`
                Select CheckID, Name From checks Order By Name
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}