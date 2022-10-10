const db = require('../util/database');

module.exports = class HelpVideos {

    async getByKeyWord(word) {
        let response = [];
        try {
            const res = await db.execute(`
                select * From helpvideos
                where KeyWords like '%${word}%'
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}