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

module.exports = class Tenants {

    async get(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Tenants Where TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByUnit(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Tenants Where UnitID = ${uID}
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
            const res = await db.execute(`
                INSERT INTO Tenants (TenantFName, TenantMName, TenantLName, TenantPhone, TenantEmail, SSN, 
                    ProspectStartDate, UnitTypeID, Prospect, UserID, PropertyID, LeaseStartDate, LeaseEndDate, 
                    MoveInDate, MoveOutDate, UnitID, RentalAmount, HousingAmount, SecurityDeposit, PetRent, TVCharge, 
                    UtilityCharge, StorageCharge, ParkingCharge, HOAFee, ConcessionAmount)
                VALUES('${data.firstName}', '${data.middleName}', '${data.lastName}', '${data.phone}', '${data.email}', 
                '${data.ssn}', '${formattedDate(data.leaseStart)}', ${data.unitTypeID}, 2, ${data.userID}, ${data.propertyID}, 
                '${formattedDate(data.leaseStart)}', '${formattedDate(data.leaseEnd)}', '${formattedDate(data.moveIn)}', 
                '${formattedDate(data.moveOut)}', ${data.unitID}, ${data.rentalAmount}, ${data.housingAmount}, ${data.secDeposit}, 
                ${data.petRent}, ${data.TVCharge}, ${data.utilityCharge}, ${data.storageCharge}, ${data.parkingCharge}, 
                ${data.HOAFee}, 0.00)
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getListTenants(data) {
        let response = [];
        try {
            let res;
            if(data.multiprop && data.showAllPropertiesTenants) {
                res = await db.execute(`
                    SELECT UnitName, Units.UnitID, Tenants.PropertyID, Tenants.TenantID, TenantFName, TenantLName, LeaseEndDate, TenantEmail, TenantPhone, CellPhoneProviderID, RentalAmount, PetRent, HousingAMount, TVCharge, UtilityCharge, EvictionFiled, EvictionFiledDate, MTM, ParkingCharge, b.BusinessName,
                    (CASE WHEN LeaseEndDate < Now() OR MoveOutDate <= Now() THEN 1 ELSE 0 END) AS OutOfDate
                    FROM Tenants
                    INNER JOIN Units ON Tenants.UnitID=Units.UnitID
                    JOIN UserPropertyMap ON UserPropertyMap.PropertyID = Tenants.PropertyID
                    LEFT JOIN Background b ON b.TenantID = Tenants.TenantID
                    WHERE UserPropertyMap.UserID = ${data.userID}
                    AND Prospect='2'
                    ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(UnitName))),Left(Replace(UnitName,'-',''),2),Right(Replace(UnitName,'-',''),CHAR_LENGTH(Replace(UnitName,'-',''))-2))
                `);
            } else {
                res = await db.execute(`
                    SELECT UnitName, Units.UnitID, Tenants.PropertyID, Tenants.TenantID, TenantFName, TenantLName, LeaseEndDate, TenantEmail, TenantPhone, CellPhoneProviderID, RentalAmount, PetRent, HousingAMount, TVCharge, UtilityCharge, EvictionFiled, EvictionFiledDate, MTM, ParkingCharge, b.BusinessName,
                    (CASE WHEN LeaseEndDate < Now() OR MoveOutDate <= Now() THEN 1 ELSE 0 END) AS OutOfDate
                    FROM Tenants
                    INNER JOIN Units ON Tenants.UnitID=Units.UnitID
                    LEFT JOIN Background b ON b.TenantID = Tenants.TenantID
                    WHERE Units.PropertyID = ${data.propertyID}
                    AND Prospect = '2'
                    ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(UnitName))),Left(Replace(UnitName,'-',''),2),Right(Replace(UnitName,'-',''),CHAR_LENGTH(Replace(UnitName,'-',''))-2))
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async moveOut(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET MoveOutDate = '${formattedDate(data.moveOutDate)}',
                Prospect = '3',
                Collections = 0,
                WhiteList = ${data.whiteList}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updEviction(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET EvictionFiled = ${data.eviction},
                EvictionFiledDate = '${formattedDate(new Date())}'
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updateTransfer(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET UnitID = ${data.unitID},
                    UnitTypeID = ${data.unitTypeID},
                    TenantFName = '${data.firstName}',
                    TenantLName = '${data.lastName}',
                    OnLease = '${data.onLease}',
                    TenantPhone = '${data.phone}',
                    TenantEmail = '${data.email}',
                    RentalAmount = ${data.rentalAmount},
                    HousingAMount = ${data.housingAmount},
                    PetRent = ${data.petRent},
                    TVCharge = ${data.tvCharge},
                    UtilityCharge = ${data.utilityCharge},
                    ParkingCharge = ${data.parkingCharge},
                    StorageCharge = ${data.storageCharge},
                    SecurityDeposit = ${data.securityDeposit},
                    ProspectComments = '${data.comment}',
                    SSN = '${data.ssn}',
                    LeaseUpload = 1,
                    LeaseStartDate = '${formattedDate(data.leaseStartDate)}',
                    MoveInDate = '${formattedDate(data.moveInDate)}',
                    LeaseEndDate = '${formattedDate(data.leaseEndDate)}',
                    MoveOutDate = '${formattedDate(data.moveOutDate)}',
                    CellPhoneProviderID = 999,
                    PropertyID = ${data.propertyID}
                WHERE tenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updDetails(data) {
        if(data.middleName === undefined)       data.middleName = '';
        if(data.leadSourceID === undefined)     data.leadSourceID = 0;
        try {
            await db.execute(`
                UPDATE Tenants
                SET TenantFName = '${data.fistName}',
                    TenantMName = '${data.middleName}',
                    TenantLName = '${data.lastName}',
                    SSN = '${data.ssn}',
                    TenantEmail = '${data.email}',
                    TenantPhone = '${data.phone}',
                    OnLease = '${data.othersLease}',
                    ProspectComments = '${data.comment}',
                    LeadSourceID = ${data.leadSourceID}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updrecurringCharges(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET RentalAmount = ${data.rentalAmount},
                    HousingAmount = ${data.housingAmount},
                    PetRent = ${data.petRent},
                    TVCharge = ${data.tvCharge},
                    UtilityCharge = ${data.utilityCharge},
                    ParkingCharge = ${data.parkingCharge},
                    StorageCharge = ${data.storageCharge},
                    HOAFee = ${data.hoaFee},
                    GarageAmount = ${data.garageAmount},
                    CAM = ${data.cam},
                    MonthToMonth = ${data.monthToMonth},
                    AdditionalTenantsCharge = ${data.additionalTenantsCharge},
                    RVCharge = ${data.RVCharge},
                    TrashCharge = ${data.trashCharge},
                    SewerCharge = ${data.sewerCharge},
                    TaxesFee = ${data.taxesFee},
                    InsuranceFee = ${data.insuranceFee}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updRecurringConcession(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET ConcessionAmount = ${data.amount},
                    ConcessionReason = '${data.reason}'
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updLeaseDates(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET LeaseStartDate = '${formattedDate(data.leaseStartDate)}',
                    MoveInDate = '${formattedDate(data.moveInDate)}',
                    LeaseEndDate = '${formattedDate(data.leaseEndDate)}',
                    MoveOutDate = '${formattedDate(data.moveOutDate)}',
                    NoticeGiven = ${data.notice},
                    MTM = ${data.mtm}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updRentersInsurance(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET RentersInsuranceExpiration = '${formattedDate(data.rentersInsuranceExpiration)}',
                    ProofInsurance = 1
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async setNoRentersInsurance(tID) {
        try {
            await db.execute(`
                Update Tenants 
                set ProofInsurance = 0
                Where TenantID = ${tID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT t.TenantID, t.TenantFName, t.TenantLName, u.UnitName
                From Tenants t
                JOIN Units u ON t.UnitID = u.UnitID
                WHERE t.Prospect = 2 AND t.PropertyID = ${pID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPreviousTenants(data) {
        let response = [];
        try {
            let res;
            if(data.showAllPropertiesTenants) {
                res = await db.execute(`
                    Select u.UnitName, u.UnitID, t.TenantID, t.TenantFName, t.TenantLName, t.LeaseEndDate, t.LeaseStartDate,
                        t.MoveInDate, t.MoveOutDate, t.TenantEmail, t.TenantPhone, mor.MoveOutReason, c.DateSent
                    FROM Tenants t
                    INNER JOIN Units u ON t.UnitID = u.UnitID
                    LEFT JOIN MoveOutSummary mos ON mos.TenantID = t.TenantID
                    LEFT JOIN MoveOutReason mor ON mor.MoveOutReasonID = mos.MoveOutReasonID
                    LEFT JOIN Collections c ON c.TenantID = t.TenantI
                    JOIN UserPropertyMap upm ON upm.PropertyID = t.PropertyID
                    WHERE upm.UserID = ${data.userID}
                    AND Prospect = '3'
                    ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(u.UnitName))),Left(Replace(u.UnitName,'-',''),2),Right(Replace(u.UnitName,'-',''),CHAR_LENGTH(Replace(u.UnitName,'-',''))-2))
                `);
            } else {
                res = await db.execute(`
                    Select u.UnitName, u.UnitID, t.TenantID, t.TenantFName, t.TenantLName, t.LeaseEndDate, t.LeaseStartDate,
                        t.MoveInDate, t.MoveOutDate, t.TenantEmail, t.TenantPhone, mor.MoveOutReason, c.DateSent
                    FROM Tenants t
                    INNER JOIN Units u ON t.UnitID = u.UnitID
                    LEFT JOIN MoveOutSummary mos ON mos.TenantID = t.TenantID
                    LEFT JOIN MoveOutReason mor ON mor.MoveOutReasonID = mos.MoveOutReasonID
                    LEFT JOIN Collections c ON c.TenantID = t.TenantID
                    WHERE u.PropertyID = ${data.propertyID}
                    AND Prospect = '3'
                    ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(u.UnitName))),Left(Replace(u.UnitName,'-',''),2),Right(Replace(u.UnitName,'-',''),CHAR_LENGTH(Replace(u.UnitName,'-',''))-2))
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getReconcilePreviousTenants(data) {
        let response = [];
        try {
            let res;
            if(data.multiprop || data.showAllPropertiesTenants) {
                res = await db.execute(`
                    Select t.TenantID, t.TenantFName, t.TenantLName, t.LeaseStartDate, t.LeaseEndDate, t.MoveInDate,
                        t.MoveOutDate, t.TenantPhone, t.TenantEmail, u.UnitName, TotalDebits, TotalCredits
                    From Tenants t
                    LEFT JOIN Units u ON t.UnitID = u.UnitID
                    JOIN Background b ON b.TenantID = t.TenantID
                    JOIN UserPropertyMap upm ON upm.PropertyID = t.PropertyID
                    LEFT JOIN (
                        select TenantID,
                        SUM(CASE WHEN TransactionTypeID = 1 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalDebits,
                        SUM(CASE WHEN TransactionTypeID = 2 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalCredits
                        From TenantTransactions
                        Group By TenantID
                    ) sums ON sums.TenantID = t.TenantID
                    Where t.Prospect = 3
                    and upm.UserID = ${data.userID}
                    and t.Collections != 1            
                `);
            } else {
                res = await db.execute(`
                    Select t.TenantID, t.TenantFName, t.TenantLName, t.LeaseStartDate, t.LeaseEndDate, t.MoveInDate,
                        t.MoveOutDate, t.TenantPhone, t.TenantEmail, u.UnitName, TotalDebits, TotalCredits
                    From Tenants t
                    LEFT JOIN Units u ON t.UnitID = u.UnitID
                    JOIN Background b ON b.TenantID = t.TenantID
                    LEFT JOIN (
                        select TenantID,
                        SUM(CASE WHEN TransactionTypeID = 1 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalDebits,
                        SUM(CASE WHEN TransactionTypeID = 2 AND ChargeTypeID != 6 THEN TransactionAmount ELSE 0 END) AS TotalCredits
                        From TenantTransactions
                        Group By TenantID
                    ) sums ON sums.TenantID = t.TenantID
                    Where t.Prospect = 3
                    and t.PropertyID = ${data.propertyID} 
                    and t.Collections != 1
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updCollections(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET Collections = ${data.collections}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getAllTenantsStatement(data) {
        let response = [];
        try {
            let res;
            if(data.multiprop) {
                res = await db.execute(`
                    Select t.TenantID, t.TenantFName, t.TenantLName, t.RentalAmount, t.HousingAmount, t.PetRent, t.UtilityCharge,
                        t.LeaseStartDate, t.LeaseEndDate, u.UnitName,
                        p.PropertyAddress1, p.PropertyCity, p.PropertyState, p.PropertyZip,
                        TotalDebit, HousingDebit, TotalCredit 
                    From tenants t
                    INNER JOIN Units u ON t.UnitID = u.UnitID
                    INNER JOIN Properties p ON t.PropertyID = p.PropertyID
                    INNER JOIN UserPropertyMap upm ON upm.PropertyID = t.PropertyID
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
                    Where upm.UserID = ${data.userID}
                    AND t.prospect = 2
                    Order By UnitName           
                `);
            } else {
                res = await db.execute(`
                    Select t.TenantID, t.TenantFName, t.TenantLName, t.RentalAmount, t.HousingAmount, t.PetRent, t.UtilityCharge,
                        t.LeaseStartDate, t.LeaseEndDate, u.UnitName,
                        p.PropertyAddress1, p.PropertyCity, p.PropertyState, p.PropertyZip,
                        TotalDebit, HousingDebit, TotalCredit 
                    From tenants t
                    INNER JOIN Units u ON t.UnitID = u.UnitID
                    INNER JOIN Properties p ON t.PropertyID = p.PropertyID
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
                    Where t.PropertyID = ${data.propertyID}
                    AND t.prospect = 2
                    Order By UnitName  
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getMoveOutStatementData(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select t.TenantID, t.TenantFName, t.TenantLName, u.UnitName, mor.MoveOutReason,
                    t.RentalAmount, t.HousingAmount, t.PetRent, t.UtilityCharge,
                    t.LeaseStartDate, t.LeaseEndDate, t.MoveOutDate
                From Tenants t
                JOIN Units u ON t.UnitID = u.UnitID
                LEFT JOIN MoveOutSummary mos ON mos.TenantID = t.TenantID
                LEFT JOIN MoveOutReason mor ON mor.MoveOutReasonID = mos.MoveOutReasonID
                Where t.TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getDepositProspects(data) {
        let response = [];
        try {
            let res;
            if(data.applicantsDepositsPage) {
                res = await db.execute(`
                    SELECT Concat(TenantFName, ' ',TenantLName) AS Combo, Tenants.TenantID AS TenantID  FROM Tenants 
                    JOIN UnitTypes on Tenants.UnitTypeID = UnitTypes.UnitTypeID
                    JOIN Preleased ON Tenants.TenantID = Preleased.TenantID
                    WHERE Tenants.PropertyID = ${data.propertyID} AND Tenants.Prospect in (1,5) 
                `);
            } else {
                res = await db.execute(`
                    SELECT Concat(TenantFName, ' ',TenantLName) AS Combo, Tenants.TenantID AS TenantID  FROM Tenants 
                    JOIN UnitTypes on Tenants.UnitTypeID = UnitTypes.UnitTypeID
                    WHERE Tenants.PropertyID = ${data.propertyID} AND Tenants.Prospect in (1,5) 
                `);
            }
            
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getDepositFormerTenants(data) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT TenantID, UnitName, Concat(UnitName, ' ', TenantFName, ' ',TenantLName) AS Combo 
                FROM Units, Tenants 
                WHERE Units.PropertyID = ${data.propertyID}
                AND Tenants.UnitID=Units.UnitID AND Prospect=3 
                ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(UnitName))),Left(Replace(UnitName,'-',''),2),Right(Replace(UnitName,'-',''),CHAR_LENGTH(Replace(UnitName,'-',''))-2))
            `);
            
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updMoveOutDate(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                set MoveOutDate = '${formattedDate(data.moveOutDate)}'
                where TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getPreLeaseProspect(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT distinct t.TenantID, t.TenantFName, t.TenantLName
                FROM Tenants t 
                JOIN UnitTypes ut ON t.UnitTypeID = ut.UnitTypeID
                JOIN Background b ON t.TenantID = b.TenantID
                WHERE t.Prospect = 1 AND b.ApproveID != 4
                AND t.PropertyID = ${pID}
                ORDER BY t.TenantFName, t.TenantLName
            
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updateDelinquencyComment(data) {
        try {
            await db.execute(`
                Update Tenants
                set DelinquencyComments = '${data.delinquencyComments}'
                Where TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getProspectsByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select t.ProspectStartDate, t.TenantFName, t.TenantMName, t.TenantLName, t.TenantPhone, t.TenantEmail, t.ProspectComments,
                    ut.UnitType, u.UserFName, u.UserLName, ls.LeadSource, t.TenantID
                From Tenants t
                JOIN UnitTypes ut ON t.UnitTypeID = ut.UnitTypeID
                LEFT JOIN Users u ON t.UserID = u.UserID
                LEFT JOIN LeadSource ls ON t.LeadSourceID = ls.LeadSourceID
                Where t.Prospect = 5 AND t.PropertyID = ${pID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err)
        }
        return response;
    }

    async deniedTenant(tID) {
        try {
            await db.execute(`
                UPDATE Tenants SET Prospect = 4 WHERE TenantID = ${tID}
            `)
        } catch(err) {
            console.log(err);
        }
    }

    async updateProspectType(data) {
        try {
            await db.execute(`
                Update Tenants
                set Prospect = ${data.prospect}
                Where TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updProspectApplicant(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET SSN = '${data.ssn}',
                    TenantEmail = '${data.email}',
                    TenantPhone = '${data.phone}',
                    UnitTypeID = ${data.unitTypeID}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getApplicantsByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select t.ProspectStartDate, t.TenantFName, t.TenantMName, t.TenantLName, t.TenantPhone, t.TenantEmail, t.ProspectComments,
                    ut.UnitType, u.UserFName, u.UserLName, t.TenantID, b.ApproveID, b.BackgroundID, a.Approve,
                    pl.PMoveInDate, un.UnitName
                From Tenants t
                JOIN UnitTypes ut ON t.UnitTypeID = ut.UnitTypeID
                JOIN Background b ON b.TenantID = t.TenantID
                LEFT JOIN Users u ON t.UserID = u.UserID
                LEFT JOIN Approve a ON b.ApproveID = a.ApproveID
                LEFT JOIN PreLeased pl ON pl.TenantID = t.TenantID
                LEFT JOIN Units un ON pl.UnitID = un.UnitID
                Where t.Prospect = 1 AND t.PropertyID = ${pID}
                AND (b.ApproveID != 4 OR b.ApproveID is null)
                ORDER By ProspectStartDate
            `);
            response = res[0];
        } catch(err) {
            console.log(err)
        }
        return response;
    }

    async activeApplicant(tID) {
        try {
            await db.execute(`
                UPDATE Tenants SET Prospect = 1 WHERE TenantID = ${tID}
            `)
        } catch(err) {
            console.log(err);
        }
    }

    async getByUnitNotProspect(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Tenants Where UnitID = ${uID} AND Prospect = 2
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updateConvertToTenant(data) {
        try {
            await db.execute(`
                UPDATE Tenants
                SET RentalAmount = ${data.rentalAmount},
                    Prospect = 2,
                    LeaseStartDate = '${moment.utc(data.leaseStartDate).format('YYYY-MM-DD')}',
                    LeaseEndDate = '${moment.utc(data.leaseEndDate).format('YYYY-MM-DD')}',
                    MoveInDate = '${moment.utc(data.moveInDate).format('YYYY-MM-DD')}',
                    MoveOutDate = '${moment.utc(data.moveOutDate).format('YYYY-MM-DD')}',
                    HousingAmount = ${data.housingAmount},
                    PetRent = ${data.petRent},
                    TVCharge = ${data.TVCharge},
                    UtilityCharge = ${data.utilityCharge},
                    StorageCharge = ${data.storageCharge},
                    ParkingCharge = ${data.parkingCharge},
                    SecurityDeposit = ${data.securityDeposit},
                    PropertyID = ${data.propertyID},
                    UnitID = ${data.unitID},
                    HOAFee = ${data.HOAFee}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getDeniedProspects(pID, fromDt) {
        let response = [];
        try {
            const res = await db.execute(`
                Select t.ProspectStartDate, t.TenantFName, t.TenantMName, t.TenantLName, t.TenantPhone, t.TenantEmail, t.ProspectComments,
                    ut.UnitType, u.UserFName, u.UserLName, ls.LeadSource, t.TenantID, b.ApproveID, b.BackgroundID, a.Approve,
                    pl.PMoveInDate, un.UnitName
                From Tenants t
                JOIN UnitTypes ut ON t.UnitTypeID = ut.UnitTypeID
                JOIN Background b ON b.TenantID = t.TenantID
                LEFT JOIN Users u ON t.UserID = u.UserID
                LEFT JOIN Approve a ON b.ApproveID = a.ApproveID
                LEFT JOIN LeadSource ls ON t.LeadSourceID = ls.LeadSourceID
                LEFT JOIN PreLeased pl ON pl.TenantID = t.TenantID
                LEFT JOIN Units un ON pl.UnitID = un.UnitID
                Where t.Prospect = 4 AND t.PropertyID = ${pID}
                AND t.ProspectStartDate >= '${moment.utc(fromDt).format("YYYY-MM-DD")}'
            `);
            response = res[0];
        } catch(err) {
            console.log(err)
        }
        return response;
    }

    async remove(tID) {
        try {
            await db.execute(`
                Delete From Tenants Where TenantID = ${tID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async addProspectApplicant(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO Tenants
                (TenantFName, TenantMName, TenantLName, TenantPhone, TenantEmail, SSN, ProspectComments, 
                 ProspectStartDate, UnitTypeID, Prospect, PropertyID, UserID, LeaseStartDate, LeaseEndDate, MoveInDate, MoveOutDate, 
                 UnitID, RentalAmount, HousingAmount, SecurityDeposit, PetRent, UtilityCharge, TVCharge, WhiteList, Collections, 
                 EvictionFiled, EvictionFiledDate, LeaseUpload, LeaseAudit, CellPhoneProviderID, LeadSourceID, OnLease, ParkingCharge, 
                 StorageCharge, ConcessionAmount, ConcessionReason, NoticeGiven
                )
                VALUES('${data.firstName}', '${data.middleName}', '${data.lastName}', '${data.phone}', '${data.email}', '${data.ssn}',
                '${data.comment}', '${moment.utc(data.startDate).format("YYYY-MM-DD")}', ${data.unitTypeID}, ${data.prospect},
                ${data.propertyID}, ${data.userID}, '${moment.utc().format("YYYY-MM-DD")}', '${moment.utc().format("YYYY-MM-DD")}',
                '${moment.utc().format("YYYY-MM-DD")}', '${moment.utc().format("YYYY-MM-DD")}', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                '${moment.utc().format("YYYY-MM-DD")}', 0, 0, 999, ${data.leadSourceID}, '${data.otherOnLease}', 0, 0, 0, '', 0)
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}