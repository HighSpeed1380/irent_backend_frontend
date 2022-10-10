const db = require('../util/database');

module.exports = class CustomerBank {

    async getByCompany(cID) {
        let response = {};
        try {
            const res = await db.execute(`
                SELECT * FROM customer_bank
                WHERE CustomerID = ${cID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async insertUpdate(data) {
        try {
            const get = await db.execute(`
                SELECT * FROM customer_bank
                WHERE CustomerID = ${data.companyID}
            `);
            if(get[0].length > 0) {
                // update
                await db.execute(`
                    Update customer_bank
                    set AccountHolderName = '${data.accountHolderName}',
                        AccountNumber = '${data.accountNumber}',
                        RoutingNumber = '${data.routingNumber}'
                    Where CustomerBankID = ${get[0][0].CustomerBankID}
                `);
            } else {
                // insert
                await db.execute(`
                    INSERT INTO customer_bank (CustomerID, AccountHolderName, AccountNumber, RoutingNumber)
                    VALUES (${data.companyID}, '${data.accountHolderName}', '${data.accountNumber}', '${data.routingNumber}')
                `);
            }
        } catch(err) {
            console.log(err);
        }
    }

    async setVerified(cID) {
        try {
            await db.execute(`
                Update customer_bank
                set Verified = 1
                WHERE CustomerID = ${cID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}