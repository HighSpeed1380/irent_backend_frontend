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

module.exports = class RecurringWorkOrders {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * from recurringworkorders 
                Where id = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * from recurringworkorders 
                Where propertyID = ${pID}
                and active = 1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            const eDate = data.endDate === null ? null : `'${formattedDate(data.endDate)}'`
            await db.execute(`
                INSERT INTO recurringworkorders 
                (propertyID, priorityID, maintenanceID, vendorID, description, startDate, endDate,
                 unlimited, frequencyID, active, userID)
                VALUES (${data.propertyID}, ${data.priorityID}, ${data.maintenanceID}, ${data.vendorID},
                '${data.description}', '${formattedDate(data.startDate)}', ${eDate}, ${data.unlimited},
                ${data.frequencyID}, 1, ${data.userID})
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
        try {
            const eDate = data.endDate === null ? null : `'${formattedDate(data.endDate)}'`
            await db.execute(`
                Update recurringworkorders
                set priorityID = ${data.priorityID},
                    maintenanceID = ${data.maintenanceID},
                    vendorID = ${data.vendorID},
                    description = '${data.description}',
                    startDate = '${formattedDate(data.startDate)}',
                    endDate = ${eDate},
                    unlimited = ${data.unlimited},
                    frequencyID = ${data.frequencyID}
                Where id = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async inactivate(id) {
        try {
            await db.execute(`
                Update recurringworkorders
                set active = 0
                Where id = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

}