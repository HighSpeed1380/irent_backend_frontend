const db = require('../util/database');

module.exports = class TempSignForm {

    async get(id) {
        let response = {};
        try {
            const res = await db.execute(`
                select * From tempsignform
                where TempSignFormID = ${id}
            `);
            if(res[0].length > 0) {
                response = res[0][0];
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByTenant(data) {
        let response = {};
        try {
            const res = await db.execute(`
                select * From tempsignform
                where FormsCreatorID = ${data.formID}
                and tenantID = ${data.tenantID}
            `);
            if(res[0].length > 0) {
                response = res[0][0];
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTenantDetailsDocs(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select p.PropertyID, t.TenantID, tsf.FormName, tsf.Datetime, tsf.TempSignFormID
                From tempsignform tsf
                INNER JOIN Tenants t ON tsf.TenantID = t.TenantID
                INNER JOIN Properties p ON t.PropertyID = p.PropertyID
                WHERE tsf.TenantID = ${tID}
                AND tsf.IP is not null
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO tempsignform
                (FormsCreatorID, TenantID, Form, FormName)
                VALUES(${data.formsCreatorID}, ${data.tenantID}, '${data.form.replace(/'/g, "\\'")}', '${data.formName}')
            `);
            response = res[0].insertId;;
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}