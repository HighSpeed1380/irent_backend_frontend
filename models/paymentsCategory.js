const db = require('../util/database');

module.exports = class PaymentsCategory {

    async getByPropertyID(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From paymentscategory
                Where PropertyID = ${pID}
                Order By Category
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByNameAndProperty(data) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From paymentscategory
                Where PropertyID = ${data.propertyID} and Category = '${data.categoryName}'
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
                INSERT INTO paymentscategory (PropertyID, Category)
                VALUES(${data.propertyID}, '${data.categoryName}')
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async deleteByID(id) {
        try {
            await db.execute(`
                DELETE From paymentscategory 
                Where PaymentsCategoryID = ${id}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}