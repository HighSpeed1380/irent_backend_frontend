const db = require('../util/database');

module.exports = class UserPropertyMap {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO UserPropertyMap (PropertyID, UserID)
                VALUES (${data.propertyID}, ${data.userID});
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
        try {
            const res = await db.execute(`
                Select * From UserPropertyMap 
                Where PropertyID = ${data.propertyID} 
                and UserID = ${data.userID}
            `);
            if(res[0].length === 0) {
                await db.execute(`
                    INSERT INTO UserPropertyMap (PropertyID, UserID)
                    VALUES (${data.propertyID}, ${data.userID});
                `);
            }
        } catch(err) {
            console.log(err);
        }
    }

    async updDelete(data) {
        try {
            await db.execute(`
                DELETE FROM UserPropertyMap 
                Where userID = ${data.userID} 
                AND PropertyID not in (${data.propIDs})
            `);
        } catch(err) {
            console.log(err);
        }
    }

}