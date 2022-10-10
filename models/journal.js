const db = require('../util/database');
const moment = require('moment')

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

module.exports = class Journal {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO Journal (PropertyID, JournalTypeID, JournalAmount, DateEntered, EnteredBy, 
                    JournalDescription, ModifiedBy, ModifiedDate, LenderID, CheckRegisterID)
            VALUES (${data.propertyID}, ${data.journalType}, ${data.amount}, '${formattedDate(new Date())}', 
                ${data.userID}, '${data.description}', ${data.userID}, '${formattedDate(new Date())}', ${data.lenderID}, ${data.checkRegisterID})
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From Journal Where JournalID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async deleteByID(id) {
        try {
            await db.execute(`
                DELETE FROM Journal WHERE JournalID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByCheckRegister(crID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From Journal 
                where checkregisterid = ${crID}                
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getAllByCheckRegister(crID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Journal 
                where checkregisterid = ${crID}                
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getEntriesByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select j.JournalID, jt.JournalType, j.JournalDescription, j.JournalAmount, j.DateEntered,
                u.UserFName as enteredFName, u.UserLName as enteredLName, 
                u2.UserFName as modifiedFName, u2.UserLName as modifiedLName, j.ModifiedDate
                From Journal j
                JOIN JournalType jt ON j.JournalTypeID = jt.JournalTypeID
                LEFT JOIN Users u ON u.UserID = j.EnteredBy
                LEFT JOIN Users u2 ON u2.UserID = j.ModifiedBy
                WHERE j.PropertyID = ${pID}            
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async includeJornal(data) {
        try {
            await db.execute(`
                INSERT INTO Journal (JournalDescription, JournalTypeID, JournalAmount, PropertyID, DateEntered, EnteredBy, 
                    ModifiedBy, ModifiedDate, LenderID)
                VALUES ('${data.description}', ${data.journalTypeID}, ${data.amount}, ${data.propertyID}, '${moment.utc().format("YYYY-MM-DD")}', 
                    ${data.userID}, ${data.userID}, '${moment.utc().format("YYYY-MM-DD")}', ${data.lenderID});
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
            
        try {
            await db.execute(`
                UPDATE Journal
                set JournalDescription = '${data.description}',
                    JournalAmount = ${data.amount},
                    JournalTypeID = ${data.journalTypeID},
                    ModifiedBy = ${data.userID},
                    ModifiedDate = '${moment.utc().format("YYYY-MM-DD")}'
                Where JournalID = ${data.journalID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}