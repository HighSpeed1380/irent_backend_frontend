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

module.exports = class ThreeDayNotice {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * from threedaynotice 
                Where ThreeDayNoticeID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByTenant(tID) {
        let response = []
        try {
            const res = await db.execute(`
                SELECT tdn.BalanceOwed, tdn.SubmitDate, u.UserFName, u.UserLName, tdn.ThreeDayNoticeID
                FROM ThreeDayNotice tdn
                LEFT JOIN Users u ON tdn.UserID = u.UserID
                Where tdn.TenantID = ${tID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO ThreeDayNotice
                (UserID, SubmitDate, TenantID, BalanceOwed)
                VALUES(${data.userID}, '${formattedDate(new Date())}', ${data.tenantID}, ${data.balance})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}