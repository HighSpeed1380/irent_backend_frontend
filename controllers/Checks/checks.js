const Email = require('../../util/email');

const CheckModel = require('../../models/checks');

const Check = new CheckModel();


exports.getChecks = async (req, res, next) => {
    try {
        return res.json(await Check.get());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Checks Controller - getChecks"
        );
        return res.json([]);
    }  
}
