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

module.exports = class ChargesType {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From ChargeTypes WHERE ChargeTypeID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getAll(data) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM ChargeTypes ORDER BY ChargeType 
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByName(data) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * From ChargeTypes 
                Where ChargeType = '${data.categoryName}' and CHARGETYPEID <> 9
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}