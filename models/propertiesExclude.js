const db = require('../util/database');

module.exports = class PropertiesExclude {

    async getByID(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Properties_Exclude Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByCompanyID(cID) {
        let response = {};
        try {
            const res = await db.execute(`
                Select * From Properties_Exclude where propertyid in (
                    Select propertyid from properties where companyid = ${cID}
                ) limit 1
            `);
            if(res[0].length > 0)
                    response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updateCompanyBilling(data) {
        let output;
        try {
            const res = await db.execute(`
                Update Properties_Exclude 
                set AutoBill = ${data.autoBill},
                AutoBillNotify = ${data.autoBillNotify}
                where propertyid in (
                    Select propertyid from properties where companyid = ${data.companyID}
                )
            `);
            output = 0;
        } catch(err) {
            console.log(err);
            output = -1
        }
        return output;
    }

    async insertAutoBill(pID, data) {
        await db.execute(`
            INSERT INTO Properties_Exclude (
                PropertyID, 
                AutoBill,
                AutoBillNotify
            )
            VALUES ( 
                ${pID},
                ${data.AutoBill},
                '1'
            )
        `);
    }

    async updateAutoBill(pID, data) {
        await db.execute(`
            UPDATE Properties_Exclude 
            SET
                AutoBill = ${data.AutoBill},
            WHERE 
                PropertyID = ${pID}
            )
        `);
    }

    async insertAutoBillNotify(pID, data) {
        await db.execute(`
            INSERT INTO Properties_Exclude (
                PropertyID, 
                AutoBill,
                AutoBillNotify
            )
            VALUES ( 
                ${pID},
                '1'
                ${data.AutoBill}                
            )
        `);
    }

    async updateAutoBillNotify(pID, data) {
        await db.execute(`
            UPDATE Properties_Exclude 
            SET
                AutoBillNotify = ${data.AutoBillNotify}
            WHERE 
                PropertyID = ${pID}
            )
        `);
    }
}