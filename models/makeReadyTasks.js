const db = require('../util/database');

module.exports = class MakeReadyTasks {

    async getById(id) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM MakeReadyTasks WHERE MakeReadyTaskID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByPropertyID(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM MakeReadyTasks WHERE PropertyID = ${pID}
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async delete(id) {
        try {
            await db.execute(`
                DELETE FROM MakeReadyTasks WHERE MakeReadyTaskID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO MakeReadyTasks (Task, PropertyID)
                VALUES ('${data.task}', ${data.propertyID});
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
        try {
            await db.execute(`
                UPDATE MakeReadyTasks
                set Task = '${data.task}'
                Where MakeReadyTaskID = ${data.makeReadyTaskID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}