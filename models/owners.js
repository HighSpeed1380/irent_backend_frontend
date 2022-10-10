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

module.exports = class Owners {

    async getCompanyOwners(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select o.OwnerID, o.OwnerName, o.OwnerAddress, o.OwnerCity, o.OwnerState, o.OwnerZip,
                    o.OwnerEmail, o.OwnerPhone, o.OwnerCell, o.Rep
                From Owners o
                Where o.Active = 0 AND o.CompanyID = ${cID}
                ORDER BY o.OwnerName
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async add(data) {
        let ownerID = null;
        try {
            const res = await db.execute(`
                INSERT INTO Owners
                (OwnerName, OwnerPhone, OwnerCell, CellPhoneProviderID, OwnerEmail, OwnerPW, CompanyID, 
                    Active, OwnerAddress, OwnerCity, OwnerState, OwnerZip, Rep)
                VALUES('${data.name}', '${data.phone}', '${data.cell}', 999, '${data.email}', '${data.password}',
                    ${data.companyID}, 0, '${data.address}', '${data.city}', '${data.state}', 
                    '${data.zip}', '${data.agent}')
            `);
            ownerID = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return ownerID;
    }

    async deleteOwner(oID) {
        try {
            await db.execute(`
                UPDATE Owners
                SET Active = 2
                WHERE OwnerID = ${oID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updOwner(data) {
        try {
            await db.execute(`
                UPDATE Owners
                set OwnerName = '${data.name}',
                OwnerPhone = '${data.phone}',
                OwnerCell = '${data.cell}',
                OwnerEmail = '${data.email}',
                OwnerAddress = '${data.address}',
                OwnerCity = '${data.city}',
                OwnerState = '${data.state}',
                OwnerZip = '${data.zip}',
                Rep = '${data.agent}'
                Where OwnerID = ${data.ownerID}
            `)
        } catch(err) {
            console.log(err);
        }
    }

}