const db = require('../util/database');

const RHAWAFORMSID = 993;

module.exports = class FormsPrintable {

    async getForm(data) {
        let response = "";
        try {
            let res;
            // get by ID or name
            if(parseInt(data.formsCreatorID) !== 0) {
                res = await db.execute(`
                    SELECT Form FROM Forms_Printable 
                    WHERE FormCreatorID = ${data.formsCreatorID} AND PropertyID = ${data.propertyID}
                `);
                if(res[0].length === 0) {
                    // get default
                    res = await db.execute(`
                        SELECT Form FROM Forms_Printable 
                        WHERE FormCreatorID = ${data.formsCreatorID} AND PropertyID in (0, ${RHAWAFORMSID})
                    `);
                }
            } else {
                res = await db.execute(`
                    SELECT Form FROM Forms_Printable 
                    WHERE Form_Name = '${data.formName}' AND PropertyID = ${data.propertyID}
                `);
                if(res[0].length === 0) {
                    // get default
                    res = await db.execute(`
                        SELECT Form FROM Forms_Printable 
                        WHERE Form_Name = '${data.formName}' AND PropertyID in (0, ${RHAWAFORMSID})
                    `);
                }
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}