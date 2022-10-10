const db = require('../util/database');

module.exports = class HtmlForms {

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                select * from htmlforms Where id = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}