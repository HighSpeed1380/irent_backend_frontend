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

module.exports = class RecurringChargesTax {

    async getByPropertyID(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * from recurringchargestax Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async insertRecurringChargesTax(propertyID, data) {
        await db.execute(`
            INSERT INTO recurringchargestax (
                RentPercentage, 
                HousePercentage,
                PetPercentage, 
                TVPercentage, 
                UtilityPercentage, 
                ParkingPercentage, 
                StoragePercentage,
                SecurityPercentage,
                LateFee,
                NSFFee,
                PropertyID
            )
            VALUES ( 
                ${data.RentPercentage},
                ${data.HousePercentage},
                ${data.PetPercentage},
                ${data.TVPercentage},
                ${data.UtilityPercentage},
                ${data.ParkingPercentage},
                ${data.StoragePercentage},
                ${data.SecurityPercentage},
                ${data.LateFee},
                ${data.NSFFee},
                ${propertyID}
            )
        `);
    }

    async updateRecurringChargesTax(data) {
        await db.execute(`
            UPDATE recurringchargestax
            SET 
                RentPercentage = ${data.RentPercentage},
                HousePercentage = ${data.HousePercentage},
                PetPercentage = ${data.PetPercentage},
                TVPercentage = ${data.TVPercentage},
                UtilityPercentage = ${data.UtilityPercentage},
                ParkingPercentage = ${data.ParkingPercentage}
                StoragePercentage = ${data.StoragePercentage}
                SecurityPercentage = ${data.SecurityPercentage}
                LateFee = ${data.LateFee}
                NSFFee = ${data.NSFFee}
            WHERE 
                RecurringChargesTaxID = ${data.RecurringChargesTaxID}
        `);
    }

}