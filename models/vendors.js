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

module.exports = class Vendors {

    async getByCompanyID(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM Vendors 
                WHERE CompanyID = ${cID} AND Active = '0' 
                and VendorName != ''
                ORDER BY VendorName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByID(vID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Vendors 
                WHERE VendorID = ${vID}
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
                INSERT INTO Vendors
                (VendorName, CompanyID, VendorAddress1, VendorAddress2, VendorCity, VendorState, VendorZip, 
                    VendorEmail, VendorPhone, VendorStartDate, RoutingNumber, AcountNumber, Active, VendorEIN, 
                    A1099, Memo)
                VALUES ('${data.name}', ${data.companyID}, '${data.address1}', '${data.address2}', '${data.city}', 
                '${data.state}', '${data.zip}', '${data.email}', '${data.phone}', '${formattedDate(new Date())}', 
                '${data.routing}', '${data.account}', 0, '${data.ein}', ${data.a1099}, '${data.memo}');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async deactive(id) {
        await db.execute(`
            Update Vendors 
            set Active = 1
            Where VendorID = ${id}
        `);
    }

    async update(data) {
        try {
            await db.execute(`
                UPDATE Vendors
                SET VendorName = '${data.name}',
                    VendorPhone = '${data.phone}',
                    VendorEmail = '${data.email}',
                    VendorAddress1 = '${data.address1}',
                    VendorAddress2 = '${data.address2}',
                    VendorCity = '${data.city}',
                    VendorState = '${data.state}',
                    VendorZip = '${data.zip}',
                    RoutingNumber = '${data.routing}',
                    AcountNumber = '${data.account}',
                    VendorEIN = '${data.ein}',
                    A1099 = ${data.a1099},
                    Memo = '${data.memo}'
                WHERE VendorID = ${data.vendorID}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}