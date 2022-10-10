const db = require('../util/database');

module.exports = class Notifications {

    async getByUser(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * FROM Notifications WHERE UserID = ${uID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addUserNotification(uID) {
        try {
            await db.execute(`
                INSERT INTO Notifications
                (UserID, TransactionMod, MissedP2P, ChargesPosted, ScrollingTables)
                VALUES (${uID}, '0', '0', '0' , '0');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updateUsersNotification(data) {
        try {
            await db.execute(`
                Update Notifications
                set TransactionMod = ${data.transactionMod},
                    MissedP2P = ${data.missedP2P},
                    ChargesPosted = ${data.chargesPosted},
                    ProductUpdateNotifications = ${data.productUpdateNotifications}
                Where NotificationID = ${data.notificationID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updatePreferences(data) {
        try {
            await db.execute(`
                Update Notifications
                set MultiProp = ${data.multiProp},
                    SingleCheckbook = ${data.singleCheckbook}
                Where NotificationID = ${data.notificationID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}