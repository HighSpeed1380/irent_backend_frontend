const Email = require('../../util/email');
const models = require('../../models/importAll');

exports.login = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        return res.json(await models.User.login({
            email: data.email,
            password: data.password
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Login Controller - login"
        );
        return res.json({});
    }  
}

exports.getUserNotifications = async (req, res, next) => {
    try {
        const userID = req.params.uID;
            
        return res.json(await models.Notifications.getByUser(userID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Login Controller - getUserNotifications"
        );
        return res.json({});
    }  
}

exports.forgetPassword = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const getUser = await models.User.forgetPassword({
            email: data.email
        });
        if(getUser === null)
            return res.json("User not found.");
        if(parseInt(getUser.Active) !== 1)
            return res.json("Company is inactive. Please contact us to reinstate your account.");
        
        // Send Email
        let emailBody = `Your password is: <mark>${getUser.UserPW}</mark>.   Please log in at <a href="https://myirent.com/rent">www.myirent.com/rent</a>.`;
        const userEmail = new Email();
        const userTransporter = userEmail.getTransporter();
        await userTransporter.sendMail({
            from: 'support@myirent.com', 
            to: data.email, 
            subject: "You iRent password",
            html: emailBody
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Login Controller - getUserNotifications"
        );
        return res.json("Error processing your request. Please contat us.");
    }  
}