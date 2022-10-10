const db = require('../util/database');

const today = new Date();
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

module.exports = class ReconcileLog {

    async getByPropertyID(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM ReconcileLog 
                Where PropertyID = ${pID}
                ORDER BY ReconcileLogID DESC limit 1
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async add(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO ReconcileLog
                (UserID, PropertyID, CheckRegisterIDs, ReconcileDate, Difference)
                VALUES (${data.userID}, ${data.propertyID}, '${data.crIDs}', '${formattedDate(new Date())}', ${data.difference});
            `);
        } catch(err) {
            console.log(err);
            return -1;
        }
        return response;
    }
}