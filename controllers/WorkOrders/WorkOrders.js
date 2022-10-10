const ftp = require('basic-ftp');
const urlExists = require('url-exists');
const Email = require('../../util/email');
const models = require('../../models/importAll');

exports.getOpenWKSummary = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
            
        return res.json(await models.WorkOrders.getOpenWKSummary(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getOpenWKSummary"
        );
        return res.json([]);
    }  
}

exports.getPrintView = async (req, res, next) => {
    try {
        const workOrderID = req.params.wkID;

        return res.json(await models.WorkOrders.getPrintViewWK(workOrderID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getPrintView"
        );
        return res.json([]);
    }  
}

exports.getMaintenanceUsers = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.User.getMaintenanceByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getMaintenanceUsers"
        );
        return res.json([]);
    }  
}

exports.getbyID = async (req, res, next) => {
    try {
        const workOrderID = req.params.wkID;

        return res.json(await models.WorkOrders.getByID(workOrderID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getbyID"
        );
        return res.json([]);
    }  
}

exports.getUnit = async (req, res, next) => {
    try {
        const unitID = req.params.uID;

        return res.json(await models.Units.getByID(unitID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getUnit"
        );
        return res.json([]);
    }  
}

exports.getOpenWorkOrders = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.WorkOrders.getOpens(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getOpenWorkOrders"
        );
        return res.json([]);
    }  
}

exports.getClosedWorkOrders = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.WorkOrders.getClosed(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getClosedWorkOrders"
        );
        return res.json([]);
    }  
}

exports.addWorkOrder = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const wkID = await models.WorkOrders.addWorkOrder({
            unitID: data.unitID,
            description: data.description,
            submitDate: data.submitDate,
            propertyID: data.propertyID,
            priorityID: data.priorityID,
            userID: data.userID,
            maintenanceID: data.maintenanceID,
            vendorID: data.vendorID,
            submittedBy: data.submittedBy
        });

        if(data.file !== null) {
            //const fileName = `WKID_${wkID}`;
            let path = `/wwwroot/rent/iRentAppIMG/${data.propertyID}/${data.unitID}`;
            const client = new ftp.Client();
            client.ftp.verbose = true
            try {
                await client.access({
                    host: "65.175.100.94",
                    user: "giovanniperazzo",
                    password: "iRent4Now!",
                    secure: false
                });
                await client.ensureDir(path);
            }
            catch(err) {
                //console.log(err)
            }
        }

        return res.json(wkID);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - addWorkOrder"
        );
        return res.json(-1);
    }  
}

exports.getImage = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const path = `https://myirent.com/rent/iRentAppIMG/${data.propertyID}/${data.unitID}/WKID_${data.workOrderID}.png`;
        urlExists(path, function(err, exists) {
            if(exists)
                return res.json(`./iRentAppIMG/${data.propertyID}/${data.unitID}/WKID_${data.workOrderID}.png`);
            else
                return res.json('');
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getImage"
        );
        return res.json("");
    } 
}

exports.addFileNotification = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        // notify
        const property = await models.Properties.getByID(data.propertyID);
        if(parseInt(property.NotifyWorkOrderChanges) === 1) {
            let pms = await models.User.getPMByProperty(parseInt(data.propertyID));
            if(pms.length === 0) 
                pms = await models.User.getAdminByProperty(parseInt(data.propertyID));
            const maintenances = await models.User.getMaintenanceByProperty(parseInt(data.propertyID));
            let from = [];
            for(const u of pms)
                from.push(u.UserEmail);

            if(from.length > 0){
                const unit = models.Units.getByID(parseInt(data.unitID));
                for(const m of maintenances) {
                    let emailBody = `<b>New Work Order:</b> <i>${data.description}</i><br/><br/>`
                    const userEmail = new Email();
                    const userTransporter = userEmail.getTransporter();
                    await userTransporter.sendMail({
                        from: from[0], 
                        to: m.UserEmail, 
                        subject: `A New Work Order has been submitted for Unit: ${unit !== null ? unit.UnitName : ' Common Area'}`,
                        html: emailBody
                    });
                }
            }
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - addFileNotification"
        );
        return res.json(-1);
    }  
}

