const db = require('../util/database');

module.exports = class LayoutMapContact {

    async getByPropertyID(pID) {
        let response = {};
        try {
            const res = await db.execute(`
                SELECT * FROM Layout_Map_Contact WHERE PropertyID = ${pID}
            `);
            response = res[0][0] || null;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}