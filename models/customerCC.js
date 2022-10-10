const db = require('../util/database');

module.exports = class CustomerCC {

    async getByCompany(cID) {
        let response = {};
        try {
            const res = await db.execute(`
                SELECT * FROM Customer_CC
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
                SELECT * FROM Customer_CC
                WHERE CustomerID = ${data.companyID}
            `);
            if(get[0].length > 0) {
                // update
                await db.execute(`
                    Update Customer_CC
                    set NameOnCard = '${data.nameOnCard}',
                        CreditCard = '${data.cardNumber}',
                        CCV = '${data.cardCCV}',
                        ExpirationMonth = '${data.cardExpMonth}',
                        ExpirationYear = '${data.cardExpYear}',
                        PostalCode = '${data.cardZip}'
                    Where Customer_CCID = ${get[0][0].Customer_CCID}
                `);
            } else {
                // insert
                await db.execute(`
                    INSERT INTO Customer_CC (CustomerID, NameOnCard, CreditCard, CCV, ExpirationMonth, ExpirationYear, PostalCode)
                    VALUES (${data.companyID}, '${data.nameOnCard}', '${data.cardNumber}', '${data.cardCCV}', '${data.cardExpMonth}', '${data.cardExpYear}', '${data.cardZip}')
                `);
            }
        } catch(err) {
            console.log(err);
        }
    }
}