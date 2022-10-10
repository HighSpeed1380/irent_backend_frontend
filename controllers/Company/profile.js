const Email = require('../../util/email');
const models = require('../../models/importAll');
const moment = require('moment');

exports.getCompanyDetails = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        let companyDetails = {
            details: null,
            settings: null,
            billing: null
        };
        let company = await models.Company.get(companyID);
        let bank = await models.CustomerBank.getByCompany(companyID);
        if(Object.keys(bank).length === 0)  bank = null;
        let creditcard = await models.CustomerCC.getByCompany(companyID);
        if(Object.keys(creditcard).length === 0)  creditcard = null;
        if(company !== null) {
            // details
            companyDetails.details = {
                companyName: company.CompanyName,
                firstName: company.ContactFName,
                lastName: company.ContactLName,
                phone: company.ContactPhone,
                email: company.ContactEmail,
                currency: company.CurrencyID
            };
            // settings
            companyDetails.settings = {
                payCCFee: parseInt(company.CompanyPayCCFee) === 1 ? true : false,
                payACHFee: parseInt(company.CompanyPayACHFee) === 1 ? true : false,
                showAllPropertiesTenantPortal: parseInt(company.AllPropertiesTenantPortal) === 1 ? true : false,
                allowUnderEvictionPayRent: parseInt(company.AllowEvictionTenantPayOnline) === 1 ? true : false,
                turnOffNotificationOnlinePayment: parseInt(company.TurnOffOnlinePaymentsNotification) === 1 ? true : false,
                turnOffNotificationUpdTransaction: parseInt(company.TurnOffUpdatedTransactionNotification) === 1 ? true : false,
                showAllPropsTenantTab: parseInt(company.showAllPropertiesTenants) === 1 ? true : false,
                turnOffNotificationSendCollection: parseInt(company.TurnOffSendToCollection) === 1 ? true : false
            };
            // billing
            companyDetails.billing = {
                chagerByACH: parseInt(company.ChargeByACH) === 1 ? true : false,
                accountName: bank === null ? '' : bank.AccountHolderName,
                accountNumber: bank === null ? '' : bank.AccountNumber,
                accountRouting: bank === null ? '' : bank.RoutingNumber,
                bankVerified: bank === null ? false : bank.Verified.lastIndexOf(1) !== -1 ? true : false,
                nameOnCard: creditcard === null ? '' : creditcard.NameOnCard,
                cardNumber: creditcard === null ? '' : creditcard.CreditCard,
                expirationMonth: creditcard === null ? '' : creditcard.ExpirationMonth,
                expirationYear: creditcard === null ? '' : creditcard.ExpirationYear,
                ccv: creditcard === null ? '' : creditcard.CCV
            };
        }
        return res.json(companyDetails)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - getCompanyDetails"
        );
        return res.json(null);
    }  
}

exports.getCurrencies = async (req, res, next) => {
    try {
        return res.json(await models.Currencies.getAll())
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - getCurrencies"
        );
        return res.json([]);
    }
}

exports.updateSettings = async (req, res, next) => {
    try {
        const data = req.body || req.body.data
            
        const company = await models.Company.get(data.companyID);
        return res.json(await models.Company.updSettings({
            companyPayCCFee: data.companyPayCCFee,
            companyPayACHFee: data.companyPayACHFee,
            allPropertiesTenantPortal: data.allPropertiesTenantPortal,
            allowEvictionTenantPayOnline: data.allowEvictionTenantPayOnline,
            turnOffOnlinePaymentsNotification: data.turnOffOnlinePaymentsNotification,
            turnOffUpdatedTransactionNotification: data.turnOffUpdatedTransactionNotification,
            showAllPropertiesTenants: data.showAllPropertiesTenants,
            turnOffSendToCollectioin: data.turnOffSendToCollectioin,
            currencyID: parseInt(company.CurrencyID),
            companyID: data.companyID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - updateSettings"
        );
        return res.json(-1);
    }
}

exports.updateDetails = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.Company.updDetails({
            companyName: data.companyName,
            contactFName: data.contactFName,
            contactLName: data.contactLName,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            companyID: data.companyID
        });   
        await models.Company.updCurrency({
            currencyID: data.currencyID,
            companyID: data.companyID
        });   
        return res.json(0);  
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - updateDetails"
        );
        return res.json(-1);
    }
}

exports.getExistingExpenseTypes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await models.ExpenseType.getListByCompanyID(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - getExistingExpenseTypes"
        );
        return res.json([]);
    }
}

exports.getAccountTypes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await models.AccountType.getByCompany(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - getAccountTypes"
        );
        return res.json([]);
    }
}

exports.addExpenseType = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.ExpenseType.add({
            expenseType: data.expenseType,
            accountTypeID: data.accountTypeID,
            companyID: data.companyID
        });
        return res.json(0);  
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - addExpenseType"
        );
        return res.json(-1);
    }
}

exports.deleteExpenseType = async (req, res, next) => {
    try {
        const expenseTypeID = req.params.etID;
        await models.ExpenseType.delete(expenseTypeID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - deleteExpenseType"
        );
        return res.json(-1);
    }
}

exports.mergeExpenseTypes = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;

        await models.CheckRegister.mergeExpenseTypes({
            expType1: data.expType1,
            expType2: data.expType2,
            companyID: data.companyID
        });
        await models.ExpenseType.deactivate(data.expType1)
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company->Profile Controller - mergeExpenseTypes"
        );
        return res.json(-1);
    }
}