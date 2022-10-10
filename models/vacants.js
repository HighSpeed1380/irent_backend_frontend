const db = require('../util/database');

module.exports = class Vacants {

    async getOodle(units) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT ut.*, 
                p.PropertyName, p.PropertyAddress1, p.PropertyCity, p.PropertyState, p.PropertyZip, p.PropertyID
                From UnitTypes ut 
                JOIN Properties p ON ut.propertyID = p.PropertyID
                JOIN Unit u ON u.UnitTypeID = ut.UnitTypeID
                Where u.UnitID in (${units.join(",")})
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}