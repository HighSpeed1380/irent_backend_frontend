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

module.exports = class PromissToPay {

    async getByTenantID(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select pp.SubmittedBy, pp.PromissDate, pp.Promiss, u.UserFName, u.UserLName,
                pp.StaffComment, yn.YesNo, pp.PromissToPayID
                From PromissToPay pp
                JOIN YesNo yn ON pp.Success = yn.YesNoID
                JOIN Users u ON pp.SubmittedBy = u.UserID
                Where pp.TenantID = ${tID}
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
                INSERT INTO PromissToPay
                (SubmittedBy, TenantID, SubmitDate, Promiss, PromissDate, StaffComment, Success, 
                 UpdatedBy, UpdateDate)
                VALUES (${data.userID}, ${data.tenantID}, '${formattedDate(new Date())}', '${data.promiss}', 
                '${formattedDate(data.promissDate)}', 0, 2, ${data.userID}, '${formattedDate(new Date())}')
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async edit(data) {
        try {
            await db.execute(`
                UPDATE PromissToPay
                set SubmittedBy = ${data.userID},
                    SubmitDate = '${formattedDate(new Date())}',
                    Promiss = '${data.promiss}',
                    PromissDate ='${formattedDate(data.promissDate)}'
                WHERE PromissToPayID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM PromissToPay
                WHERE PromissToPayID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updateSuccess(data) {
        try {
            await db.execute(`
                UPDATE PromissToPay
                SET Success = ${data.success}
                WHERE PromissToPayID = ${data.promissToPayID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByID(ppID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select pp.SubmitDate, pp.PromissDate, u.UserFName, u.UserLName, pp.Success,
                    pp.Promiss, pp.StaffComment
                From PromissToPay pp
                JOIN Users u ON pp.SubmittedBy = u.UserID
                Where pp.PromissToPayID = ${ppID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async update(data) {
        try {
            await db.execute(`
                UPDATE PromissToPay
                SET SubmitDate = '${formattedDate(data.submitDate)}',
                    PromissDate = '${formattedDate(data.promissDate)}',
                    Success = ${data.success},
                    Promiss = '${data.promiss}',
                    StaffComment = '${data.staffComment}'
                WHERE PromissToPayID = ${data.promissToPayID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}