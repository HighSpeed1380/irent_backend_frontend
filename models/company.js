const db = require('../util/database');

module.exports = class Company {

    async get(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Company Where CompanyID = ${cID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getLeadSource(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT LeadSourceCompanyID FROM Company Where CompanyID = ${cID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updDetails(data) {
        try {
            await db.execute(`
                UPDATE Company
                set CompanyName = '${data.companyName}',
                    ContactFName = '${data.contactFName}',
                    ContactLName = '${data.contactLName}',
                    ContactPhone = '${data.contactPhone}',
                    ContactEmail = '${data.contactEmail}'
                Where CompanyID = ${data.companyID}
            `);
        } catch(err) {
            console.log(err);
            return -1;
        }
        return 0;
    }

    async updSettings(data) {
        try {
            await db.execute(`
                UPDATE Company
                set CompanyPayCCFee = ${data.companyPayCCFee},
                    CompanyPayACHFee = ${data.companyPayACHFee},
                    AllPropertiesTenantPortal = ${data.allPropertiesTenantPortal},
                    AllowEvictionTenantPayOnline = ${data.allowEvictionTenantPayOnline},
                    TurnOffOnlinePaymentsNotification = ${data.turnOffOnlinePaymentsNotification},
                    TurnOffUpdatedTransactionNotification = ${data.turnOffUpdatedTransactionNotification},
                    showAllPropertiesTenants = ${data.showAllPropertiesTenants},
                    TurnOffSendToCollection = ${data.turnOffSendToCollectioin},
                    CurrencyID = ${data.currencyID}
                Where CompanyID = ${data.companyID}
            `);
        } catch(err) {
            console.log(err);
            return -1;
        }
        return 0;
    }
    
    async updatePaymentMethod(data) {
        try {
            await db.execute(`
                UPDATE Company
                set ChargeByACH = ${data.paymentMethod}
                Where CompanyID = ${data.companyID}
            `);

            return 0;
        } catch(err) {
            console.log(err);
            return -1;
        }
    }

    async updCurrency(data) {
        try {
            await db.execute(`
                UPDATE Company
                set CurrencyID = ${data.currencyID}
                Where CompanyID = ${data.companyID}
            `);
        } catch(err) {
            console.log(err);
            return -1;
        }
        return 0;
    }
}