const db = require('../util/database');

module.exports = class SignedForms {

    async getByFormTenant(data) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From signedforms
                Where FormsCreatorID = ${data.formID}
                AND TenantID = ${data.tenantID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}