exports.update = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        await models.WorkOrders.update({
            comment: data.comment,
            status: data.status,
            completeDt: data.completeDt,
            maintenance: data.maintenance,
            vendorID: data.vendorID,
            escrow: data.escrow ? 1 : 0,
            escrowHours: data.escrowHours,
            priorityID: data.priorityID,
            userID: data.userID,
            workOrderID: data.workOrderID
        });

        if(data.tenantID !== undefined && data.tenantID !== null) {
            if(data.tenantCharge !== undefined && data.tenantCharge > 0) {
                await models.TenantTransactions.addOneTimeFee({
                    chargeTypeID: 5,
                    tenantID: parseInt(data.tenantID),
                    transactionType: 1,
                    amount: parseFloat(data.tenantCharge).toFixed(2),
                    comment: data.WorkOrderComment,
                    transactionDate: new Date(),
                    userID: data.userID,
                    depositSourceID: 1
                });
            }

            // Notify
            let fromEmails = [];
            const pms = await models.User.getPMByProperty(data.propertyID);
            if(pms.length === 0) {
                const admins = await models.User.getAdminByProperty(data.propertyID);
                for(const a of admins)
                    fromEmails.push(a.UserEmail);
            } else {
                for(const p of pms)
                    fromEmails.push(p.UserEmail);
            }
            const tenant = await models.Tenants.get(data.tenantID);
            if(tenant !== null && fromEmails.length > 0 && tenant.TenantEmail !== '') {
                const property = await models.Properties.getByID(data.propertyID);
                const status = await models.Status.getByID(parseInt(data.status));
                const getWK = await models.WorkOrders.getByID(parseInt(data.workOrderID));

                let emailBody = `<B>Dear ${tenant.TenantFName},</B> <BR><BR>`;
                emailBody += `The work order you submitted below has been reviewed by the ${property.PropertyName} staff, `;
                emailBody += `and the status has been changed to ${status.Status}. If you need to update this work order, or submit another please log into `;
                emailBody += `<a href="https://myirent.com/rent/tenantPortal">Tenant Portal</a> <BR><BR>`;
                emailBody += `<B>Work Order Description</B> <BR>`;
                emailBody += `${getWK.WorkOrderDescription} <br><br>`;
                emailBody += `<B>Work Order Comment</B> <BR>`;
                emailBody += `${data.comment} <br><br>`;
                    
                const tenantSendEmail = new Email();
                const tenantTransaporter = tenantSendEmail.getTransporter();
                await tenantTransaporter.sendMail({
                    from: fromEmails[0], 
                    to: tenant.TenantEmail, 
                    subject: `The status of your work order has changed`,
                    html: emailBody
                });
            }
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - update"
        );
        return res.json(-1);
    } 
}

exports.getRecurringByProperty = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.RecurringWorkOrders.getByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getRecurringByProperty"
        );
        return res.json([]);
    }  
}

exports.addRecurring = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        await models.RecurringWorkOrders.add({
            propertyID: data.propertyID,
            priorityID: data.priorityID,
            maintenanceID: data.maintenanceID,
            vendorID: data.vendorID,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            unlimited: data.unlimited,
            frequencyID: data.frequencyID,
            userID: data.userID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - addRecurring"
        );
        return res.json(-1);
    } 
}

exports.getRecurringByID = async (req, res, next) => {
    try {
        const id = req.params.id;

        return res.json(await models.RecurringWorkOrders.getByID(id));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getRecurringByID"
        );
        return res.json(null);
    }  
}

exports.updateRecurring = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        await models.RecurringWorkOrders.update({
            priorityID: data.priorityID,
            maintenanceID: data.maintenanceID,
            vendorID: data.vendorID,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            unlimited: data.unlimited,
            frequencyID: data.frequencyID,
            id: data.id
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - updateRecurring"
        );
        return res.json(-1);
    } 
}

exports.inactivateRecurring = async (req, res, next) => {
    try {
        const id = req.params.id;

        await models.RecurringWorkOrders.inactivate(id);
        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - inactivateRecurring"
        );
        return res.json(-1);
    }  
}

exports.getAddWKUnits = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.Units.getUnitTenantByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Work Orders Controller - getAddWKUnits"
        );
        return res.json([]);
    }  
}