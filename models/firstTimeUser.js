const db = require('../util/database');

module.exports = class FirstTimeUser {

    async add(userID) {
        try {
            await db.execute(`
                INSERT INTO FirstTimeUser (UserID) VALUES (${userID})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}