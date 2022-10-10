const db = require('../util/database');

module.exports = class ExpenseType {

    async getByCompanyID(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM ExpenseType 
                WHERE CompanyID = ${cID} AND Active = '0' 
                and ExpenseType != ''
                ORDER BY ExpenseType
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getListByCompanyID(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT et.ExpenseType, et.ExpenseTypeID, at.AccountType 
                FROM ExpenseType et
                JOIN AccountType at ON et.AccountTypeID = at.AccountTypeID
                WHERE et.CompanyID = ${cID} AND et.Active = '0' 
                and et.ExpenseType != ''
                ORDER BY et.ExpenseType
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
                INSERT INTO ExpenseType (ExpenseType, AccountTypeID, CompanyID)
                VALUES ('${data.expenseType}', ${data.accountTypeID}, ${data.companyID})
            `);
        } catch(err) {
            console.log(err)
        }
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE From ExpenseType 
                WHERE EXpenseTypeID = ${id}
            `);
        } catch(err) {
            console.log(err)
        }
    }

    async deactivate(id) {
        try {
            await db.execute(`
                UPDATE ExpenseType
                SET Active = 1
                WHERE ExpenseTypeID = ${id}
            `);
        } catch(err) {
            console.log(err)
        }
    }
}