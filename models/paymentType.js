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

module.exports = class PaymentType {

    async getAll() {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM PaymentType ORDER BY PaymentType
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
                Select * From PaymentType Where PaymentTypeID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}