const db = require('../util/database');

const today = new Date();
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

module.exports = class FutureLeaseChange {

    async getByTenantID(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM FutureLeaseChange WHERE TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updByTenantID(data) {
        try {
            await db.execute(`
                UPDATE FutureLeaseChange
                SET LeaseChangeDate = '${formattedDate(data.leaseChangeDate)}',
                    FutureHousingAmount = ${data.housingAmount},
                    FutureRentalAmount = ${data.rentalAmount},
                    FutureUtilityCharge = ${data.utilityCharge}
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async insertByTenantID(data) {
        try {
            await db.execute(`
                INSERT INTO FutureLeaseChange (LeaseChangeDate, FutureHousingAmount, FutureRentalAmount, 
                    FutureUtilityCharge, TenantID)
                VALUES ('${formattedDate(data.leaseChangeDate)}', ${data.housingAmount}, ${data.rentalAmount},
                    ${data.utilityCharge}, ${data.tenantID})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}