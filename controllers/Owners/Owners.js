const generator = require('generate-password');
const Email = require('../../util/email');
const models = require('../../models/importAll');

exports.getOwners = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
            
        const owners = {
            list: [],
            properties: new Map()
        };

        const getOwners = await models.Owners.getAllByCompany(companyID);
        owners.list = getOwners;
        for(const o of getOwners) {
            owners.properties.set(parseInt(o.OwnerID), await models.Properties.getPropNamesByOwner(parseInt(o.OwnerID)))
        }
            
        return res.json({
            owners: owners.list,
            properties: Object.fromEntries(owners.properties)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Owners Controller - getOwners"
        );
        return res.json({});
    }  
}

exports.deleteOwner = async (req, res, next) => {
    try {
        const ownerID = req.params.oID;

        await models.Owners.deleteOwner(ownerID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Owners Controller - deleteOwner"
        );
        return res.json(-1);
    }  
}

exports.addOwner = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;

        const password = generator.generate({
            length: 8,
            numbers: true
        });

        const ownerID = await models.Owners.add({
            name: data.name,
            phone: data.phone,
            cell: data.cell,
            email: data.email,
            password,
            companyID: data.companyID,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            agent: data.agent,
        });

        for(const property of data.properties) {
            await models.OwnerPropertyMap.add({
                propertyID: parseInt(property.value),
                ownerID
            });
        }

        // Email new owner/use
        const sendEmail = new Email();
        const emailTransporter = sendEmail.getTransporter();
        await emailTransporter.sendMail({
            from: 'support@myirent.com', 
            to: data.email, 
            subject: `You have been granted access to iRent as Owner`, 
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
            "iRent Backend - Owners Controller - addOwner"
        );
        return res.json(-1);
    }  
}

exports.getOwner = async (req, res, next) => {
    try {
        const ownerID = req.params.oID;

        let owner = {
            data: null,
            properties: []
        };

        owner.data = await models.Owners.getByID(ownerID);
        const props = await models.Properties.getPropNamesByOwner(parseInt(ownerID));
        for(const p of props) {
            owner.properties.push({ value: parseInt(p.PropertyID), label: p.PropertyName });
        }
    
        return res.json({
            data: owner.data,
            properties: owner.properties
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Owners Controller - getUser"
        );
        return res.json({});
    }  
}

exports.editOwner = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.Owners.updOwner({
            name: data.name,
            phone: data.phone,
            cell: data.cell,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            agent: data.agent,
            ownerID: data.ownerID,
        });

        const propIDs = [];
        for(const p of data.properties)
            propIDs.push(p.value);

        await models.OwnerPropertyMap.updDelete({
            ownerID: data.ownerID,
            propIDs: propIDs.join(",")
        })

        for(const pID of propIDs) {
            await models.OwnerPropertyMap.update({
                propertyID: pID,
                ownerID: data.ownerID
            });
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Owners Controller - editOwner"
        );
        return res.json(-1);
    }  
}