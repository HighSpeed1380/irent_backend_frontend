const db = require('../util/database');
const moment = require('moment')

module.exports = class TransactionChanges {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO TransactionChanges
                (TransactionChangeDate, OriginalTransactionDate, NewTransactionDate, TenantTransactionID, SubmittedBy, 
                    OrignalTransactionAmount, NewTransactionAmount, OriginalTransactionTypeID, NewTransactionTypeID, 
                    OriginalComment, NewComment, PropertyID, OriginalTenantID, NewTenantID)
                VALUES ('${moment.utc().format("YYYY-MM-DD")}', '${moment.utc(data.originalTransactionDate).format("YYYY-MM-DD")}', '${moment.utc(data.transactionDate).format("YYYY-MM-DD")}',
                ${data.tenantTransactionID}, ${data.userID}, ${data.originalAmount}, ${data.transactionAmount},
                ${data.originalChargeTypeID}, ${data.chargeTypeID}, '${data.originalComment}', '${data.comment}',
                ${data.propertyID}, ${data.originalTenantID}, ${data.tenantID})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}