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

module.exports = class LeaseViolations {

    async getByID(id) {
        let response = null
        try {
            const res = await db.execute(`
                select lv.LeaseViolationDescription, lv.SubmitDate, lvt.LeaseViolationType 
                from LeaseViolations lv 
                JOIN LeaseVIolationTypes lvt ON lv.LeaseViolationTypeID = lvt.LeaseViolationTypeID 
                WHERE lv.LeaseViolationID = ${id}
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
                Select lvt.LeaseViolationType, lv.SubmitDate, lv.LeaseViolationDescription,
                u.UserFName, u.UserLName, lv.LeaseViolationID, lv.LeaseViolationTypeID
                From LeaseViolations lv
                JOIN LeaseViolationTypes lvt ON lv.LeaseViolationTypeID = lvt.LeaseViolationTypeID
                LEFT JOIN Users u ON lv.UserID = u.UserID
                Where lv.TenantID = ${tID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM LeaseViolations
                WHERE LeaseViolationID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    } 

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO LeaseViolations
                (LeaseViolationTypeID, LeaseViolationDescription, SubmitDate, TenantID, UserID)
                VALUES(${data.leaseViolationTypeID}, '${data.leaseViolationDescription}', 
                    '${formattedDate(new Date())}', ${data.tenantID}, ${data.userID})
            `);
        } catch(err) {
            console.log(err);
        }
    } 
}