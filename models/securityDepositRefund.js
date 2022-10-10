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

module.exports = class SecurityDepositRefund {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO SecurityDepositRefund
                (TenantID, SubmitDate, Paid, RefundAmount, PaidDate, UserID, PropertyID)
                VALUES (${data.tenantID}, '${formattedDate(new Date())}', 0, ${data.refundAmount}, '${formattedDate(new Date())}', ${data.userID}, ${data.propertyID});
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async markPaid(id) {
        try {
            await db.execute(`
                UPDATE SecurityDepositRefund
                SET Paid = 1
                WHERE SecurityDepositRefundID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

}