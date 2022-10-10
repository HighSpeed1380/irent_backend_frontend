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

module.exports = class Units {

    async getByID(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Units Where UnitID = ${uID}
            `);
            response = res[0][0] || null;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select UnitID, UnitName From Units
                Where PropertyID = ${pID}  
                Order By UnitName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getUnitTenantByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select u.UnitID, u.UnitName, t.TenantFName, t.TenantLName 
                From Units u
                LEFT JOIN Tenants t ON t.UnitID = u.UNitID
                Where u.PropertyID = ${pID}  
                and t.Prospect = 2
                Order By u.UnitName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getVacantByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select UnitID, UnitName From Units
                Where PropertyID = ${pID}  
                AND Occupied = 0
                Order By UnitName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
    

    async moveOut(moveOutDate, uID) {
        try {
            await db.execute(`
                UPDATE Units
                SET VacantDate = '${moment.utc(moveOutDate).format("YYYY-MM-DD")}',
                Occupied='0'
                WHERE UnitID = ${uID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getByTenant(tID) {
        let response = {};
        try {
            const res = await db.execute(`
                Select u.UnitID, u.UnitName, ut.UnitType, u.VacantDate, u.Comment 
                From Units u
                JOIN UnitTypes ut ON u.UnitTypeID = ut.UnitTypeID
                JOIN Tenants t ON u.UNitID = t.UnitID
                Where t.TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async setOccupiedVacant(data) {
        try {
            if(data.vacantDate !== undefined) {
                await db.execute(`
                    UPDATE Units
                    SET VacantDate = '${formattedDate(data.vacantDate)}',
                    Occupied = ${parseInt(data.occupied)}
                    WHERE UnitID = ${data.unitID}
                `);
            } else {
                await db.execute(`
                    UPDATE Units
                    SET Occupied = ${parseInt(data.occupied)}
                    WHERE UnitID = ${data.unitID}
                `);
            }
        } catch(err) {
            console.log(err);
        }
    }

    async getCharges(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select ut.AdminFee, ut.UnitCharge From Units u
                JOIN UnitTypes ut ON u.UnitTypeID = ut.UnitTypeID
                WHERE u.UnitID = ${uID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getDepositTenantsUnits(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT TenantID, UnitName, Concat(UnitName, ' ', TenantFName, ' ',TenantLName) AS Combo 
                FROM Units, Tenants 
                WHERE Units.PropertyID=${pID} 
                AND Tenants.UnitID=Units.UnitID 
                AND Prospect=2 
                ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(UnitName))),Left(Replace(UnitName,'-',''),2),Right(Replace(UnitName,'-',''),CHAR_LENGTH(Replace(UnitName,'-',''))-2))
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getDepositFormerTenantsUnits(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT TenantID, UnitName, Concat(UnitName, ' ', TenantFName, ' ',TenantLName) AS Combo 
                FROM Units, Tenants 
                WHERE Units.PropertyID=${pID} 
                AND Tenants.UnitID=Units.UnitID AND Prospect=3 
                ORDER BY CONCAT(REPEAT('0', (10-CHAR_LENGTH(UnitName))),Left(Replace(UnitName,'-',''),2),Right(Replace(UnitName,'-',''),CHAR_LENGTH(Replace(UnitName,'-',''))-2))
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updVacantDate(data) {
        try {
            await db.execute(`
                UPDATE Units
                SET VacantDate = '${formattedDate(data.vacantDate)}'
                WHERE UnitID = ${data.unitID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updComment(data) {
        try {
            await db.execute(`
                UPDATE Units
                SET Comment = '${data.comment.replace(/'/g, "\\'")}'
                WHERE UnitID = ${data.unitID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getUnitUnitTypeDetails(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Units, UnitTypes 
                WHERE Units.UnitTypeID = UnitTypes.UnitTypeID 
                AND Units.UnitID = ${uID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}