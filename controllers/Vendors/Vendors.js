const Email = require('../../util/email');
const models = require('../../models/importAll');

exports.getAll = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
            
        return res.json(await models.Vendors.getByCompanyID(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Vendors Controller - getAll"
        );
        return res.json([]);
    }  
}

exports.getByID = async (req, res, next) => {
    try {
        const vendorID = req.params.vID;
            
        return res.json(await models.Vendors.getByID(vendorID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Vendors Controller - getByID"
        );
        return res.json(null);
    }  
}

exports.add = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.Vendors.add({
            name: data.name.replace(/'/g, "\\'"),
            companyID: data.companyID,
            address1: data.address1.replace(/'/g, "\\'"),
            address2: data.address2.replace(/'/g, "\\'"),
            city: data.city.replace(/'/g, "\\'"),
            state: data.state.replace(/'/g, "\\'"),
            zip: data.zip.replace(/'/g, "\\'"),
            email: data.email.replace(/'/g, "\\'"),
            phone: data.phone.replace(/'/g, "\\'"),
            routing: data.routing.replace(/'/g, "\\'"),
            account: data.account.replace(/'/g, "\\'"),
            ein: data.ein.replace(/'/g, "\\'"),
            a1099: data.a1099,
            memo: data.memo.replace(/'/g, "\\'")
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Vendors Controller - add"
        );
        return res.json(-1);
    }  
}

exports.deactive = async (req, res, next) => {
    try {
        const vendorID = req.params.vID;
            
        await models.Vendors.deactive(vendorID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Vendors Controller - deactive"
        );
        return res.json(-1);
    }  
}

exports.merge = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.CheckRegister.mergeVendor({
            vendor2ID: data.vendor2ID,
            vendor1ID: data.vendor1ID
        });
        await models.Vendors.deactive(data.vendor1ID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Vendors Controller - merge"
        );
        return res.json(-1);
    }  
}

exports.update = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.Vendors.update({
            name: data.name.replace(/'/g, "\\'"),
            address1: data.address1.replace(/'/g, "\\'"),
            address2: data.address2.replace(/'/g, "\\'"),
            city: data.city.replace(/'/g, "\\'"),
            state: data.state.replace(/'/g, "\\'"),
            zip: data.zip.replace(/'/g, "\\'"),
            email: data.email.replace(/'/g, "\\'"),
            phone: data.phone.replace(/'/g, "\\'"),
            routing: data.routing.replace(/'/g, "\\'"),
            account: data.account.replace(/'/g, "\\'"),
            ein: data.ein.replace(/'/g, "\\'"),
            a1099: data.a1099,
            memo: data.memo.replace(/'/g, "\\'"),
            vendorID: data.vendorID
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Vendors Controller - update"
        );
        return res.json(-1);
    }  
}