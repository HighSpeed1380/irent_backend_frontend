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

module.exports = class Collections {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO Collections
                (TenantID, DateSent, SentToCollections)
                VALUES (${data.tenantID}, '${formattedDate(new Date())}', 1);
            `);
        } catch(err) {
            console.log(err);
        }
    }
}