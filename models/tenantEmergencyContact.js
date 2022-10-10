const db = require('../util/database');

module.exports = class TenantEmergencyContact {

    async getByTenant(tID) {
        let response = []
        try {
            const res = await db.execute(`
                Select * From tenantemergencycontact Where tenantID = ${tID}
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
                INSERT INTO tenantemergencycontact 
                (tenantID, firstName, lastName, phone, email, relationship)
                VALUES (${data.tenantID}, '${data.firstName}', '${data.lastName}',
                '${data.phone}', '${data.email}', '${data.relationship}')
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
        try {
            await db.execute(`
                UPDATE tenantemergencycontact 
                set firstName = '${data.firstName}',
                    lastName = '${data.lastName}',
                    phone = '${data.phone}',
                    email = '${data.email}',
                    relationship = '${data.relationship}'
                WHERE tenantEmergencyContactID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM tenantemergencycontact 
                WHERE tenantEmergencyContactID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}