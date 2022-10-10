const moment = require('moment');

const Email = require('../../util/email');
const models = require('../../models/importAll');
const Encrypt = require('../../util/encrypt');

const replaceCustomVariables = async (data, str) => {
    let content = str;

    const tenant = await models.Tenants.get(parseInt(data.tenantID));
    if(tenant !== null) {
        content = content.replace(new RegExp('#tenantFName#', 'g'), tenant.TenantFName);
        content = content.replace(new RegExp('#tenantLName#', 'g'), tenant.TenantLName);
        content = content.replace(new RegExp('#tenantEmail#', 'g'), tenant.TenantEmail);
        content = content.replace(new RegExp('#moveInDate#', 'g'), tenant.MoveInDate !== '' ? moment(tenant.MoveInDate).format("MM/DD/YYYY") : '');
        content = content.replace(new RegExp('#leaseStartDate#', 'g'), tenant.LeaseStartDate !== '' ? moment(tenant.LeaseStartDate).format("MM/DD/YYYY") : '');
        content = content.replace(new RegExp('#leaseEndDate#', 'g'), tenant.LeaseEndDate !== '' ? moment(tenant.LeaseEndDate).format("MM/DD/YYYY") : '');
        content = content.replace(new RegExp('#moveOutDate#', 'g'), tenant.MoveOutDate !== '' ? moment(tenant.MoveOutDate).format("MM/DD/YYYY") : '');
        content = content.replace(new RegExp('#tenantPortion#', 'g'), `$${(parseFloat(tenant.RentalAmount) - parseFloat(tenant.HousingAmount)).toFixed(2)}`);
        content = content.replace(new RegExp('#housePortion#', 'g'), `$${parseFloat(tenant.HousingAmount).toFixed(2)}`);
        content = content.replace(new RegExp('#rentalAmount#', 'g'), `$${parseFloat(tenant.RentalAmount).toFixed(2)}`);
        content = content.replace(new RegExp('#petFee#', 'g'), `$${parseFloat(tenant.PetRent).toFixed(2)}`);
        content = content.replace(new RegExp('#securityDeposit#', 'g'), `$${parseFloat(tenant.SecurityDeposit).toFixed(2)}`);
        content = content.replace(new RegExp('#TvCharge#', 'g'), `$${parseFloat(tenant.TVCharge).toFixed(2)}`);
        content = content.replace(new RegExp('#utilityCharge#', 'g'), `$${parseFloat(tenant.UtilityCharge).toFixed(2)}`);
        content = content.replace(new RegExp('#parkingCharge#', 'g'), `$${parseFloat(tenant.ParkingCharge).toFixed(2)}`);
        content = content.replace(new RegExp('#storageCharge#', 'g'), `$${parseFloat(tenant.StorageCharge).toFixed(2)}`);
        content = content.replace(new RegExp('#peopleOnLease#', 'g'), tenant.OnLease);
    }

    const user = await models.User.get(parseInt(data.userID));
    if(user !== null) {
        const securityLevel = await models.SecurityLevels.getByID(parseInt(user.SecurityLevelID));
        content = content.replace(new RegExp('#userName#', 'g'), `${user.UserFName} ${user.UserLName}`);
        content = content.replace(new RegExp('#userEmail#', 'g'), user.UserEmail);
        content = content.replace(new RegExp('#userRole#', 'g'), securityLevel.SecurityLevel);
        let userSRC = '#tenantSignature#';
        if(user !== null && user.SignatureName !== '' && user.SignatureFont !== '') 
            userSRC = `<span style="font-family:${user.SignatureFont}, cursive; font-size: 20px;">${user.SignatureName}</span>`;
        content = content.replace(new RegExp('#userSignature#', 'g'), userSRC);
    }

    const property = await models.Properties.getByID(parseInt(data.propertyID));
    const lf = property.LateFee !== null ? property.LateFee : 0;
    content = content.replace(new RegExp('#lateFee#', 'g'), `$${parseFloat(lf).toFixed(2)}`);
	content = content.replace(new RegExp('#dailylateFee#', 'g'), `$${parseFloat(property.DailyLateFee).toFixed(2)}`);
	content = content.replace(new RegExp('#bankFee#', 'g'), `$${parseFloat(property.BankFee).toFixed(2)}`);
	content = content.replace(new RegExp('#propertyName#', 'g'), property.PropertyName);
	content = content.replace(new RegExp('#propertyPhone#', 'g'), property.PropertyPhone);
	content = content.replace(new RegExp('#propertyEmail#', 'g'), property.PropertyEmail);
	content = content.replace(new RegExp('#propertyStreet#', 'g'), `${property.PropertyAddress1} ${property.PropertyAddress2}`);
	content = content.replace(new RegExp('#propertyCity#', 'g'), property.PropertyCity);
	content = content.replace(new RegExp('#propertyState#', 'g'), property.PropertyState);
	content = content.replace(new RegExp('#propertyZIP#', 'g'), property.PropertyZip);

    const units = await models.Units.getByID(parseInt(tenant.UnitID));
    content = content.replace(new RegExp('#unitNumber#', 'g'), units ? units.UnitName : '');

    const layoutMapContact = await models.LayoutMapContact.getByPropertyID(data.propertyID);
    content = content.replace(new RegExp('#officeHours#', 'g'), layoutMapContact ? layoutMapContact.customDateTime : "");

    let imgsLV = "";
    let curDateViolation = false;
    if(data.leaseViolationID !== null) {
        const docLeaseViolation = await models.Documents.getLeaseViolationImage(parseInt(data.leaseViolationID));
        for(const docLV of docLeaseViolation){
            imgsLV += `<br/><img src='./TenantFiles/${data.propertyID}/${data.tenantID}/LeaseViolation/${data.leaseViolationID}/${docLV.DocumentName}' width='250px' height='250px'>`;
        }
        const leaseViolation = await models.LeaseViolations.getByID(parseInt(data.leaseViolationID));
        if(leaseViolation !== null){
           content = content.replace(new RegExp('#violation#', 'g'), `${leaseViolation.LeaseViolationType} <br /> <br /> ${leaseViolation.LeaseViolationDescription}`);
           content = content.replace(new RegExp('#currentDate#', 'g'), moment(leaseViolation.SubmitDate).format("MM/DD/YYYY"));
        }
        curDateViolation = true;
    }
    content = content.replace(new RegExp('#addLeaseViolationImage#', 'g'), imgsLV);

    const tenantSignedForm = await models.SignedForms.getByFormTenant({
        formID: data.formsCreatorID,
        tenantID: data.tenantID
    });
    let tenantSRC = '#tenantSignature#';
    let tenantSignDate = '#tenantSignatureDate#';
    if(tenantSignedForm !== null && tenantSignedForm.Signature !== '') 
        tenantSRC = `<img height="60" width="60" src="data:image/svg+xml;base64,${tenantSignedForm.Signature}">`;
    if(tenantSignedForm !== null && tenantSignedForm.Date !== '') 
        tenantSignDate = moment(tenantSignedForm.Date).format("MM/DD/YYYY");
    content = content.replace(new RegExp('#tenantSignature#', 'g'), tenantSRC);
    content = content.replace(new RegExp('#tenantSignatureDate#', 'g'), tenantSignDate);

    content = content.replace(new RegExp('#currentDatePlus3Days#', 'g'), moment().add(3, 'days').format("MM/DD/YYYY"));
    content = content.replace(new RegExp('#currentDay#', 'g'), moment().format('DD'));
    content = content.replace(new RegExp('#currentWeekDay#', 'g'), moment().format('dddd'));
    content = content.replace(new RegExp('#userSignatureDate#', 'g'), moment().format("MM/DD/YYYY"));
    content = content.replace(new RegExp('#pageBreak#', 'g'), '<p style="page-break-after: always">');

    // 3 day notice data
    if(data.threeDayNoticeID !== null) {
        const threeDayNotice = await models.ThreeDayNotice.getByID(parseInt(data.threeDayNoticeID));
        content = content.replace(new RegExp('#currentDate3Days#', 'g'), moment(threeDayNotice.SubmitDate).add(3, "days").format("DD"));
        content = content.replace(new RegExp('#currentMonth#', 'g'), moment(threeDayNotice.SubmitDate).format('MMMM'));
        content = content.replace(new RegExp('#currentYear#', 'g'), moment(threeDayNotice.SubmitDate).format('YYYY'));
        content = content.replace(new RegExp('#TenantOwes#', 'g'), `$${parseFloat(threeDayNotice.BalanceOwed).toFixed(2)}`);
        if(!curDateViolation)
            content = content.replace(new RegExp('#currentDate#', 'g'), moment(threeDayNotice.SubmitDate).format("MM/DD/YYYY"));
    } else {
        content = content.replace(new RegExp('#currentDate3Days#', 'g'), moment().add(3, "days").format("DD"));
        content = content.replace(new RegExp('#currentMonth#', 'g'), moment().format('MMMM'));
        content = content.replace(new RegExp('#currentYear#', 'g'), moment().format('YYYY'));
        const balance = await models.TenantTransactions.getTenantBalance(data.tenantID);
        content = content.replace(new RegExp('#TenantOwes#', 'g'), `$${parseFloat(balance).toFixed(2)}`);
        if(!curDateViolation)
            content = content.replace(new RegExp('#currentDate#', 'g'), moment().format("MM/DD/YYYY"));
    }
    return content;
}

