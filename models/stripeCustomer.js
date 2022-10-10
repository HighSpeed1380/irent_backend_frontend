const db = require('../util/database');

module.exports = class StripeCustomer {

    async getByCompanyID(cID) {
        let response = "";
        try {
            const res = await db.execute(`
                SELECT StripeCustomer FROM Stripe_Customer WHERE CompanyID = ${cID}
            `);
            if(res[0].length > 0)
                response = res[0][0].StripeCustomer;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addByCompany(data) {
        try {
            await db.execute(`
                INSERT INTO Stripe_Customer (CompanyID, StripeCustomer)
                VALUES (${data.companyID}, '${data.stripeCustomerID}')
            `);
        } catch(err) {
            console.log(err);
        }
    }
}