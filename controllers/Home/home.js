const Email = require('../../util/email');

const SnapshotsModel = require('../../models/snapshots');
const TenantTransactionsModel = require('../../models/tenantTransactions');
const PropertiesModel = require('../../models/properties');
const UserModel = require('../../models/users');

const Snapshots = new SnapshotsModel();
const TenantTransactions = new TenantTransactionsModel();
const Properties = new PropertiesModel();
const Users = new UserModel();

const models = require('../../models/importAll');

exports.getVacancySnapshot = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const vacancies = await Snapshots.vacancySnapshot(propertyID);
        return res.json(vacancies);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getVacancySnapshots"
        );
        return res.json([]);
    }   
}

exports.getPLSnapshot = async (req, res, next) => {
    let response = {
        GrossIncome: 0,
        OperatingExpenses: 0,
        NonOperatingExpenses: 0,
        NetIncome: 0,
        GrossPotencialRent: 0,
        LastMonthIncome: 0
    };
    try {
        const propertyID = req.params.pID;
        const data = await Snapshots.plSnapshot(propertyID);
        response = data;
        return res.json(response);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getPLSnapshot"
        );
        return res.json(response);
    }   
}

exports.getActionItems = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Snapshots.getActionItems(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getActionItems"
        );
        return res.json([]);
    }   
}

exports.getWKSnapshot = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Snapshots.getWK(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getWKSnapshot"
        );
        return res.json([]);
    }  
}

exports.getMissingPhoneEmails = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Snapshots.getMissingEmailPhone(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getMissingPhoneEmails"
        );
        return res.json([]);
    }  
}

exports.getConcessionRequests = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Snapshots.getConcessions(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getConcessionRequests"
        );
        return res.json([]);
    }  
}

exports.getAudit = async (req, res, next) => {
    let response = {
        totalNeedAudit: 0,
        data: []
    };
    try {
        const propertyID = req.params.pID;
        const audit = await Snapshots.getAudit(propertyID);
        response.totalNeedAudit = audit.total;
        response.data = audit.data;
        return res.json(response);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getAudit"
        );
        return res.json(response);
    }
}

exports.getSecurityDeposit = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Snapshots.getSecurityDeposit(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getSecurityDeposit"
        );
        return res.json([]);
    }  
}

exports.getMissedPromisePays = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Snapshots.getMissedPromisesPay(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getMissedPromisePays"
        );
        return res.json([]);
    }  
}

exports.getDelinquenciesOver = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const deliquencies = await Snapshots.getDelinquenciesOver(propertyID);
        const threshold = await Properties.getEvictionThreshold(propertyID);
        let data = [];
        let delinquentTenants = 0;
        let totalOverThreshold = 0;
        for(const d of deliquencies) {
            const tDebits = d.TotalDebit === undefined || d.TotalDebit === '' ? 0 : parseFloat(d.TotalDebit)
            const tCredits = d.TotalCredit === undefined || d.TotalCredit === '' ? 0 : parseFloat(d.TotalCredit)
            const hDebits = d.HousingDebit === undefined || d.HousingDebit === '' ? 0 : parseFloat(d.HousingDebit)
            const hCredits = d.HousingCredit === undefined || d.HousingCredit === '' ? 0 : parseFloat(d.HousingCredit)
            
            const tenantBalance = parseFloat(tDebits) - parseFloat(tCredits);
            const housingBalance = parseFloat(hDebits) - parseFloat(hCredits);
            const balance =  tenantBalance + housingBalance;
            if(balance > 0) {
                if(tenantBalance > threshold.Threshold) {
                    delinquentTenants++;
                }
                totalOverThreshold += tenantBalance;   
                data.push({
                    TenantID: d.TenantID,
                    Unit: d.UnitName,
                    Tenant: d.TenantFName + ' ' + d.TenantLName,
                    Balance: balance,
                    TenantBalance: tenantBalance,
                    DelinquencyComments: d.DelinquencyComments,
                    EvictionFiled: d.EvictionFiled,
                    FileEviction: (tenantBalance > threshold.EvictionThreshold ? true : false),
                    EvictionFiledDate: d.EvictionFiledDate
                });
            }
        }
        return res.json({
            Threshold: threshold.Threshold,
            EvictionThreshold: threshold.EvictionThreshold,
            delinquentTenants,
            totalOverThreshold,
            data,
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getDelinquenciesOver"
        );
        return res.json([]);
    }
}

exports.getThisMonthPayments = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await TenantTransactions.getThisMonthByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getThisMonthPayments"
        );
        return res.json([]);
    }
}

exports.getLast6Months = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await TenantTransactions.getLast6Months(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getLast6Months"
        );
        return res.json([]);
    }
}

exports.getUserFullName = async (req, res, next) => {
    try {
        const userID = req.params.uID;
        return res.json(await Users.getFullName(userID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getUserFullName"
        );
        return res.json([]);
    }
}

exports.updateVacantDate = async (req, res, next) => {
    try {
        const data = req.body.data || req.body; 
        await models.Units.updVacantDate({
            vacantDate: data.vacantDate,
            unitID: data.unitID
        });
        res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - uodateVacantDate"
        );
        return res.json(-1);
    }
}

exports.updateUnitNote = async (req, res, next) => {
    try {
        const data = req.body.data || req.body; 
        await models.Units.updComment({
            comment: data.comment,
            unitID: data.unitID
        });
        res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - updateUnitNote"
        );
        return res.json(-1);
    }
}

exports.getActionItem = async (req, res, next) => {
    try {
        const actionItemID = req.params.aiID;
        return res.json(await models.ActionItems.getByID(actionItemID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getActionItem"
        );
        return res.json(-1);
    }
}

exports.updateActionItem = async (req, res, next) => {
    try {
        const data = req.body.data || req.body; 
        await models.ActionItems.updPMComment({
            comment: data.comment.replace(/'/g, "\\'"),
            id: data.actionItemID
        });
        res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - updateActionItem"
        );
        return res.json(-1);
    }
}

exports.updatePromissToPay = async (req, res, next) => {
    try {
        const data = req.body.data || req.body; 
        await models.PromissToPay.updateSuccess({
            success: data.success,
            promissToPayID: data.promissToPayID
        });
        res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - updatePromissToPay"
        );
        return res.json(-1);
    }
}

exports.getMissedPromisePayDetails = async (req, res, next) => {
    try {
        const promissToPayID = req.params.ppID;
        return res.json(await models.PromissToPay.getByID(promissToPayID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getMissedPromisePayDetails"
        );
        return res.json(null);
    }  
}

exports.updPromissToPayDetails = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        await models.PromissToPay.update({
            submitDate: data.submitDate,
            promissDate: data.promissDate,
            success: data.success,
            promiss: data.promiss.replace(/'/g, "\\'"),
            staffComment: data.staffComment.replace(/'/g, "\\'"),
            promissToPayID: data.promissToPayID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - updPromissToPayDetails"
        );
        return res.json(-1);
    }    
}

exports.getNotifications = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        
        const openWK = await models.WorkOrders.getOpens(propertyID);
        const vacantUnits = await models.Units.getVacantByProperty(propertyID);
        const output = [];
        output.push({ name: "Total Vacant Units", value: vacantUnits.length });
        output.push({ name: "Total Open Work Orders", value: openWK.length });
        return res.json(output);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Home Controller - getNotifications"
        );
        return res.json([]);
    }  
}