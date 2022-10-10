const db = require('../util/database');

module.exports = class Tazworks {

    async getByTenantID(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From tazWorks 
                Where TenantID = ${tID} AND OthersOnLeaseID = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByOthersOnLease(data) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From tazWorks 
                Where TenantID = ${data.tenantID}
                AND OthersOnLeaseID = ${data.othersOnLeaseID}
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getOthersOnLease(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select tz.TazWorksID, tol.FirstName, tol.LastName From tazWorks tz
                JOIN tenantsothersonlease tol ON tz.TenantID = tol.TenantID
                Where tz.TenantID = ${tID} AND tz.OthersOnLeaseID != 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
            
        try {
            await db.execute(`
                INSERT INTO Tazworks (TenantID, OrderID, Status, OthersOnLeaseID)
                VALUES (${data.tenantID}, ${data.OrderID}, '${data.Status}', ${data.OthersOnLeaseID})
            `);
        } catch(err) {
            console.log(err);
        }
        return 0;
    }
}