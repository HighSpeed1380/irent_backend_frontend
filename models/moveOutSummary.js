const db = require('../util/database');

module.exports = class MoveOutSummary {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO MoveOutSummary
                (TenantID, MoveOutReasonID)
                VALUES (${data.tenantID}, ${data.moveOutReasonID});
            `);
        } catch(err) {
            console.log(err);
        }
    }

}