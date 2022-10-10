const db = require('../util/database');

module.exports = class Snapshots {

    async vacancySnapshot(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select u.UnitID, u.UnitName, ut.UnitType, u.VacantDate, u.Comment, 
                    ut.UnitCharge, t.tenantFName, t.TenantLName, pl.PreLeasedID
                From Units u 
                JOIN Unittypes ut ON u.unittypeid = ut.unittypeid
                LEFT JOIN PreLeased pl ON pl.UnitID = u.UnitID
                LEFT JOIN Tenants t ON pl.TenantID = t.TenantID
                Where u.PropertyID = ${pID}
                AND u.Occupied = 0
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async plSnapshot(pID) {
        let response = {
            GrossIncome: 0,
            OperatingExpenses: 0,
            NonOperatingExpenses: 0,
            NetIncome: 0,
            GrossPotencialRent: 0,
            LastMonthIncome: 0
        };

        try {
            let isCash = false;
            let getCash = await db.execute(`
                Select ProfitLossReport From Properties Where PropertyID = ${pID}
            `);
            if(getCash[0].length > 0 && getCash[0][0].ProfitLossReport)
                isCash = getCash[0][0].ProfitLossReport === 1 ? true : false;

            let res = await db.execute(`
                Select SUM(CASE WHEN tt.TransactionTypeID = 2 AND tt.ChargeTypeID != 4 THEN TransactionAmount ELSE 0 END) AS GrossIncome
                From TenantTransactions tt Join CheckRegister cr ON tt.CheckRegisterID = cr.CheckRegisterID
                Where cr.PropertyID = ${pID}
                ${!isCash ? 
                    'and tt.TenantTransactionDate BETWEEN DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-1 DAY) AND LAST_DAY(NOW())' :
                    'and cr.InvoiceDate BETWEEN DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-1 DAY) AND LAST_DAY(NOW())'
                }
            `);
            if(res[0].length > 0 && res[0][0].GrossIncome)
                response.GrossIncome = res[0][0].GrossIncome === '' ? 0 : res[0][0].GrossIncome;

            res = await db.execute(`
                SELECT sum(Amount) as Amount FROM CheckRegister Where TransactionType=1
                AND PropertyID = ${pID} AND InvoiceDate BETWEEN DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-1 DAY) AND LAST_DAY(NOW())
                AND CheckRegister.ExpenseTypeID in (SELECT ExpenseTypeID FROM ExpenseType WHERE AccountTypeID!=19)
            `);
            if(res[0].length > 0 && res[0][0].Amount)
                response.OperatingExpenses = res[0][0].Amount === '' ? 0 : res[0][0].Amount;

            res = await db.execute(`
                SELECT sum(Amount) as Amount FROM CheckRegister Where TransactionType=1
                AND PropertyID = ${pID} AND InvoiceDate BETWEEN DATE_SUB(LAST_DAY(NOW()),INTERVAL DAY(LAST_DAY(NOW()))-1 DAY) AND LAST_DAY(NOW())
                AND CheckRegister.ExpenseTypeID in (SELECT ExpenseTypeID FROM ExpenseType WHERE AccountTypeID=19)
            `);
            if(res[0].length > 0 && res[0][0].Amount) {
                response.NonOperatingExpenses = res[0][0].Amount === '' ? 0 : res[0][0].Amount;
            }

            response.NetIncome = parseFloat(response.GrossIncome) - (parseFloat(response.OperatingExpenses) + parseFloat(response.NonOperatingExpenses));

            res = await db.execute(`
                SELECT sum(UnitTypes.UnitCharge) as total
                FROM Units, UnitTypes
                Where Units.PropertyID = ${pID} 
                AND Units.UnitTypeID=UnitTypes.UnitTypeID
            `);
            if(res[0].length > 0 && res[0][0].total) 
                response.GrossPotencialRent = res[0][0].total;

            res = await db.execute(`
                SELECT sum(TenantTransactions.TransactionAmount) as Total 
                FROM TenantTransactions, CheckRegister  
                WHERE CheckRegister.CheckRegisterID=TenantTransactions.CheckRegisterID
                AND TransactionTypeID=2 AND CheckRegister.PropertyID = ${pID} AND ChargeTypeID<>4
                ${!isCash ? 
                    `and TenantTransactionDate BETWEEN DATE_FORMAT(Now() - INTERVAL 1 MONTH,'%Y-%m-01')AND LAST_DAY(now() - INTERVAL 1 MONTH)` :
                    `and CheckRegister.InvoiceDate BETWEEN DATE_FORMAT(Now() - INTERVAL 1 MONTH,'%Y-%m-01')AND LAST_DAY(now() - INTERVAL 1 MONTH)`
                }
            `);
            if(res[0].length > 0 && res[0][0].Total)
                response.LastMonthIncome = res[0][0].Total === '' ? 0 : res[0][0].Total;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getActionItems(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT ActionItemDate, ActionItem, PMComment, ActionItemsID
                FROM ActionItems WHERE PropertyID=${pID} AND ActionItemStatus=1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getWK(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT Units.UnitName, WorkOrders.WorkOrderID, WorkOrders.WorkOrderSubmitDate, WorkOrders.WorkOrderDescription, WorkOrders.WorkOrderComment, WorkOrders.WorkOrderCompleteDate, Status.Status
                FROM Units, WorkOrders, Status 
                Where Units.UnitID=WorkOrders.UnitID 
                AND WorkOrders.PropertyID=${pID}
                AND Status.StatusID=WorkOrders.WorkOrderComplete 
                AND WorkOrders.WorkOrderComplete<>3
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getMissingEmailPhone(pID) {
        let response = {
            MissingEmail: 0,
            MissingPhone: 0,
            MissingBoth: 0
        };
        try {
            const res = await db.execute(`
                Select
                    SUM(CASE WHEN TenantEmail = 0 THEN 1 ELSE 0 END) as MissingEmail,
                    SUM(CASE WHEN TenantPhone = 0 THEN 1 ELSE 0 END) as MissingPhone,
                    SUM(CASE WHEN TenantPhone=0 AND TenantEmail=0 THEN 1 ELSE 0 END) as MissingBoth
                From Tenants
                Where Prospect=2 AND PropertyID = ${pID}
            `);
            response.MissingEmail = res[0][0].MissingEmail;
            response.MissingPhone = res[0][0].MissingPhone;
            response.MissingBoth = res[0][0].MissingBoth;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getConcessions(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT Tenants.TenantID, Tenants.TenantFName, Tenants.TenantLName, Tenants.UnitID, 
                       TenantTransactions.TransactionAmount, TenantTransactions.Comment, Units.UnitName,
                       TenantTransactions.TenantTransactionDate, TenantTransactions.TenantTransactionID
                FROM TenantTransactions, Tenants, Units 
                Where TransactionTypeID=3 
                AND Tenants.TenantID=TenantTransactions.TenantID 
                AND Tenants.UnitID = Units.UnitID
                AND Tenants.PropertyID=${pID}
                ORDER BY TenantLName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getAudit(pID) {
        let response = {
            total: 0,
            data: []
        };
        try {
            let res = await db.execute(`
                SELECT t.TenantID, t.TenantFName, t.TenantLName, t.LeaseStartDate, u.UnitName
                FROM Tenants t
                INNER JOIN units u on t.UnitID = u.UnitID
                Where t.PropertyID=${pID} AND t.Prospect=2
                and TenantID not in (
                SELECT Tenants.TenantID FROM Tenants, Documents
                Where Documents.TenantID=Tenants.TenantID AND Tenants.PropertyID=11 AND Prospect=2 AND DOCUMENTTYPEID=1
                )
            `);
            response.data = res[0];

            res = await db.execute(`
                SELECT 1 
                FROM Tenants, Documents 
                Where Documents.TenantID=Tenants.TenantID 
                AND Tenants.PropertyID=${pID}
                AND Prospect=2 AND DOCUMENTTYPEID=1 AND Documents.Audited=0
            `);
            response.total = res[0].length;

        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getSecurityDeposit(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT t.TenantID, t.TenantFName, t.TenantLName, sdr.RefundAmount, sdr.SecurityDepositRefundID,
                wl.FAddress, wl.FCity, wl.FState, wl.FZip
                FROM SecurityDepositRefund sdr
                JOIN Tenants t ON sdr.TenantID = t.TenantID
                LEFT JOIN WhiteList wl ON wl.tenantID = t.TenantID
                Where sdr.PropertyID=${pID}
                AND sdr.Paid=0
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getMissedPromisesPay(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT Tenants.TenantID, Tenants.TenantFName, Tenants.TenantLName, Units.UnitName, PromissToPay.SubmitDate, PromissToPay.PromissDate, PromissToPay.Promiss,
                    Users.UserFName, Users.UserLName, PromissToPay.StaffComment, YesNo.YesNo, PromissToPay.PromissToPayID
                FROM PromissToPay, Users, YesNo, Tenants, Units 
                Where Tenants.TenantID=PromissToPay.TenantID 
                AND Tenants.PropertyID=${pID}
                AND PromissToPay.SubmittedBy=Users.UserID 
                And YesNo.YesNoID=PromissToPay.Success 
                And PromissToPay.Success=2 
                AND PromissToPay.PromissDate < Now() AND Tenants.UnitID=Units.UnitID
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getDelinquenciesOver(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT t.TenantID, t.TenantFName, t.TenantLName, t.prospectcomments, t.EvictionFiled, t.EvictionFiledDate, t.DelinquencyComments,
                            u.UnitName,
                            TotalDebit, HousingDebit, TotalCredit, HousingCredit
                FROM Tenants t
                JOIN Units u ON t.UnitID = u.UnitID
                LEFT JOIN (
                Select
                    TenantID,
                    SUM(CASE WHEN TransactionTypeID = 1 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalDebit,
                    SUM(CASE WHEN TransactionTypeID = 1 AND ChargeTypeID = 6 THEN TransactionAmount ELSE 0 END) AS HousingDebit,
                    SUM(CASE WHEN TransactionTypeID = 2 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalCredit,
                    SUM(CASE WHEN TransactionTypeID = 2 AND ChargeTypeID = 6 THEN TransactionAmount ELSE 0 END) AS HousingCredit
                From TenantTransactions
                Group By TenantID
                ) sums ON sums.TenantID = t.TenantID
                Where t.Prospect = 2
                AND t.PropertyID = ${pID}
                ORDER
                BY CONCAT(Left(Replace(UnitName,'-',''),2),REPEAT('0', (10-CHAR_LENGTH(UnitName))),Right(Replace(UnitName,'-',''),CHAR_LENGTH(Replace(UnitName,'-',''))-2))
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}