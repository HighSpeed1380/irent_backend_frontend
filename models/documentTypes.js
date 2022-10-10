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

module.exports = class DocumentTypes {

    async getAll() {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM DocumentTypes ORDER BY DocumentType
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

}