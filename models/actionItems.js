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

module.exports = class ActionItems {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM ActionItems 
                WHERE ActionItemsID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updPMComment(data) {
        try {
            await db.execute(`
                UPDATE ActionItems 
                SET PMComment = '${data.comment}'
                WHERE ActionItemsID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}