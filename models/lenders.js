const db = require('../util/database');

module.exports = class Lenders {

    async getLenderName(lID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select Lender From Lenders Where LenderID = ${lID}
            `);
            if(res[0].length > 0)
                response = res[0][0].Lender;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByCompanyID(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM Lenders 
                WHERE CompanyID = ${cID} 
                and Lender != ''
                ORDER BY Lender
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByID(id) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Lenders WHERE LenderID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByName(name) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Lenders WHERE Lender = '${name}'
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO Lenders (Lender, CompanyID)
                VALUES ('${data.lender}', ${data.companyID})
            `);
        } catch(err) {
            console.log(err);
        }
    }
}