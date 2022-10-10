const db = require('../util/database');
const moment = require('moment');

module.exports = class Users {

    async get(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * From Users
                Where UserID = ${uID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getUserSecurityLevel(uID) {
        let response = {};
        try {
            const res = await db.execute(`
                SELECT u.UserFName, u.UserLName, u.UserEmail, sl.securitylevel 
                FROM users u 
                JOIN securitylevel sl ON u.SecurityLevelID = sl.SecurityLevelID
                WHERE u.UserID = ${uID}
            `);
            response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getSignatures(uID) {
        let response = {
            name: "",
            font: ""
        };
        try {
            const res = await db.execute(`
                Select SignatureName, SignatureFont From Users Where UserID = ${uID}
            `);
            if(res[0].length > 0) {
                response.name = res[0][0].SignatureName;
                response.font = res[0][0].SignatureFont;
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getFullName(uID) {
        let response = "";
        try {
            const res = await db.execute(`
                Select UserFName, UserLName From Users Where UserID = ${uID}
            `);
            if(res[0].length > 0) {
                response = res[0][0].UserFName + ' ' + res[0][0].UserLName;
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getCompanyUsers(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select u.UserID, u.UserFName, u.UserLName, u.UserPhone, u.UserEmail, s.SecurityLevel,
                    u.SecurityLevelID
                From Users u
                JOIN SecurityLevel s ON u.SecurityLevelID = s.SecurityLevelID
                WHERE u.CompanyID = ${cID} AND u.Active = 1
                Order By u.UserFName, u.UserLName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByEmail(email) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From Users Where UserEmail = '${email}' and active = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addUser(data) {
        let userID = null;
        try {
            const res = await db.execute(`
                INSERT INTO Users
                    (UserFName, UserLName, UserPhone, CellPhoneProviderID, UserEmail, 
                    UserPW, UserStartDate, SecurityLevelID, CompanyID, Active)
                VALUES('${data.firstName}', '${data.lastname}', '${data.phone}', '${data.cellPhoneProvider}',
                    '${data.email}', '${data.password}', '${moment.utc().format("YYYY-MM-DD")}',
                    ${data.securityLevelID}, ${data.companyID}, 1
                )
            `);
            userID = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return userID;
    }

    async deleteUser(uID) {
        try {
            await db.execute(`
                UPDATE Users
                SET Active='2'
                Where UserID = ${uID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getExtraAdmin(cID, uID) {
        let output = true;
        try {
            const res = await db.execute(`
                Select 1 From Users
                Where Active = 1 AND CompanyID = ${cID}
                AND UserID != ${uID}
            `);
            if(res[0].length === 0)
                output = false;
        } catch(err) {
            console.log(err);
        }
        return output;
    }

    async updUser(data) {
        try {
            await db.execute(`
                UPDATE Users
                set UserFName = '${data.firstName}',
                UserLName = '${data.lastName}',
                UserPhone = '${data.phone}',
                UserEmail = '${data.email}',
                SecurityLevelID = ${data.securityLevel}
                Where UserID = ${data.userID}
            `)
        } catch(err) {
            console.log(err);
        }
    }

    async getOwnersByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Users, UserPropertyMap, Notifications 
                WHERE Users.UserID = UserPropertyMap.UserID 
                AND PropertyID = ${pID}
                AND Users.SecurityLevelID=1 
                AND Users.UserID=Notifications.UserID AND Notifications.TransactionMod=0 AND Users.Active = 1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPMByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Users, UserPropertyMap 
                WHERE Users.UserID=UserPropertyMap.UserID 
                AND PropertyID = ${pID}
                AND Users.SecurityLevelID=2 AND Users.Active = 1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getAdminByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select * From Users, UserPropertyMap 
                WHERE Users.UserID=UserPropertyMap.UserID 
                AND PropertyID = ${pID}
                AND Users.SecurityLevelID=1 AND Users.Active = 1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async login(data) {
        let response = {};
        try {
            const res = await db.execute(`
                select u.UserID, u.UserFName, u.UserLName, u.UserEmail, u.SecurityLevelID, c.Active, ul.LastPropertyID,
                    c.CompanyID, c.CompanyName, c.ContactEmail, c.LeadSourceCompanyID, c.LateLicensePayment
                From Users u 
                JOIN Company c ON u.CompanyID = c.CompanyID
                LEFT JOIN UserLog ul ON u.UserID = ul.UserID
                Where u.Active = 1 and ul.LastPropertyID != 0
                and u.UserEmail = '${data.email}'
                and u.UserPW = '${data.password}'
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async forgetPassword(data) {
        let response = null;
        try {
            const res = await db.execute(`
                select u.UserID, u.UserPW, c.CompanyID, c.Active
                From Users u 
                JOIN Company c ON u.CompanyID = c.CompanyID
                Where u.Active = 1 
                and u.UserEmail = '${data.email}'
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getMaintenanceByProperty(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select u.UserID, u.UserFName, u.UserLName, U.UserEmail
                From Users u
                JOIN UserPropertyMap upm ON U.UserID = upm.UserID
                Where u.SecurityLevelID = 7
                AND upm.PropertyID = ${pID} and u.active = 1
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getUserProfileData(uID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select u.UserFName, u.UserLName, u.UserPW, u.SignatureName, u.SignatureFont,
                    n.TransactionMod, n.NotificationID, n.MissedP2P, n.ChargesPosted, n.MultiProp,
                    n.SingleCheckbook, n.ProductUpdateNotifications
                From Users u
                JOIN Notifications n ON u.UserID = n.UserID
                Where u.UserID = ${uID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePassword(data) {
        try {
            await db.execute(`
                Update Users
                set UserPW = '${data.password}'
                Where UserID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updateSignature(data) {
        try {
            await db.execute(`
                Update Users
                set SignatureName = '${data.signatureName}',
                    SignatureFont = '${data.signatureFont}'
                Where UserID = ${data.id}
            `);
        } catch(err) {
            console.log(err);
        }
    }
}