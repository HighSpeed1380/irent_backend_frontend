const db = require('../util/database');

module.exports = class UnitTypes {

    async getByID(utID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From UnitTypes Where UnitTypeID = ${utID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByunitID(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From Units Where UnitID = ${uID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByPropertyID(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM UnitTypes WHERE PropertyID = ${pID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}