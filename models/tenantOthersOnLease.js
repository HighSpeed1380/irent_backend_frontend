const db = require('../util/database');
const moment = require('moment');

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

module.exports = class TenantOthersOnLease {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM TenantsOthersOnLease WHERE TenantsOthersOnLeaseID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO TenantsOthersOnLease 
                (TenantID, FirstName, LastName, Phone, eMail, SSN, DOB, CellPhoneProviderID, SubmittedBy, 
                 SubmitDate, Active, ModifiedBy, ModifiedDate, DriversLicense, DLState)
                VALUES (${data.tenantID}, '${data.firstName}', '${data.lastName}', '${data.phone}', '${data.email}', 
                 '${data.ssn}', '${moment.utc(data.dob).format("YYYY-MM-DD")}', '999', ${data.userID}, '${formattedDate(new Date())}', 
                 1, ${data.userID}, '${formattedDate(new Date())}', '${data.driverslicense}', '${data.dlState}');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM TenantsOthersOnLease
                WHERE TenantsOthersOnLeaseID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    } 

    async update(data) {
        try {
            await db.execute(`
                UPDATE TenantsOthersOnLease
                SET FirstName = '${data.firstName}',
                    LastName = '${data.lastName}',
                    Phone = '${data.phone}',
                    eMail = '${data.email}',
                    SSN = '${data.ssn}',
                    DOB = '${moment.utc(data.dob).format("YYYY-MM-DD")}',        
                    ModifiedBy = ${data.userID},
                    ModifiedDate = '${formattedDate(new Date())}',
                    DriversLicense = '${data.driverslicense}',
                    DLState = '${data.dlState}'
                WHERE TenantsOthersOnLeaseID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getListByTenantID(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM TenantsOthersOnLease 
                WHERE TenantID = ${tID} AND Active = 1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByTenantID(tID) {
        let response = {
            names: "",
            total: 0
        };
        try {
            const res = await db.execute(`
                SELECT * From TenantsOthersOnLease Where TenantID = ${tID} and active = 1
            `);
            for(const t of res[0]) {
                response.names += t.FirstName + " " + t.LastName + ", ";
            }
            if(response.names.length > 0)
                response.names = response.names.substring(0, response.length-1);
            response.total = res[0].length;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}