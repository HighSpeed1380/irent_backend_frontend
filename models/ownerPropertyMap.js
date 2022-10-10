const db = require('../util/database');

module.exports = class OwnerPropertyMap {

    async add(data) {
        try {
            await db.execute(`
            INSERT INTO OwnerPropertyMap (PropertyID, OwnerID)
                VALUES (${data.propertyID}, ${data.ownerID});
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
        try {
            const res = await db.execute(`
                Select * From OwnerPropertyMap 
                Where PropertyID = ${data.propertyID} 
                and OwnerID = ${data.ownerID}
            `);
            if(res[0].length === 0) {
                await db.execute(`
                    INSERT INTO OwnerPropertyMap (PropertyID, OwnerID)
                    VALUES (${data.propertyID}, ${data.ownerID});
                `);
            }
        } catch(err) {
            console.log(err);
        }
    }

    async updDelete(data) {
        try {
            await db.execute(`
                DELETE FROM OwnerPropertyMap 
                Where ownerID = ${data.ownerID} 
                AND PropertyID not in (${data.propIDs})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}