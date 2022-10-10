const db = require('../util/database');
const moment = require("moment");

module.exports = class BackgroundScreenings {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From BackgroundScreenings 
                Where BackgroundScreeningsID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByProperty(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select bs.RequestURL, bs.UserID, bs.Password, bs.PackageName
                From BackgroundScreenings bs
                JOIN Properties p ON bs.BackgroundScreeningsID = p.BackgroundScreening
                Where p.PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPackages(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select bg.BackgroundScreeningsID, bg.PackageName
                From backgroundscreenings bg
                inner join rhawamemberpackages rpack ON bg.BackgroundScreeningsID = rpack.BackgroundScreeningID
                Where rpack.CompanyID = ${cID} AND rpack.active = 1
                order by bg.PackageName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}