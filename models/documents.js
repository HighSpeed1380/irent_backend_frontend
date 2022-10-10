const db = require('../util/database');

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

module.exports = class Documents {

    async getByTenantID(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT d.DocumentName, dt.DocumentType, t.PropertyID
                FROM Documents d
                JOIN DocumentTypes dt ON d.DocumentTypeID = dt.DocumentTypeID
                JOIn Tenants t ON d.TenantID = t.TenantID
                Where t.TenantID = ${tID}
                AND dt.DocumentTypeId != 16
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getEditTenantDocs(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT d.DocumentID, d.DocumentName, d.Audited, d.Comment, dt.DocumentType, t.PropertyID
                FROM Documents d
                JOIN DocumentTypes dt ON d.DocumentTypeID = dt.DocumentTypeID
                JOIn Tenants t ON d.TenantID = t.TenantID
                Where t.TenantID = ${tID}
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
                INSERT INTO Documents
                (DocumentTypeID, TenantID, UploadDate, Audited, AuditorID, AuditedDate, Comment, DocumentName)
                VALUES (${data.documentTypeID}, ${data.tenantID}, '${formattedDate(new Date())}', 0, 0, 
                    '${formattedDate(new Date())}', 0, '${data.docName}');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM Documents WHERE DocumentID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async tenantHasRentersInsurance(tID) {
        let response = false;
        try {
            const res = await db.execute(`
                Select 1 From Documents
                Where TenantID = ${tID}
                AND DocumentTypeID = 13
            `);
            if(res[0].length > 0)
                response = true;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getLeaseViolationImage(leaseViolationID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Documents
                Where DocumentTypeID = 16 AND LeaseViolationID = ${leaseViolationID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}