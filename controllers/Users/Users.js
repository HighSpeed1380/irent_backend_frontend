const generator = require('generate-password');
const Email = require('../../util/email');

const models = require('../../models/importAll');

exports.getUsers = async (req, res, next) => {
    try {
        const companyID = req.params.cID;

        const users = {
            list: [],
            properties: new Map()
        };

        const getUsers = await models.User.getCompanyUsers(companyID);
        users.list = getUsers;
        for(const u of getUsers) {
            users.properties.set(parseInt(u.UserID), await models.Properties.getPropNamesByUser(parseInt(u.UserID)))
        }
            
        return res.json({
            users: users.list,
            properties: Object.fromEntries(users.properties)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getUsers"
        );
        return res.json({});
    }  
}

exports.getPropertiesByCompany = async (req, res, next) => {
    try {
        const companyID = req.params.cID;

        return res.json(await models.Properties.get(companyID))
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getPropertiesByCompany"
        );
        return res.json([]);
    } 
}

exports.getSecurityLevels = async (req, res, next) => {
    try {
        return res.json(await models.SecurityLevels.get())
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getSecurityLevels"
        );
        return res.json([]);
    } 
}

exports.addUser = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const exists = await models.User.getByEmail(data.email);
        if(exists !== null)
            return res.json("User's email already exists. Please, enter another email.");
        
        // generate password
        const password = generator.generate({
            length: 8,
            numbers: true
        });
        
        const userID = await models.User.addUser({
            firstName: data.firstName,
            lastname: data.lastname,
            phone: data.phone,
            cellPhoneProvider: '999',
            email: data.email,
            password,
            securityLevelID: data.securityLevelID,
            companyID: data.companyID
        });

        await models.Notifications.addUserNotification(userID);

        for(const property of data.properties) {
            await models.UserPropertyMap.add({
                propertyID: parseInt(property.value),
                userID
            })
        }

        await models.FirstTimeUser.add(userID);
        
        // Email new user
        const sendEmail = new Email();
        const emailTransporter = sendEmail.getTransporter();
        await emailTransporter.sendMail({
            from: 'support@myirent.com', 
            to: data.email, 
            subject: `You have been granted access to iRent`, 
            html: `
                <br/>
                You have been granted access to iRent <br/>
                To login and change your password, click on this <a href="https://myirent.com/rent/">link</a> <br/> 
                Your Temporary Password is: ${password}
            `
        }); 

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addUser"
        );
        return res.json(-1);
    } 
}

exports.deactivateUser = async (req, res, next) => {
    try {
        const userID = req.params.uID;
            
        await models.User.deleteUser(userID);

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deactivateUser"
        );
        return res.json(-1);
    } 
}

exports.getUser = async (req, res, next) => {
    try {
        const userID = req.params.uID;

        let user = {
            data: null,
            properties: []
        };

        user.data = await models.User.get(userID);
        const props = await models.Properties.getPropNamesByUser(parseInt(userID));
        for(const p of props) {
            user.properties.push({ value: parseInt(p.PropertyID), label: p.PropertyName });
        }
    
        return res.json({
            data: user.data,
            properties: user.properties
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getUser"
        );
        return res.json({});
    }  
}

exports.editUser = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const exists = await models.User.getByEmail(data.email);
        if(exists !== null) {
            if(data.userID !== exists[0].UserID)
                return res.json("User's email already exists. Please, enter another email.");
        }

        await models.User.updUser({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            securityLevel: data.securityLevel,
            userID: data.userID,
        });

        const propIDs = [];
        for(const p of data.properties)
            propIDs.push(p.value);

        await models.UserPropertyMap.updDelete({
            userID: data.userID,
            propIDs
        });

        for(const pID of propIDs) {
            await models.UserPropertyMap.update({ propertyID: pID, userID: data.userID });
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - editUser"
        );
        return res.json(-1);
    }  
}