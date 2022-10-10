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

module.exports = class Notes {

    async getByTenantID(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select n.SubmitDate, n.Note, u.UserFName, u.UserLName
                From Notes n 
                JOIN Users u ON n.SubmittedBy = u.UserID
                Where n.TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO Notes
                (SubmittedBy, TenantID, SubmitDate, Note)
                VALUES (${data.userID}, ${data.tenantID}, '${formattedDate(new Date())}', '${data.note}');
            `);
        } catch(err) {
            console.log(err);
        }
    }
}