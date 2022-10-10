const db = require('../util/database');

module.exports = class Properties {

    async getByID(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Properties Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async get(cID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM Properties Where CompanyID = ${cID} AND Active <> 2
                Order By PropertyName
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getEvictionThreshold(pID) {
        let response = {
            Threshold: 0,
            EvictionThreshold: 0
        };
        try {
            const res = await db.execute(`
                SELECT Threshold, EvictionThreshold 
                FROM Properties 
                Where PropertyID = ${pID}
            `);
            if(res[0].length > 0) {
                response.Threshold = parseFloat(res[0][0].Threshold);
                response.EvictionThreshold = parseFloat(res[0][0].EvictionThreshold);
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPmAdminContact(pID) {
        let response = {
            fName: null,
            lName: null,
            email: null,
            phone: null
        };
        try {
            let res = await db.execute(`
                select u.UserFName, u.UserLName, u.UserEmail, u.UserPhone
                From Users u
                JOIN UserPropertyMap upm ON u.UserID = upm.UserID
                where upm.propertyid = ${pID}
                and u.active = 1
                and u.securitylevelid = 2
            `);
            if(res[0].length > 0) {
                response.fName = res[0][0].UserFName;
                response.lName = res[0][0].UserLName;
                response.email = res[0][0].UserEmail;
                response.phone = res[0][0].UserPhone;
            } else {
                res = await db.execute(`
                    select u.UserFName, u.UserLName, u.UserEmail, u.UserPhone
                    From Users u
                    JOIN UserPropertyMap upm ON u.UserID = upm.UserID
                    where upm.propertyid = ${pID}
                    and u.active = 1
                    and u.securitylevelid = 1
                `);
                response.fName = res[0][0].UserFName;
                response.lName = res[0][0].UserLName;
                response.email = res[0][0].UserEmail;
                response.phone = res[0][0].UserPhone;
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getListPmAdminContact(pID) {
        let response = [];
        try {
            let res = await db.execute(`
                select u.UserFName, u.UserLName, u.UserEmail, u.UserPhone
                From Users u
                JOIN UserPropertyMap upm ON u.UserID = upm.UserID
                where upm.propertyid = ${pID}
                and u.active = 1
                and u.securitylevelid = 2
            `);
            if(res[0].length > 0) {
                for(const r of res[0]) {
                    response.push({
                        fName: r.UserFName,
                        lName: r.UserLName,
                        email: r.UserEmail,
                        phone: r.UserPhone
                    });
                }
            } else {
                res = await db.execute(`
                    select u.UserFName, u.UserLName, u.UserEmail, u.UserPhone
                    From Users u
                    JOIN UserPropertyMap upm ON u.UserID = upm.UserID
                    where upm.propertyid = ${pID}
                    and u.active = 1
                    and u.securitylevelid = 1
                `);
                for(const r of res[0]) {
                    response.push({
                        fName: r.UserFName,
                        lName: r.UserLName,
                        email: r.UserEmail,
                        phone: r.UserPhone
                    });
                }
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getAllPropsFromPropID(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT * FROM Properties 
                Where CompanyID in (
                    Select CompanyID From Properties Where PropertyID = ${pID} and active = 0
                )
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getUsersProperties(uID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select p.PropertyID, p.PropertyName
                From Properties p 
                JOIN UserPropertyMap upm ON p.PropertyID = upm.PropertyID
                Where upm.UserID = ${uID} and p.Active != 2
                Order By p.PropertyName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getOwnersProperties(oID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select p.PropertyID, p.PropertyName
                From Properties p 
                JOIN OwnerPropertyMap opm ON p.PropertyID = opm.PropertyID
                Where opm.OwnerID = ${oID} and p.Active != 2
                Order By p.PropertyName
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getCompanyPropDetailsByTenant(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select c.CompanyName, p.PropertyName, p.PropertyAddress1, p.PropertyAddress2,
                    p.PropertyCity, p.PropertyState, p.PropertyZip, p.PropertyPhone
                From Tenants t 
                JOIN Properties p ON p.PropertyID = t.PropertyID
                JOIN Company c ON p.CompanyID = c.CompanyID
                Where t.TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPropNamesByUser(userID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select p.PropertyName, p.PropertyID
                From Properties p
                JOIN UserPropertyMap upm ON upm.PropertyID = p.PropertyID
                WHERE p.Active != 2 AND upm.UserID = ${userID}
                Order By p.PropertyName
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getOfficeHours(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Property_OfficeHours Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPropertyOfficeHours(pID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT PropertyOfficeHoursID FROM Property_OfficeHours Where PropertyID = ${pID}
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async insertPropertyOfficeHours(propertyID, data) {
        // try {
            await db.execute(`
                INSERT INTO Property_OfficeHours (
                    MondayFridayOpenTime, 
                    MondayFridayCloseTime,
		            SaturdayOpenTime, 
                    SaturdayCloseTime, 
                    SundayOpenTime, 
                    SundayCloseTime, 
                    PropertyID
                )
                VALUES ( 
                    ${data.MondayFridayOpenTime},
                    ${data.MondayFridayCloseTime},
                    ${data.SaturdayOpenTime},
                    ${data.SaturdayCloseTime},
                    ${data.SundayOpenTime},
                    ${data.SundayCloseTime},
                    ${propertyID}
                )
            `);
        // } catch(err) {
        //     console.log(err);
        //     return { error: true }
        // }
    }

    async updatePropertyOfficeHours(data) {
        // try {
            await db.execute(`
                UPDATE Property_OfficeHours
                SET 
                    MondayFridayOpenTime = ${data.MondayFridayOpenTime},
                    MondayFridayCloseTime = ${data.MondayFridayCloseTime},
                    SaturdayOpenTime = ${data.SaturdayOpenTime},
                    SaturdayCloseTime = ${data.SaturdayCloseTime},
                    SundayOpenTime = ${data.SundayOpenTime},
                    SundayCloseTime = ${data.SundayCloseTime}
                WHERE 
                    PropertyOfficeHoursID = ${data.PropertyOfficeHoursID}
            `);
        // } catch(err) {
        //     console.log(err);
        //     return {
        //         error: true,
        //         msg: err
        //     }
        // }
    }

    async updateProperty(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                LateFee = '${data.LateFee}',
                DailyLateFee = '${data.DailyLateFee}',
                LateFeeApplied = '${data.LateFeeApplied}',
                MaxLateFee = '${data.MaxLateFee}',
                MinBalance = '${data.MinBalance}',
                Threshold = '${data.Threshold}',
                BankFee = '${data.BankFee}',
                SecurityDeposit = '${data.SecurityDeposit}',
                NRSecurityDeposit = '${data.NRSecurityDeposit}',
                EvictionFee = '${data.EvictionFee}',
                PetFine = '${data.PetFine}',
                DailyPetFine = '${data.DailyPetFine}',
                ApplicationFee = '${data.ApplicationFee}',
                MonthToMonthFee = '${data.MonthToMonthFee}',
                EvictionThreshold = '${data.EvictionThreshold}',
                SMSThreshold = '${data.SMSThreshold}',
                LaborRate = '${data.LaborRate}',
                ThreeDayNoticeTAmount = '${data.ThreeDayNoticeTAmount}',
                PropertyWebsite = '${data.PropertyWebsite}',
                PropertyLongDescription = '${data.PropertyLongDescription}',
                RentalCriteria = '${data.PropertyRentalCriteria}',
                CheckID = '${data.CheckID}',
                PropertyOfficeHoursID = '${data.PropertyOfficeHoursID}',
                Gas = '${data.Gas}',
                Electricity = '${data.Electric}',
                Water = '${data.Water}',
                Trash = '${data.Trash}',
                TV = '${data.TV}',
                Internet = '${data.Internet}'              
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async getTenantPaymentAmountDueYesAllProperties(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND AllowTenantsPayLessThanAmountDue = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTenantPaymentAmountDueNoAllProperties(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND AllowTenantsPayLessThanAmountDue = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyTenantPayLessThanAmountDue(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                AllowTenantsPayLessThanAmountDue = '${data.AllowTenantsPayLessThanAmountDue}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateTenantPayLessThanAmountDueAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                AllowTenantsPayLessThanAmountDue = '${data.AllowTenantsPayLessThanAmountDue}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }


    async getAlertUpcomingLeaseExpirationAllProperties(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND AlertUpcomingLeaseExpiration = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyAlertUpcomingLeaseExpiration(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                AlertUpcomingLeaseExpiration = '${data.AlertUpcomingLeaseExpiration}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateAlertUpcomingLeaseExpirationAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                AlertUpcomingLeaseExpiration = '${data.AlertUpcomingLeaseExpiration}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }
    

    async getAbsorbApplicationFee(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND AbsorbApplicationFee = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyAbsorbApplicationFee(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                AbsorbApplicationFee = '${data.AbsorbApplicationFee}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateAbsorbApplicationFeeAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                AbsorbApplicationFee = '${data.AbsorbApplicationFee}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }    

    async getNotifyWorkOrderChanges(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND NotifyWorkOrderChanges = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyNotifyWorkOrderChanges(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                NotifyWorkOrderChanges = '${data.NotifyWorkOrderChanges}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateNotifyWorkOrderChangesAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                NotifyWorkOrderChanges = '${data.NotifyWorkOrderChanges}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }

    async getNotifyWorkOrderChangesPM(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND notifyWorkOrderChangesPM = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyNotifyWorkOrderChangesPM(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                notifyWorkOrderChangesPM = '${data.notifyWorkOrderChangesPM}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateNotifyWorkOrderChangesPMAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                notifyWorkOrderChangesPM = '${data.notifyWorkOrderChangesPM}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }        

    async getCloseOutAllProp(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND CloseOut is null
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyCloseOut(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                CloseOut = '${data.CloseOut}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateCloseOutAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                CloseOut = '${data.CloseOut}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }

    async updatePropertyCloseOutCancel(pID) {
        await db.execute(`
            UPDATE Properties
            SET 
                CloseOut = null
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateCloseOutCancelAllProperties(cID) {
        await db.execute(`
            UPDATE Properties
            SET 
                CloseOut = null
            WHERE 
                CompanyID = '${cID}'
        `);
    }    

    async getProfitLossReport(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND ProfitLossReport = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyProfitLossReport(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                ProfitLossReport = '${data.ProfitLossReport}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateProfitLossReportAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                ProfitLossReport = '${data.ProfitLossReport}'
            WHERE 
                CompanyID = '${cID}'
        `);
    } 

    async getRequireInsuranceYes(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND RequireRenterInsurance = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getRequireInsuranceNo(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND RequireRenterInsurance = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyRequireRenterInsurance(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                RequireRenterInsurance = '${data.RequireRenterInsurance}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateRequireRenterInsuranceAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                RequireRenterInsurance = '${data.RequireRenterInsurance}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }       

    async getApplicantsDepositPageYes(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND ApplicantsDepositsPage = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getApplicantsDepositPageNo(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND ApplicantsDepositsPage = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyApplicantsDepositsPage(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                ApplicantsDepositsPage = '${data.ApplicantsDepositsPage}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateApplicantsDepositsPageAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                ApplicantsDepositsPage = '${data.ApplicantsDepositsPage}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }       

    async getAlertPMDocSentYes(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND AlertPMDocSent = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getAlertPMDocSentNo(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND AlertPMDocSent = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTenantConsentYes(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND DisplayTenantConsent = 1
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTenantConsentNo(cID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT 1 FROM Properties WHERE CompanyID = ${cID} AND DisplayTenantConsent = 0
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async updatePropertyDisplayTenantConsent(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                DisplayTenantConsent = '${data.DisplayTenantConsent}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updateDisplayTenantConsentAllProperties(cID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                DisplayTenantConsent = '${data.DisplayTenantConsent}'
            WHERE 
                CompanyID = '${cID}'
        `);
    }
    
    async updatePropertyOfficeProperty(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                OfficeProperty = '${data.OfficeProperty}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updatePropertyReceivePromiss(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                receivePromissToPayNotification = '${data.receivePromissToPayNotification}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updatePropertyLateFeesPercentage(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                LateFeesPercentage = '${data.LateFeesPercentage}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }

    async updatePropertySeattle(pID, data) {
        await db.execute(`
            UPDATE Properties
            SET 
                Seattle = '${data.Seattle}'
            WHERE 
                PropertyID = '${pID}'
        `);
    }
}