const Email = require('../../util/email');
const models = require('../../models/importAll');

exports.getUserProfileData = async (req, res, next) => {
    try {
        const userID = req.params.uID;

        return res.json(await models.User.getUserProfileData(userID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Profile Controller - getUserProfileData"
        );
        return res.json(null);
    }  
}

exports.updateNotifications = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;

        await models.Notifications.updateUsersNotification({
            transactionMod: data.transactionMod,
            missedP2P: data.missedP2P,
            chargesPosted: data.chargesPosted,
            productUpdateNotifications: data.productUpdateNotifications,
            notificationID: data.notificationID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Profile Controller - updateNotifications"
        );
        return res.json(-1);
    }  
}

exports.updatePreferences = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.Notifications.updatePreferences({
            multiProp: data.multiProp,
            singleCheckbook: data.singleCheckbook,
            notificationID: data.notificationID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Profile Controller - updatePreferences"
        );
        return res.json(-1);
    }  
}

exports.updatePassword = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.User.updatePassword({
            password: data.password,
            id: data.userID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Profile Controller - updatePassword"
        );
        return res.json(-1);
    }  
}

exports.updateSignature = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.User.updateSignature({
            signatureName: data.signatureName,
            signatureFont: data.signatureFont,
            id: data.userID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Profile Controller - updateSignature"
        );
        return res.json(-1);
    }  
}