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

module.exports = class WhiteList {

    async add(data) {
        try {
            await db.execute(`
                INSERT INTO WhiteList
                (PropertyID, UserID, MoveOutDate, TenantID, TenantEmail, TenantPhone, 
                 FAddress, FCity, FState, FZip, Whitelist, Collections, SubmitDate, 
                 RentAgain, WhiteListComments)
                VALUES (${data.propertyID}, ${data.userID}, '${formattedDate(new Date())}', ${data.tenantID}, 
                '${data.tenantEmail}', '${data.tenantPhone}', '${data.address}', '${data.city}', 
                '${data.state}', '${data.zip}', ${data.whitelist}, ${data.collections}, '${formattedDate(new Date())}', 
                ${data.rentAgain}, '${data.comment}');
            `);
        } catch(err) {
            console.log(err);
        }
    }

}