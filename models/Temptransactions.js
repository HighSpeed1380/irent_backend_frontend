const db = require('../util/database');
const moment = require('moment');

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

module.exports = class TempTransactions {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                select * From TempTransactions 
                Where TempTransactionID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getSlip(data) {
        let response = [];
        try {
            let res;
            if(data.multiProp && data.singlecheckbook) {
                res = await db.execute(`
                    Select temp.TempTransactionID as ID, temp.DepositSourceID, temp.TransactionComment, u.UnitID, u.UnitName,
                        t.TenantFName, t.TenantLName, temp.TenantAmount, temp.HousingAmount, temp.OtherAmount,
                        pt.PaymentType, pt.PaymentTypeID, temp.TransactionDate, temp.CheckNumber
                    From Temptransactions temp
                    LEFT JOIN Tenants t ON temp.TenantID = t.TenantID
                    JOIN PaymentType pt ON temp.PaymentTypeID = pt.PaymentTypeID
                    LEFT JOIN Units u ON t.UnitID = u.UnitID
                    JOIN userpropertymap upm temp cr.propertyID = upm.PropertyID
                    Where upm.userID = ${data.userID}
                `);
            } else {
                res = await db.execute(`
                    Select temp.TempTransactionID as ID, temp.DepositSourceID, temp.TransactionComment, u.UnitID, u.UnitName,
                        t.TenantFName, t.TenantLName, temp.TenantAmount, temp.HousingAmount, temp.OtherAmount,
                        pt.PaymentType, pt.PaymentTypeID, temp.TransactionDate, temp.CheckNumber
                    From Temptransactions temp
                    LEFT JOIN Tenants t ON temp.TenantID = t.TenantID
                    JOIN PaymentType pt ON temp.PaymentTypeID = pt.PaymentTypeID
                    LEFT JOIN Units u ON t.UnitID = u.UnitID
                    Where temp.PropertyID = ${data.propertyID}
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTransactionReceiptData(id) {
        let response = null;
        try {
            const res = await db.execute(`
                select t.TenantFName, t.TenantLName, u.UnitName, t.TenantPhone, t.TenantEmail,
                    tt.TransactionDate, tt.TenantAmount, tt.HousingAmount, pt.PaymentType
                From TempTransactions tt
                JOIN Tenants t ON tt.TenantID = t.TenantID
                JOIN Units u ON t.UnitID = u.UnitID
                JOIN Paymenttype pt ON tt.PaymentTypeID = pt.PaymentTypeID
                Where tt.TempTransactionID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async getDepositTransactions(data) {
        let response = [];
        try {
            let res;
            if(data.multiProp) {
                res = await db.execute(`
                    SELECT tt.TenantID, tt.TransactionComment, p.PropertyName, tt.PropertyID,
                        tt.TenantAmount, tt.HousingAmount, tt.OtherAmount, pt.PaymentTypeID,
                        tt.TransactionDate, tt.TempTransactionID, tt.PaymentTYpeID, tt.DepositSourceID, pt.PaymentType,
                        u.UnitName, t.TenantFName, t.TenantLName, t.EvictionFiled, t.TenantEmail
                    FROM TempTransactions tt
                    JOIN UserPropertyMap upm ON tt.PropertyID = upm.PropertyID 
                    JOIN Properties p ON p.PropertyID = tt.PropertyID
                    LEFT JOIN PaymentType pt ON tt.PaymentTypeID = pt.PaymentTypeID
                    LEFT JOIN Tenants t ON tt.TenantID = t.TenantID
                    LEFT JOIN Units u ON t.UnitID = u.UnitID
                    WHERE upm.UserID = ${data.userID}
                `);
            } else {
                res = await db.execute(`
                    SELECT tt.TenantID, tt.TransactionComment, tt.TenantAmount, tt.HousingAmount, tt.OtherAmount, tt.TransactionDate, 
                        tt.TempTransactionID, tt.PaymentTYpeID, tt.DepositSourceID, pt.PaymentType, pt.PaymentTypeID, tt.PropertyID,
                        u.UnitName, t.TenantFName, t.TenantLName, t.EvictionFiled, t.TenantEmail
                    FROM TempTransactions tt
                    LEFT JOIN PaymentType pt ON pt.PaymentTypeID = tt.PaymentTypeID
                    LEFT JOIN Tenants t ON tt.TenantID = t.TenantID
                    LEFT JOIN Units u ON t.UnitID = u.UnitID
                    WHERE tt.PropertyID = ${data.propertyID}
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
                DELETE FROM TempTransactions
                WHERE TempTransactionID = ${id}
            `);
        } catch(err) {  
            console.log(err);
        }
    }

    async add(data) {
        try {
            if([1,4,7].includes(data.depositSourceID)) {
                if(parseInt(data.depositSourceID) === 4)
                    data.tenantID = data.prospectID;
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (${data.amount}, 0, ${data.tenantID}, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, 0, '', '${data.checkNumber}', ${data.depositSourceID});
                `);
            } else if(data.depositSourceID === 2) {
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (0, ${data.amount}, ${data.tenantID}, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, 0, '', '${data.checkNumber}', ${data.depositSourceID});
                `);
            } else if(data.depositSourceID === 3) {
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (0, 0, 0, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, ${data.amount}, '${data.comment}', '${data.checkNumber}', ${data.depositSourceID});
                `);
            } else if(data.depositSourceID === 11) {
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (0, 0, 0, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, ${data.amount}, 'Laundry Room', '${data.checkNumber}', ${data.depositSourceID});
                `);
            } else if(data.depositSourceID === 5) {
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (0, 0, 0, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, ${data.amount}, '${data.comment}', '${data.checkNumber}', ${data.depositSourceID});
                `);
            } else if(data.depositSourceID === 6) {
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (0, 0, 0, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, ${data.amount}, '${data.lenderID.toString()}', '${data.checkNumber}', ${data.depositSourceID});
                `);
            } else if(data.depositSourceID === 12) {
                await db.execute(`
                    INSERT INTO TempTransactions
                        (TenantAmount, HousingAmount, TenantID, PropertyID, TransactionDate, PaymentTypeID, 
                        OtherAmount, TransactionComment, CheckNumber, DepositSourceID)
                    VALUES (0, 0, ${data.tenantID}, ${data.propertyID}, '${moment.utc(data.transactionDate).format('YYYY-MM-DD')}', 
                        ${data.paymentTypeID}, ${data.amount}, '0', '${data.checkNumber}', ${data.depositSourceID});
                `);
            }
        } catch(err) {
            console.log(err);
        }
    }

    async getAmountsByProperty(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select sum(TenantAmount) as TotalTenantAmount,
                sum(HousingAmount) as TotalHousingAmountAmount, sum(OtherAmount) as TotalOtherAmount
                From TempTransactions
                Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {  
            console.log(err);
        }
        return response;
    }

    async deleteByProperty(data) {
        try {
            if(data.multiProp) {
                await db.execute(`
                    DELETE FROM TempTransactions
                    WHERE PropertyID in (
                        Select Properties.PropertyID From Properties
                        INNER JOIN UserPropertyMap ON UserPropertyMap.PropertyID = Properties.PropertyID
                        Where UserPropertyMap.UserID = ${data.userID}
                    )
                `);
            } else {
                await db.execute(`
                    DELETE FROM TempTransactions WHERE PropertyID = ${data.propertyID}
                `);
            }
        } catch(err) {  
            console.log(err);
        }
    }

    async edit(data) {
        try {
            await db.execute(`
                UPDATE TempTransactions
                set HousingAmount = ${data.housingAmount !== undefined ? data.housingAmount : 0},
                    TenantAmount = ${data.tenantAmount !== undefined ? data.tenantAmount : 0},
                    OtherAmount = ${data.otherAmount !== undefined ? data.otherAmount : 0},
                    TenantID = ${data.tenantID !== undefined ? data.tenantID : 0},
                    TransactionDate = '${formattedDate(data.transactionDate)}',
                    PaymentTypeID = ${data.paymentTypeID},
                    TransactionComment = '${data.comment}',
                    CheckNumber = '${data.checkNumber}'
                WHERE TempTransactionID = ${data.id}
            `);
        } catch(err) {  
            console.log(err);
        }
    }
}