exports.getForm = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        let response = "";
        const formsPrintable = await models.FormsPrintable.getForm({
            formsCreatorID: data.formsCreatorID,
            propertyID: data.propertyID,
            formName: data.formName
        });
        for(const fp of formsPrintable) {
            response += fp.Form;
        }

        // replace custom variables
        response = await replaceCustomVariables(data, response);
        return res.json(response);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Printable Controller - getForm"
        );
        return res.json("");
    }  
}

exports.sendDocTenantSignature = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        let formName = "";
        const formsCreator = await models.FormsCreator.getbyID(parseInt(data.formsCreatorID));
        if(formsCreator !== 0)  formName = formsCreator.FormName;

        // Save temporary signed form
        const tempSignFormID = await models.TempSignForm.add({
            formsCreatorID: parseInt(data.formsCreatorID),
            tenantID: parseInt(data.tenantID),
            form: data.form,
            formName
        });

        const enc = new Encrypt();
        const encryptedTempSignID = enc.encrypt(tempSignFormID.toString());
        const encryptedTenantID = enc.encrypt(data.tenantID.toString());
        const linkURL = `https://myirent.com/rent/formSignature.cfm?id=${encryptedTempSignID}&tID=${encryptedTenantID}`;

        const tenant = await models.Tenants.get(parseInt(data.tenantID));
        if(tenant !== null && tenant.TenantEmail !== '') {
            const property = await models.Properties.getByID(parseInt(tenant.PropertyID));

            let emailBody = `<b>Dear ${tenant.TenantFName} ${tenant.TenantLName},</b><br><br>`;
            emailBody += `Please click on this <a href='${linkURL}'>link</a> to sign the form: ${formName}`;
            const tenantSendEmail = new Email();
            const tenantTransporter = tenantSendEmail.getTransporter();
            await tenantTransporter.sendMail({
                from: property.PropertyEmail, 
                to: tenant.TenantEmail, 
                subject: `Form: ${formName}`,
                html: emailBody
            });

            // notify property manager
            if(parseInt(property.AlertPMDocSent) === 1) {
                const propContact = await models.Properties.getListPmAdminContact(parseInt(tenant.PropertyID));
                for(const pc of propContact) {
                    emailBody = `<br/><b>Property:</b> ${property.PropertyName}<br/><b>Tenant:</b>${tenant.TenantFName} ${tenant.TenantLName}</br>`;
                    emailBody += `<b>Document</b> ${formName}`
                    const pmSendEmail = new Email();
                    const pmSendTransporter = pmSendEmail.getTransporter();
                    await pmSendTransporter.sendMail({
                        from: "support@myirent.com", 
                        to: pc.email, 
                        subject: "Document sent to tenant for signature",
                        html: emailBody
                    });
                }
            }

            // others on Lease?
            const othersOnLease = await models.TenantOthersOnLease.getListByTenantID(parseInt(data.tenantID));
            for(const ol of othersOnLease) {
                const encryptedOthersID = enc.encrypt(ol.TenantsOthersOnLeaseID.toString());
                const linkUrlOthers = `https://myirent.com/rent/formSignature.cfm?id=${encryptedTempSignID}&tID=${encryptedOthersID}&OOL=1`;
                if(ol.eMail !== '') {
                    emailBody = `<b>Dear ${ol.FirstName} ${ol.LastName},</b><br><br>`;
                    emailBody += `Please click on this <a href='${linkUrlOthers}'>link</a> to sign the form: ${formName}`;
                    const otherSendEmail = new Email();
                    const othersSendTransporter = otherSendEmail.getTransporter();
                    await othersSendTransporter.sendMail({
                        from: property.PropertyEmail, 
                        to: ol.eMail, 
                        subject: `Form: ${formName}`,
                        html: emailBody
                    });
                }
            }
            return res.json(0);
        } 
        return res.json("Tenant does not have an email. Please update tenant email.");
    } catch(err) {
            console.log(err)
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Printable Controller - sendDocTenantSignature"
        );
        console.log(err);
        return res.json("Error processing your request. Please, contact us.");
    }  
}

exports.saveThreeDayNotice = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        const tenantBalance = await models.TenantTransactions.getTenantBalance(data.tenantID);
        await models.ThreeDayNotice.add({
            userID: data.userID,
            tenantID: data.tenantID,
            balance: parseFloat(tenantBalance).toFixed(2)
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Printable Controller - saveThreeDayNotice"
        );
        console.log(err);
        return res.json(-1);
    }  
}

exports.getLeaseViolationTypes = async (req, res, next) => {
    try {
        return res.json(await models.LeaseViolationTypes.getAll());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Printable Controller - getLeaseViolationTypes"
        );
        console.log(err);
        return res.json(-1);
    }  
}

exports.addLeaseViolationComment = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        await models.LeaseViolations.add({
            leaseViolationTypeID: data.leaseViolationTypeID,
            leaseViolationDescription: data.leaseViolationDescription,
            tenantID: data.tenantID,
            userID: data.userID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Printable Controller - addLeaseViolationComment"
        );
        console.log(err);
        return res.json(-1);
    }  
}