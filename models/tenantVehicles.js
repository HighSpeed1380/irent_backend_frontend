const db = require('../util/database');

module.exports = class TenantVehicles {

    async getByTenant(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * From Tenantvehicles
                Where TenantID = ${tID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO Tenantvehicles (Make, Model, Year, Color, LicensePlate, ParkingSpace, TenantID)
                VALUES('${data.make}', '${data.model}', '${data.year}', '${data.color}', 
                 '${data.licensePlate}', '${data.parkingSpace}', ${data.tenantID})
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async edit(data) {
        try {
            await db.execute(`
                UPDATE Tenantvehicles
                    set Make = '${data.make}', 
                        Model = '${data.model}', 
                        Year = '${data.year}', 
                        Color = '${data.color}', 
                        LicensePlate = '${data.licensePlate}', 
                        ParkingSpace = '${data.parkingSpace}'
                WHERE TenantVehicleID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }  
    
    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM Tenantvehicles
                WHERE TenantVehicleID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }  
}