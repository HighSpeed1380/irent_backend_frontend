const nodemailer = require("nodemailer");

let transporter;

module.exports = class Email {
    constructor() {
        transporter = nodemailer.createTransport({
            host: "mail.vps-myirent-com.vps.ezhostingserver.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "support@myirent.com", // generated ethereal user
              pass: "iRent4Now!iRent4Now!", // generated ethereal password
            },
        });
    }

    getTransporter() {
        return transporter;
    }

    async errorEmail(error, subject) {
        await transporter.sendMail({
            from: 'support@myirent.com', 
            to: "error@myirent.com", 
            subject: "Error: " + subject, 
            html: error.toString(), 
        }); 
    }

    async sendUsDefaultEmail(msg, subject) {
        await transporter.sendMail({
            from: 'support@myirent.com', 
            to: "support@myirent.com", 
            subject: subject, 
            html: msg.toString(), 
        }); 
    }
};
