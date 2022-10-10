const Email = require('../../util/email');

const PropertiesModel = require('../../models/properties');
const RecurringChargesTaxModel = require('../../models/recurringChargesTax');
const PropertiesExcludeModel = require('../../models/propertiesExclude');

const Property = new PropertiesModel();
const RecurringChargesTax = new RecurringChargesTaxModel();
const PropertiesExclude = new PropertiesExcludeModel();

exports.getProperty = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Property.getByID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getProperty"
        );
        return res.json([]);
    }  
}

exports.updateProperty = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updateProperty(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateProperty"
        );
        return res.json(-1);
    } 
}

exports.getProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.get(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getProperties"
        );
        return res.json([]);
    }  
}

exports.addProperty = async (req, res, next) => {
    try {
        const data = req.body.data;
        
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - addProperty"
        );
        return res.json([]);
    }  
}

exports.getRecurringTaxes = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await RecurringChargesTax.getByPropertyID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getRecurringTaxes"
        );
        return res.json([]);
    }  
}

exports.insertRecurringChargesTax = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await RecurringChargesTax.insertRecurringChargesTax(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - insertRecurringChargesTax"
        );
        return res.json(-1);
    } 
}

exports.updateRecurringChargesTax = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
       await RecurringChargesTax.updateRecurringChargesTax(data);
       return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateRecurringChargesTax"
        );
        return res.json(-1);
    } 
}

exports.getOfficeHours = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Property.getOfficeHours(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getOfficeHours"
        );
        return res.json([]);
    }  
}

exports.getPropertyOfficeHours = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Property.getPropertyOfficeHours(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getOfficeHours"
        );
        return res.json([]);
    }  
}

exports.insertPropertyOfficeHours = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.insertPropertyOfficeHours(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - insertPropertyOfficeHours"
        );
        return res.json(-1);
    } 
}

exports.updatePropertyOfficeHours = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
       await Property.updatePropertyOfficeHours(data);
       return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyOfficeHours"
        );
        return res.json(-1);
    } 
}

exports.getAutoBill = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await PropertiesExclude.getByID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getAutoBill"
        );
        return res.json([]);
    }  
}


exports.insertAutoBill = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await PropertiesExclude.insertAutoBill(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - insertAutoBill"
        );
        return res.json(-1);
    } 
}

exports.updateAutoBill = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await PropertiesExclude.updateAutoBill(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateAutoBill"
        );
        return res.json(-1);
    } 
}


exports.insertAutoBillNotify = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await PropertiesExclude.insertAutoBillNotify(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - insertAutoBillNotify"
        );
        return res.json(-1);
    } 
}

exports.updateAutoBillNotify = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await PropertiesExclude.updateAutoBillNotify(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateAutoBillNotify"
        );
        return res.json(-1);
    } 
}

exports.getTenantPaymentAmountDueYesAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getTenantPaymentAmountDueYesAllProperties(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getTenantPaymentAmountDueYesAllProperties"
        );
        return res.json([]);
    }  
}

exports.getTenantPaymentAmountDueNoAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getTenantPaymentAmountDueNoAllProperties(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getTenantPaymentAmountDueNoAllProperties"
        );
        return res.json([]);
    }  
}

exports.updatePropertyTenantPayLessThanAmountDue = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyTenantPayLessThanAmountDue(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyTenantPayLessThanAmountDue"
        );
        return res.json(-1);
    } 
}

exports.updateTenantPayLessThanAmountDueAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateTenantPayLessThanAmountDueAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateTenantPayLessThanAmountDueAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getAlertUpcomingLeaseExpirationAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getAlertUpcomingLeaseExpirationAllProperties(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getAlertFlagAllProperties"
        );
        return res.json([]);
    }  
}

exports.updatePropertyAlertUpcomingLeaseExpiration = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyAlertUpcomingLeaseExpiration(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyAlertUpcomingLeaseExpiration"
        );
        return res.json(-1);
    } 
}

exports.updateAlertUpcomingLeaseExpirationAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateAlertUpcomingLeaseExpirationAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateAlertUpcomingLeaseExpirationAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getAbsorbApplicationFee = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getAbsorbApplicationFee(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getAbsorbApplicationFee"
        );
        return res.json([]);
    }  
}

exports.updatePropertyAbsorbApplicationFee = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyAbsorbApplicationFee(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyAbsorbApplicationFee"
        );
        return res.json(-1);
    } 
}

exports.updateAbsorbApplicationFeeAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateAbsorbApplicationFeeAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateAbsorbApplicationFeeAllProperties"
        );
        return res.json(-1);
    } 
}


exports.getNotifyWorkOrderChanges = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getNotifyWorkOrderChanges(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getNotifyWorkOrderChanges"
        );
        return res.json([]);
    }  
}

exports.updatePropertyNotifyWorkOrderChanges = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyNotifyWorkOrderChanges(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyNotifyWorkOrderChanges"
        );
        return res.json(-1);
    } 
}

exports.updateNotifyWorkOrderChangesAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateNotifyWorkOrderChangesAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateNotifyWorkOrderChangesAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getNotifyWorkOrderChangesPM = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getNotifyWorkOrderChangesPM(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getNotifyWorkOrderChangesPM"
        );
        return res.json([]);
    }  
}

exports.updatePropertyNotifyWorkOrderChangesPM = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyNotifyWorkOrderChangesPM(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyNotifyWorkOrderChangesPM"
        );
        return res.json(-1);
    } 
}

exports.updateNotifyWorkOrderChangesPMAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateNotifyWorkOrderChangesPMAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateNotifyWorkOrderChangesPMAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getCloseOutAllProp = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getCloseOutAllProp(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getCloseOutAllProp"
        );
        return res.json([]);
    }  
}


exports.updatePropertyCloseOut = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyCloseOut(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyCloseOut"
        );
        return res.json(-1);
    } 
}

exports.updateCloseOutAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateCloseOutAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateCloseOutAllProperties"
        );
        return res.json(-1);
    } 
}

exports.updatePropertyCloseOutCancel = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        await Property.updatePropertyCloseOutCancel(propertyID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyCloseOutCancel"
        );
        return res.json(-1);
    } 
}

exports.updateCloseOutCancelAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        await Property.updateCloseOutCancelAllProperties(companyID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateCloseOutCancelAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getProfitLossReport = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getProfitLossReport(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getProfitLossReport"
        );
        return res.json([]);
    }  
}

exports.updatePropertyProfitLossReport = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyProfitLossReport(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyProfitLossReport"
        );
        return res.json(-1);
    } 
}

exports.updateProfitLossReportAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateProfitLossReportAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateProfitLossReportAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getRequireInsuranceYes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getRequireInsuranceYes(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getRequireInsuranceYes"
        );
        return res.json([]);
    }  
}

exports.getRequireInsuranceNo = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getRequireInsuranceNo(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getRequireInsuranceNo"
        );
        return res.json([]);
    }  
}

exports.updatePropertyRequireRenterInsurance = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyRequireRenterInsurance(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyRequireRenterInsurance"
        );
        return res.json(-1);
    } 
}

exports.updateRequireRenterInsuranceAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateRequireRenterInsuranceAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateRequireRenterInsuranceAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getApplicantsDepositPageYes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getApplicantsDepositPageYes(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getApplicantsDepositPageYes"
        );
        return res.json([]);
    }  
}

exports.getApplicantsDepositPageNo = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getApplicantsDepositPageNo(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getApplicantsDepositPageNo"
        );
        return res.json([]);
    }  
}

exports.updatePropertyApplicantsDepositsPage = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyApplicantsDepositsPage(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyApplicantsDepositsPage"
        );
        return res.json(-1);
    } 
}

exports.updateApplicantsDepositsPageAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateApplicantsDepositsPageAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateApplicantsDepositsPageAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getAlertPMDocSentYes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getAlertPMDocSentYes(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getAlertPMDocSentYes"
        );
        return res.json([]);
    }  
}

exports.getAlertPMDocSentNo = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getAlertPMDocSentNo(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getAlertPMDocSentNo"
        );
        return res.json([]);
    }  
}


exports.updatePropertyAlertPMDocSent = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyAlertPMDocSent(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyAlertPMDocSent"
        );
        return res.json(-1);
    } 
}

exports.updateAlertPMDocSentAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateAlertPMDocSentAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateAlertPMDocSentAllProperties"
        );
        return res.json(-1);
    } 
}

exports.getTenantConsentYes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getTenantConsentYes(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getTenantConsentYes"
        );
        return res.json([]);
    }  
}

exports.getTenantConsentNo = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.getTenantConsentNo(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Properties Controller - getTenantConsentNo"
        );
        return res.json([]);
    }  
}


exports.updatePropertyDisplayTenantConsent = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyDisplayTenantConsent(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyDisplayTenantConsent"
        );
        return res.json(-1);
    } 
}

exports.updateDisplayTenantConsentAllProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        const data = req.body.data || req.body;
        await Property.updateDisplayTenantConsentAllProperties(companyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updateDisplayTenantConsentAllProperties"
        );
        return res.json(-1);
    } 
}

exports.updatePropertyOfficeProperty = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyOfficeProperty(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyOfficeProperty"
        );
        return res.json(-1);
    } 
}

exports.updatePropertyReceivePromiss = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyReceivePromiss(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyReceivePromiss"
        );
        return res.json(-1);
    } 
}

exports.updatePropertyLateFeesPercentage = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertyLateFeesPercentage(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertyLateFeesPercentage"
        );
        return res.json(-1);
    } 
}

exports.updatePropertySeattle = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const data = req.body.data || req.body;
        await Property.updatePropertySeattle(propertyID, data);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updatePropertySeattle"
        );
        return res.json(-1);
    } 
}

