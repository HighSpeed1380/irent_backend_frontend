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

module.exports = class EscrowPayments {
    async add(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO EscrowPayments
                (CheckRegisterID, Amount, ModifiedBy, ModifiedDate)
                VALUES (${data.checkRegisterID}, ${data.amount}, ${data.userID}, '${formattedDate(new Date())}');
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
            return -1;
        }
        return response;
    }

    async getByCheckRegister(crID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM escrowpayments WHERE CheckRegisterID = ${crID}
            `);
            response = res[0]
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}