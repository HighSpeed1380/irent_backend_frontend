const db = require('../util/database');

const today = new Date();
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

module.exports = class RecurringBills {

    async getBills(data) {
        let response = [];
        try {
            let res;
            if(data.multiProp) {
                res = await db.execute(`
                    Select rb.FirstPayDate, v.VendorName, p.PropertyName, p.PropertyID, et.ExpenseType,
                        f.Frequency, pm.PostMethod, rb.Paid, rb.Memo, rb.InvoiceNumber, v.Vendorid,
                        rb.Amount, rb.Escrow, rr.UploadDate, rb.RecurringBillsID, rb.Unlimited, rb.NumberofPayments
                    From recurringbills rb
                    JOIN vendors v ON rb.VendorID = v.VendorID
                    JOIN properties p On rb.PropertyID = p.PropertyID
                    JOIN userPropertyMap upm ON p.PropertyID = upm.PropertyID
                    JOIN expensetype et ON rb.ExpenseTypeID = et.ExpenseTypeID
                    JOIN frequency f ON rb.FrequencyID = f.FrequencyID
                    JOIN postMethod pm ON rb.PostMethodID = pm.PostmethodID
                    LEFT JOIN receiptsrecurring rr ON rb.RecurringBillsID = rr.RecurringBillID
                    Where upm.UserID = ${data.userID}
                `);
            } else {
                res = await db.execute(`
                    Select rb.FirstPayDate, v.VendorName, p.PropertyName, p.PropertyID, et.ExpenseType,
                        f.Frequency, pm.PostMethod, rb.Paid, rb.Memo, rb.InvoiceNumber, v.Vendorid,
                        rb.Amount, rb.Escrow, rr.UploadDate, rb.RecurringBillsID, rb.Unlimited, rb.NumberofPayments
                    From recurringbills rb
                    JOIN vendors v ON rb.VendorID = v.VendorID
                    JOIN properties p On rb.PropertyID = p.PropertyID
                    JOIN expensetype et ON rb.ExpenseTypeID = et.ExpenseTypeID
                    JOIN frequency f ON rb.FrequencyID = f.FrequencyID
                    JOIN postMethod pm ON rb.PostMethodID = pm.PostmethodID
                    LEFT JOIN receiptsrecurring rr ON rb.RecurringBillsID = rr.RecurringBillID
                    Where rb.PropertyID = ${data.propertyID}            
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM RecurringBills
                WHERE RecurringBillsID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async add(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO RecurringBills
                    (PropertyID, VendorID, Amount, Memo, ExpenseTypeID, FirstPayDate, 
                    TransactionType, Escrow, InvoiceNumber, SubmittedBy, SubmitDate, 
                    FrequencyID, PostMethodID, Unlimited, NumberofPayments, Paid)
                VALUES (${data.propertyID}, ${data.vendorID}, ${data.amount}, "${data.memo}", 
                    ${data.expenseTypeID}, '${formattedDate(data.firstPayDate)}', 0, ${data.escrow}, 
                    '${data.invoiceNumber}', ${data.userID}, '${formattedDate(new Date())}', ${data.frequencyID}, 
                    ${data.postMethodID}, ${data.unlimited}, ${data.numPayments}, ${data.paid});
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
            return -1;
        }
        return response;
    }
}