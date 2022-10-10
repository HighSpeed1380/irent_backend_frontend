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

module.exports = class TenantTransactions {

    async getByID(ttID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * From TenantTransactions WHERE TenantTransactionID = ${ttID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTenantBalance(tID) {
        let balance = 0;
        try {
            let totalDebits = 0;
            let totalCredits = 0;
            const res = await db.execute(`
                SELECT *
                FROM TenantTransactions , TransactionTypes, ChargeTypes
                Where TenantTransactions.TransactionTypeID=TransactionTypes.TransactionTypeID
                AND TenantTransactions.TenantID=${tID}
                AND ChargeTypes.ChargeTypeID=TenantTransactions.ChargeTypeID
                ORDER BY TenantTransactionDate
            `);
            for(const tt of res[0]) {
                if(tt.TransactionTypeID === 1)
                    totalDebits += parseFloat(tt.TransactionAmount)
                else if(tt.TransactionTypeID === 2)
                    totalCredits += parseFloat(tt.TransactionAmount)            
            }
            balance = totalDebits - totalCredits;
        } catch(err) {
            console.log(err);
        }
        return balance;
    }

    async getThisMonthByProperty(pID) {
        let output = [];
        try {
            const res = await db.execute(`
                SELECT
                    sum(transactionamount) as amount, tenanttransactiondate as date
                FROM
                    tenanttransactions
                Where tenanttransactiondate between 
                    date_add(date_add(LAST_DAY(Now()),interval 1 DAY),interval -1 MONTH) 
                    and 
                    Now()
                and tenantid in (select tenantid from tenants where propertyid = ${pID})
                GROUP BY tenanttransactiondate
            `);
            output = res[0];
        } catch(err) {
            console.log(err);
        }
        return output;
    }

    async getLast6Months(pID) {
        let output = [];
        try {
            let isCash = false;
            let getCash = await db.execute(`
                Select ProfitLossReport From Properties Where PropertyID = ${pID}
            `);
            if(getCash[0].length > 0 && getCash[0][0].ProfitLossReport)
                isCash = getCash[0][0].ProfitLossReport === 1 ? true : false;

            const res = await db.execute(`
                Select 
                    sum(tt.transactionamount) as amount,
                    ${!isCash ?
                        `
                        concat(year(tt.tenanttransactiondate), ' ' ,monthname( tt.tenanttransactiondate) ) date 
                        ` 
                        :
                        `
                        concat(year(cr.InvoiceDate), ' ' ,monthname( cr.InvoiceDate) ) date 
                        `
                    } 
                From tenanttransactions tt
                JOIN  CheckRegister cr ON tt.CheckRegisterID = cr.CheckRegisterID
                Where tt.TransactionTypeID=2 and cr.PropertyID = ${pID} and tt.ChargeTypeID != 4
                ${!isCash ?
                    `
                        and tt.tenanttransactiondate between (last_day(curdate() - interval 1 month) + interval 1 day) - INTERVAL 6 MONTH and last_day(curdate() - interval 1 month)
                        Group By concat(year(tt.tenanttransactiondate), ' ' ,monthname( tt.tenanttransactiondate) )
                        order by tt.tenanttransactiondate
                    ` 
                    :
                    `
                        and cr.InvoiceDate between (last_day(curdate() - interval 1 month) + interval 1 day) - INTERVAL 6 MONTH and last_day(curdate() - interval 1 month) 
                        Group By concat(year(cr.InvoiceDate), ' ' ,monthname( cr.InvoiceDate) )
                        order by cr.InvoiceDate
                    `
                }
                
            `);
            output = res[0];
        } catch(err) {
            console.log(err);
        }
        return output;
    }

    async delete(ttID) {
        try {
            await db.execute(`
                DELETE FROM TenantTransactions
                WHERE TenantTransactionID = ${ttID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async deleteByCheckRegister(crID) {
        try {
            await db.execute(`
                DELETE FROM TenantTransactions
                WHERE CheckRegisterID = ${crID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getPaymentDetails(crID) {
        let response = [];
        try {
            const res = await db.execute(`
                select t.TenantFName, t.TenantLName, tt.TransactionAmount
                from tenanttransactions tt
                join tenants t ON tt.tenantID = t.tenantID
                Where tt.CheckRegisterID = ${crID}
            `);
            response = res[0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getTenantRefundableDeposit(tID) {
        let response = 0;
        try {
            const res = await db.execute(`
                SELECT TransactionAmount FROM TenantTransactions 
                WHERE TenantID = ${tID} AND ChargeTypeID=17 AND TransactionTypeID=1
            `);
            for(let i=0; i<res[0].length; i++) {
                response += res[0][i].TransactionAmount
            }
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getTenantLedger(tID) {
        let response = []
        try {
            const res = await db.execute(`
                Select tt.SubmittedBy, tt.TenantTransactionDate, tt.TenantTransactionID,
                tt.Comment, tt.TransactionAmount, ct.ChargeType, ct.ChargeTypeID, tt.TransactionTypeID,
                tt.CheckRegisterID, cr.CheckDate, tt.TenantID
                From TenantTransactions tt
                INNER JOIN ChargeTypes ct ON tt.ChargeTypeID = ct.ChargeTypeID
                INNER JOIN TransactionTypes ttype ON tt.TransactionTypeID = ttype.TransactionTypeID
                LEFT JOIN CheckRegister cr ON tt.CheckRegisterID = cr.CheckRegisterID
                Where tt.TenantID = ${tID}
                Order By tt.TenantTransactionDate 
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addOneTimeTransaction(data) {
        try {
            await db.execute(`
                INSERT INTO TenantTransactions
                (ChargeTypeID, TenantID, TransactionTypeID, TransactionAmount, Comment, TenantTransactionDate, 
                    PaymentTypeID, CheckRegisterID, SubmittedBy, CheckNumber, DepositSourceID)
                VALUES (10, ${data.tenantID}, 1, ${data.oneTimeCharge}, "Transfer Unit One Time Fees", 
                '${formattedDate(new Date())}', 0, 0, ${data.userID}, 0, 1);
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async isTransactionClosedOut(ttID) {
        let response = true;
        try {
            const res = await db.execute(`
                Select 1 From tenanttransactions
                inner join tenants on tenanttransactions.TenantID = Tenants.TenantID
                inner join properties on tenants.propertyid = properties.propertyid
                Where TenantTransactionID = ${ttID}
                and (properties.CloseOut is null or tenanttransactions.TenantTransactionDate > properties.CloseOut)
            `);
            if(res[0].length > 0)
                response = false;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getEditTransactionDetails(ttID) {
        let response = {};
        try {
            const res = await db.execute(`
                select ttype.TransactionType, tt.TransactionTypeID, tt.TransactionAmount, tt.TenantTransactionDate, 
                    tt.Comment, tt.ChargeTypeID, tt.TenantID, cr.Reconciled
                From TenantTransactions tt
                JOIN TransactionTypes ttype ON tt.TransactionTypeID = ttype.TransactionTypeID
                LEFT JOIN CheckRegister cr ON tt.CheckRegisterID = cr.CheckRegisterID
                Where tt.TenantTransactionID = ${ttID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async updEditTransaction(data) {
        try {
            await db.execute(`
                UPDATE TenantTransactions
                SET TenantID = ${data.tenantID},
                    TransactionAmount = ${data.transactionAmount},
                    TenantTransactionDate = '${moment.utc(data.transactionDate).format("YYYY-MM-DD")}',
                    ChargeTypeID = ${data.chargeTypeID},
                    SubmittedBy = ${data.userID},
                    Comment = '${data.comment}'
                WHERE TenantTransactionID = ${data.tenantTransactionID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async addOneTimeFee(data) {
        try {
            let dt = new Date();
            if(data.transactionDate !== undefined)
                dt = data.transactionDate;
            data.comment = data.comment.replace(/'/g, "\\'");
            if(data.paymentType === undefined)      data.paymentType = 0;
            if(data.checkRegister === undefined)    data.checkRegister = 0;
            if(data.checkNumber === undefined)      data.checkNumber = '0';
            if(data.stripeChargeID === undefined)   data.stripeChargeID = '';
            await db.execute(`
                INSERT INTO TenantTransactions
                (ChargeTypeID, TenantID, TransactionTypeID, TransactionAmount, Comment, TenantTransactionDate, PaymentTypeID, 
                    CheckRegisterID, SubmittedBy, CheckNumber, DepositSourceID, StripeChargeID)
                VALUES (${data.chargeTypeID}, ${data.tenantID}, ${data.transactionType}, ${data.amount}, 
                    '${data.comment}', '${formattedDate(dt)}', ${data.paymentType}, ${data.checkRegister}, ${data.userID}, 
                    '${data.checkNumber}', ${data.depositSourceID}, '${data.stripeChargeID}');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getSlipByCheckRegister(crID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select tt.TenantTransactionID as ID, tt.DepositSourceID, tt.Comment as TransactionComment, u.UnitID, u.UnitName,
                    t.TenantFName, t.TenantLName, tt.TransactionAmount, pt.PaymentType, tt.TenantTransactionDate,
                    tt.CheckNumber, pt.PaymentTypeID
                From TenantTransactions tt 
                JOIN Tenants t ON tt.TenantID = t.TenantID
                JOIN PaymentType pt ON tt.PaymentTypeID = pt.PaymentTypeID
                LEFT JOIN Units u ON u.UnitID = t.UnitID
                Where tt.CheckRegisterID = ${crID}
            `);
            response = res[0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getBalanceUntil(data) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT  SUM(CASE WHEN TransactionTypeID = 1 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalDebit,
                    SUM(CASE WHEN TransactionTypeID = 1 AND ChargeTypeID = 6 THEN TransactionAmount ELSE 0 END) AS HousingDebit,
                    SUM(CASE WHEN TransactionTypeID = 2 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalCredit,
                    SUM(CASE WHEN TransactionTypeID = 2 AND ChargeTypeID = 6 THEN TransactionAmount ELSE 0 END) AS HousingCredit
                From TenantTransactions
                Where TenantID = ${data.tenantID}
                AND TenantTransactionDate < '${formattedDate(data.date)}'
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getAfterDate(data) {
        let response = [];
        try {
            const res = await db.execute(`
                Select tt.TenantTransactionID, tt.TransactionAmount, tt.TenantTransactionDate, 
                    tt.Comment, ct.ChargeType, tt.TransactionTypeID
                From Tenanttransactions	tt
                JOIN Chargetypes ct ON tt.ChargeTypeID = ct.ChargeTypeID
                WHERE tt.ChargeTypeID not in (4, 6)
                AND tt.TenantTransactionDate >= '${formattedDate(data.date)}'
                AND tt.TenantID = ${data.tenantID}
            `);
            response = res[0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getTenantStatement(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select tt.TenantTransactionDate, tt.TransactionAmount, tt.TransactionTypeID, tt.Comment,
                    c.ChargeType
                From TenantTransactions tt
                INNER JOIN ChargeTypes c ON tt.ChargeTypeID = c.ChargeTypeID
                Where tt.TenantID = ${tID}
            `);
            response = res[0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async depositBreakdown(crID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select tt.Comment, tt.TransactionAmount, tt.TenantTransactionDate, tt.TenantTransactionID, 
                    pt.PaymentType, t.TenantFName, t.TenantLName, u.UnitName, p.PropertyName, tt.TenantID
                From TenantTransactions tt
                JOIN PaymentType pt on tt.PaymentTypeID = pt.PaymentTypeID
                LEFT JOIN Tenants t on tt.tenantID = t.tenantID
                LEFT JOIN Units u on t.UnitID = u.UnitID
                LEFT JOIN Properties p ON p.PropertyID = t.PropertyID
                WHERE tt.CheckRegisterID = ${crID}
            `);
            response = res[0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getEditTransactionData(ttID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select tType.TransactionType, tt.ChargeTypeID, tt.TransactionAmount, tt.TenantTransactionDate,
                    tt.TenantID, tt.Comment, cr.CheckRegisterID, tt.DepositSourceID
                From TenantTransactions tt
                JOIN TransactionTypes tType ON tt.TransactionTypeID = tType.TransactionTypeID
                LEFT JOIN CheckRegister cr ON tt.CheckRegisterID = cr.CheckRegisterID
                Where tt.TenantTransactionID = ${ttID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async updTransactionType(data) {
        try {
            await db.execute(`
                UPDATE TenantTransactions
                SET TransactionTypeID = ${data.transactionTypeID}
                WHERE TenantTransactionID = ${data.tenantTransactionID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByCheckRegister(crID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM TenantTransactions WHERE CheckRegisterID = ${crID}
            `);
            response = res[0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }
}