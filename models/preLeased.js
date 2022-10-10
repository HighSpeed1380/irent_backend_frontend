const db = require('../util/database');

const formattedDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = class PreLeased {

    async add(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO PreLeased
	            (UserID, SubmitDate, PMoveInDate, TenantID, UnitID)
	            VALUES (${data.userID}, '${formattedDate(new Date())}', '${formattedDate(data.moveInDt)}', ${data.tenantID}, ${data.unitID});
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE From PreLeased
	            WHERE PreLeasedID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async deleteByUnitID(uID) {
        try {
            await db.execute(`
                DELETE FROM PreLeased
                WHERE UnitID = ${uID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}