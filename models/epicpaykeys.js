const db = require('../util/database');

module.exports = class EpicPayKeys {

    async getByPropertyID(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From epicpaykeys Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}