const db = require('../util/database');

module.exports = class TenantAllocatedPayment {

    async getByTransactionID(ttID) {
        let response = []
        try {
            const res = await db.execute(`
                Select tap.PaymentAmount, tap.CategoryID, pc.Category From tenantAllocatedPayments tap
                INNER JOIN paymentscategory pc ON tap.categoryID = pc.PaymentsCategoryID
                Where TenantTransactionID = ${ttID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async deleteByTransactionID(ttID) {
        try {
            await db.execute(`
                Delete From tenantAllocatedPayments 
                Where TenantTransactionID = ${ttID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO tenantAllocatedPayments (TenantTransactionID, CategoryID, PaymentAmount)
                VALUES (${data.tenantTransactionID}, ${data.categoryID}, ${data.paymentAmount})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}