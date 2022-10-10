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

module.exports = class CheckRegister {

    async get(data) {
        let response = [];
        try {
            let res;
            const filterCR = () => {
                if(data.checkRegisterID !== null) {
                    return ` AND cr.CheckRegisterID = ${data.checkRegisterID} `;
                } else {
                    return ` AND cr.CheckDate BETWEEN '${data.startDate}' AND '${data.endDate}'`
                }
            }
            if(!data.singleCheckbook) {
                res = await db.execute(`
                    Select cr.CheckRegisterID, cr.CheckDate, v.VendorName, et.ExpenseType, p.PropertyName, cr.Paid,
                    cr.Memo, cr.InvoiceNumber, cr.Amount, cr.TransactionType, r.UploadDate, p.PropertyID, cr.Reconciled
                    From CheckRegister cr
                    LEFT JOIN Vendors v ON cr.VendorID = v.VendorID
                    JOIN ExpenseType et ON cr.ExpenseTypeID = et.ExpenseTypeID
                    JOIN Properties p ON cr.PropertyID = p.PropertyID
                    LEFT JOIN Receipts r ON cr.CheckRegisterID = r.CheckRegisterID
                    Where p.PropertyID = ${data.propertyID}
                    ${filterCR()}
                    Group By cr.CheckRegisterID
                    Order By cr.CheckDate desc
                `);
            } else {
                res = await db.execute(`
                    Select cr.CheckRegisterID, cr.CheckDate, v.VendorName, et.ExpenseType, p.PropertyName, cr.Paid,
                    cr.Memo, cr.InvoiceNumber, cr.Amount, cr.TransactionType, r.UploadDate, p.PropertyID, cr.Reconciled
                    From CheckRegister cr
                    LEFT JOIN Vendors v ON cr.VendorID = v.VendorID
                    JOIN ExpenseType et ON cr.ExpenseTypeID = et.ExpenseTypeID
                    JOIN Properties p ON cr.PropertyID = p.PropertyID
                    JOIN UserPropertyMap upm ON p.PropertyID = upm.PropertyID
                    LEFT JOIN Receipts r ON cr.CheckRegisterID = r.CheckRegisterID
                    Where upm.userID = ${data.userID}
                    ${filterCR()}
                    Group By cr.CheckRegisterID
                    Order By cr.CheckDate desc
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getUnpaidBills(data) {
        let response = [];
        try {
            let res;
            if(!data.multiProp) {
                res = await db.execute(`
                    Select cr.invoiceDate, v.vendorName, p.propertyname, et.expensetype, cr.memo, cr.invoicenumber,
                    cr.amount, cr.escrow, cr.vendorid, cr.checkregisterid, r.UploadDate, p.propertyID
                    From CheckRegister cr
                    JOIN Vendors v on cr.VendorID = v.VendorID
                    JOIN Properties p on cr.propertyID = p.PropertyID
                    JOIN expensetype et on cr.ExpenseTypeID = et.ExpenseTypeID
                    LEFT JOIN Receipts r ON cr.checkregisterid = r.checkregisterid
                    Where cr.Paid = 0
                    and p.propertyid = ${data.pID}
                    group by cr.checkregisterid
                    order by cr.invoiceDate
                `);
            } else {
                res = await db.execute(`
                    Select cr.invoiceDate, v.vendorName, p.propertyname, et.expensetype, cr.memo, cr.invoicenumber,
                    cr.amount, cr.escrow, cr.vendorid, cr.checkregisterid, r.UploadDate, p.propertyID
                    From CheckRegister cr
                    JOIN Vendors v on cr.VendorID = v.VendorID
                    JOIN userpropertymap upm on cr.propertyID = upm.PropertyID
                    JOIN properties p ON upm.propertyid = p.propertyid
                    JOIN expensetype et on cr.ExpenseTypeID = et.ExpenseTypeID
                    LEFT JOIN Receipts r ON cr.checkregisterid = r.checkregisterid
                    Where cr.Paid = 0
                    and upm.userID = ${data.uID}
                    group by cr.checkregisterid
                    order by cr.invoiceDate
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPaidBills(data) {
        let response = [];
        try {
            const res = await db.execute(`
                Select cr.invoiceDate, v.vendorName, p.propertyname, et.expensetype, cr.memo, cr.invoicenumber,
                cr.amount, cr.escrow, cr.vendorid, cr.checkregisterid, r.UploadDate, p.propertyID, cr.PaidDate
                From CheckRegister cr
                JOIN Vendors v on cr.VendorID = v.VendorID
                JOIN Properties p on cr.propertyID = p.PropertyID
                JOIN expensetype et on cr.ExpenseTypeID = et.ExpenseTypeID
                LEFT JOIN Receipts r ON cr.checkregisterid = r.checkregisterid
                Where cr.Paid = 1
                and cr.InvoiceDate BETWEEN '${data.startDate}' and '${data.endDate}'
                and p.propertyid = ${data.propertyID}
                ${parseInt(data.vendorID) === 0 ? '' : ` and cr.VendorID = ${data.vendorID}`}
                group by cr.checkregisterid
                order by cr.invoiceDate
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async reconcile(cID) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET Reconciled = '0'
                WHERE CheckRegisterID = ${cID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async notReconcile(cID) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET Reconciled = '1'
                WHERE CheckRegisterID = ${cID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async completeReconcileAll(crIDs) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET Reconciled='1'
                WHERE CheckRegisterID in (${crIDs})
            `);
        } catch(err) {
            console.log(err);
            return -1;
        }
        return 0;
    }

    async updAmount(data) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET Amount = ${data.amount}
                WHERE CheckRegisterID = ${data.checkRegisterID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async delete(cID) {
        try {
            await db.execute(`
                DELETE FROM CheckRegister
                WHERE CheckRegisterID = ${cID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async markPaid(crID, uID) {
        try {
            await db.execute(`
            UPDATE CheckRegister
            SET Paid='1',
                UpdatedBy = ${uID},
                PaidDate = '${formattedDate(new Date())}'
            WHERE CheckRegisterID = ${crID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async markAllPaid(crIDs, uID) {
        try {
            await db.execute(`
            UPDATE CheckRegister
            SET Paid='1',
                UpdatedBy = ${uID},
                PaidDate = '${formattedDate(new Date())}'
            WHERE CheckRegisterID in (${crIDs})
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async markUnpaid(crID, uID) {
        try {
            await db.execute(`
            UPDATE CheckRegister
            SET Paid='0',
                UpdatedBy = ${uID},
                PaidDate = '${formattedDate(new Date())}'
            WHERE CheckRegisterID = ${crID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByID(crID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From checkregister
                Where CheckRegisterID = ${crID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        let response = 0;
        try {
            if(data.transactionType === undefined)
                data.transactionType = 1;
            if(data.paid === undefined)
                data.paid = 0;
            const res = await db.execute(`
                INSERT INTO CheckRegister
                (PropertyID, VendorID, Amount, Memo, ExpenseTypeID, CheckDate, TransactionType, 
                 Paid, Reconciled, Escrow, InvoiceDate, PaidDate, InvoiceNumber, SubmittedBy, UnitID)
                VALUES (${data.propertyID}, ${data.vendorID}, ${data.amount}, '${data.memo}', 
                 ${data.expenseTypeID}, '${formattedDate(new Date())}', ${data.transactionType}, ${data.paid}, '0', ${data.escrow}, 
                 '${moment.utc(data.invoiceDate).format("YYYY-MM-DD")}', '${formattedDate(new Date())}', '${data.invoiceNumber}', 
                 ${data.userID}, ${data.unitID});
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
            return -1;
        }
        return response;
    }

    async isClosedOut(crID) {
        let response = false;
        try {
            const res = await db.execute(`
                Select 1 From checkregister
                INNER JOIN properties ON checkregister.PropertyID = properties.PropertyID
                Where CheckRegisterID = ${crID}
                and (properties.CloseOut is null or checkregister.InvoiceDate > properties.CloseOut)
            `);
            response = res[0].lenght > 0 ? true : false;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPayeeUpdate(data) {
        let response = {
            amount: null,
            expenseTypeID: null,
            lenderID: null
        };
        try {
            const res = await db.execute(`
                Select CheckregisterID, Amount, ExpenseTypeID From CheckRegister
                Where VendorID = ${data.vendorID}
                AND PropertyID = ${data.propertyID}
                order by CheckregisterID desc
                limit 1
            `);
            if(res[0].length > 0) {
                response.amount = res[0][0].Amount;
                response.expenseTypeID = res[0][0].ExpenseTypeID;
                if(parseInt(res[0][0].ExpenseTypeID) === 18) {
                    const getJournal = await db.execute(`
                        select LenderID from journal
                        where checkregisterid = ${res[0][0].CheckregisterID}
                    `);
                    if(getJournal[0].length > 0)
                        response.lenderID = getJournal[0][0].LenderID;
                }
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getReconcileDebits(data) {
        let response = [];
        try {
            let res;
            if(!data.singleCheckbook) {
                res = await db.execute(`
                    Select cr.CheckRegisterID, cr.CheckDate, v.VendorName, cr.Amount
                    From CheckRegister cr
                    JOIN Vendors v ON cr.VendorID = v.VendorID
                    Where cr.TransactionType = 1
                    and cr.Reconciled = 0 and cr.Paid = 1
                    and cr.PropertyID = ${data.propertyID}
                    Order By cr.Amount
                `);
            } else {
                res = await db.execute(`
                    Select cr.CheckRegisterID, cr.CheckDate, v.VendorName, cr.Amount
                    From CheckRegister cr
                    JOIN Vendors v ON cr.VendorID = v.VendorID
                    JOIN Properties p ON cr.PropertyID = p.PropertyID
                    JOIN UserPropertyMap upm ON p.PropertyID = upm.PropertyID
                    Where cr.TransactionType = 1
                    and cr.Reconciled = 0 and cr.Paid = 1
                    and upm.userID = ${data.userID}
                    Order By cr.Amount
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPreviousReconcile(data) {
        let response = 0;
        try {
            let res;
            if(!data.singleCheckbook) {
                res = await db.execute(`
                    SELECT
                        SUM(CASE WHEN cr.TransactionType = 1 THEN cr.Amount ELSE 0 END) AS TotalDebit,
                        SUM(CASE WHEN cr.TransactionType = 2 THEN cr.Amount ELSE 0 END) AS TotalCredit
                    From CheckRegister cr
                    JOIN ExpenseType et ON cr.ExpenseTypeID = et.ExpenseTypeID
                    Where cr.Reconciled = 1
                    and cr.PropertyID = ${data.propertyID}
                `);
            } else {
                res = await db.execute(`
                    SELECT
                        SUM(CASE WHEN cr.TransactionType = 1 THEN cr.Amount ELSE 0 END) AS TotalDebit,
                        SUM(CASE WHEN cr.TransactionType = 2 THEN cr.Amount ELSE 0 END) AS TotalCredit
                    From CheckRegister cr
                    JOIN ExpenseType et ON cr.ExpenseTypeID = et.ExpenseTypeID
                    JOIN Properties p ON cr.PropertyID = p.PropertyID
                    JOIN UserPropertyMap upm ON p.PropertyID = upm.PropertyID
                    Where cr.Reconciled = 1
                    and upm.userID = ${data.userID}
                `);
            }
            if(res[0].length > 0) {
                response = parseFloat(res[0][0].TotalCredit) - parseFloat(res[0][0].TotalDebit);
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getReconcileCredits(data) {
        let response = [];
        try {
            let res;
            if(!data.singleCheckbook) {
                res = await db.execute(`
                    Select cr.CheckRegisterID, cr.CheckDate, cr.Memo, cr.Amount
                    From CheckRegister cr
                    Where cr.TransactionType = 2 AND cr.Reconciled != 1
                    and cr.PropertyID = ${data.propertyID}
                `);
            } else {
                res = await db.execute(`
                    Select cr.CheckRegisterID, cr.CheckDate, cr.Memo, cr.Amount
                    From CheckRegister cr
                    JOIN Properties p ON cr.PropertyID = p.PropertyID
                    JOIN UserPropertyMap upm ON p.PropertyID = upm.PropertyID
                    Where cr.TransactionType = 2 AND cr.Reconciled != 1
                    and upm.userID = ${data.userID}
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByPropertyID(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From checkregister
                Where PropertyID = ${pID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updEscrowReimbursement(crID) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET ExpenseTypeID = 44
                WHERE CheckRegisterID = ${crID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updBill(data) {
        try {
            const paidDT = data.paidDate !== null ? `'${formattedDate(data.paidDate)}'` : null
            await db.execute(`
                UPDATE CheckRegister
                SET Amount = ${data.amount},
                    Memo = '${data.memo}',
                    InvoiceNumber = '${data.invoiceNumber}',
                    ExpenseTypeID = ${data.expenseTypeID},
                    VendorID = ${data.vendorID},
                    Escrow = ${data.escrow},
                    PaidDate = ${paidDT},
                    InvoiceDate = '${formattedDate(data.invoiceDate)}',
                    UnitID = ${data.unitID}
                WHERE CheckRegisterID = ${data.crID}
            `);
            
        } catch(err) {
            console.log(err);
        }
    }

    async updItem(data) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET Amount = ${data.amount},
                    Memo = '${data.memo}',
                    InvoiceNumber = '${data.invoiceNumber}'
                WHERE CheckRegisterID = ${data.id}
            `);
            return 0;
        } catch(err) {
            return -1;
        }
    }

    async mergeVendor(data) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET VendorID = ${data.vendor2ID}
                WHERE VendorID = ${data.vendor1ID}
            `);
            return 0;
        } catch(err) {
            return -1;
        }
    }

    async mergeExpenseTypes(data) {
        try {
            await db.execute(`
                UPDATE CheckRegister
                SET ExpenseTypeID = ${data.expType2}
                WHERE ExpenseTypeID = ${data.expType1}
                AND PropertyID in (Select PropertyID From Properties Where CompanyID = ${data.companyID})
            `);
            return 0;
        } catch(err) {
            return -1;
        }
    }

    async getDepositsHistory(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT cr.CheckRegisterID, cr.CheckDate, cr.Memo, cr.Amount, cr.VendorID, cr.TransactionType, cr.Reconciled,
                et.ExpenseType,
                    fromDate, toDate
            FROM CheckRegister cr
            INNER JOIN ExpenseType et ON cr.ExpenseTypeID = et.ExpenseTypeID
            LEFT JOIN (
                SELECT CheckRegisterID
                        , MIN(TenantTransactionDate) AS fromDate
                        , MAX(TenantTransactionDate) AS toDate
                        FROM  TenantTransactions
                        GROUP BY CheckRegisterID
            ) tt ON tt.CheckRegisterID = cr.CheckRegisterID
            Where cr.PropertyID = ${pID}
            AND cr.VendorID = 0
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}