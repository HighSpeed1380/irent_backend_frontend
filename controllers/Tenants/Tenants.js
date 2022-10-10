const urlExists = require('url-exists');
const ESAPI = require('node-esapi');
const util = require('util');
const ftp = require("basic-ftp");
const validateEmail = require("email-validator");
const moment = require('moment');

const Email = require('../../util/email');
const Encrypt = require('../../util/encrypt');

const models = require('../../models/importAll');

exports.getTenants = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        let showAllProps = 0;
        const company = await models.Company.get(data.companyID);
        if(company !== null && company.ShowAllPropertiesTenants !== undefined) {
            showAllProps = company.ShowAllPropertiesTenants === null ? 0 : parseInt(company.ShowAllPropertiesTenants);
        }
        return res.json(await models.Tenants.getListTenants({
            multiprop: data.multiprop,
            userID: data.userID,
            propertyID: data.propertyID,
            showAllPropertiesTenants: showAllProps
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenants"
        );
        return res.json([]);
    }  
}

exports.getTenantBalance = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.TenantTransactions.getTenantBalance(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenantBalance"
        );
        return res.json([]);
    }  
}

exports.getRefundableDeposit = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.TenantTransactions.getTenantRefundableDeposit(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getRefundableDeposit"
        );
        return res.json([]);
    }  
}

exports.getMoveOutReasons = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
            
        return res.json(await models.MoveOutReasons.getByCompany(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getMoveOutReasons"
        );
        return res.json([]);
    }  
}

exports.moveOut = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        await models.Units.moveOut(data.moveOutDate, data.unitID);
        await models.Tenants.moveOut({
            moveOutDate: data.moveOutDate,
            whiteList: data.whiteList,
            tenantID: data.tenantID
        });
        await models.MoveOutSummary.add({
            tenantID: data.tenantID,
            moveOutReasonID: data.moveOutReasonID
        });
        await models.WhiteList.add({
            propertyID: data.propertyID,
            userID: data.userID,
            tenantID: data.tenantID,
            tenantEmail: data.tenantEmail,
            tenantPhone: data.tenantPhone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            whitelist: data.whiteList,
            collections: data.collections,
            rentAgain: data.rentAgain,
            comment: data.comment
        });
        if(data.secDepositRefund) {
            await models.SecurityDepositRefund.add({
                tenantID: data.tenantID,
                refundAmount: parseFloat(data.refundAmount).toFixed(2),
                userID: data.userID,
                propertyID: data.propertyID
            });
            await models.CheckRegister.add({
                propertyID: data.propertyID,
                vendorID: 545,
                amount: parseFloat(data.refundAmount).toFixed(2),
                memo: `${data.tenantFName} ${data.tenantLName}`,
                expenseTypeID: 29,
                escrow: 0,
                invoiceDate: new Date(),
                invoiceNumber: `${data.address} ${data.city} ${data.state} ${data.zip}`,
                userID: data.userID,
                unitID: 0
            });
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - moveOut"
        );
        return res.json(-1);
    }  
}

exports.updEviction = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        await models.Tenants.updEviction({
            eviction: data.eviction,
            tenantID: data.tenantID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updEviction"
        );
        return res.json([]);
    }  
}

exports.getTenant = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.Tenants.get(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenant"
        );
        return res.json([]);
    }  
}

exports.getTenantUnit = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.Units.getByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenantUnit"
        );
        return res.json([]);
    }  
}

exports.getOthersOnLease = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.TenantOthersOnLease.getListByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getOthersOnLease"
        );
        return res.json([]);
    }  
}

exports.getLeadSource = async (req, res, next) => {
    try {
        const leadSourceID = req.params.lsID;
            
        return res.json(await models.LeadSource.get(leadSourceID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getLeadSource"
        );
        return res.json([]);
    }  
}

exports.getLeaseAgent = async (req, res, next) => {
    try {
        const userID = req.params.uID;
            
        return res.json(await models.User.get(userID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getLeaseAgent"
        );
        return res.json([]);
    }  
}

exports.getVehicles = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.TenantVehicles.getByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getVehicles"
        );
        return res.json([]);
    }  
}

exports.getApplication = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        const path = `https://myirent.com/rent/ApplicantsPDF/${data.propertyID}/${data.tenantID}/Application.pdf`;
        urlExists(path, function(err, exists) {
            if(exists)
                return res.json(path);
            else
                return res.json('');
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getApplication"
        );
        return res.json([]);
    }  
}

exports.getCreditReport = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const property = await models.Properties.getByID(data.propertyID);
        let link = [];
        if(parseInt(property.BackgroundScreening) !== 1) {
            const report = await models.TazWorks.getByTenantID(data.tenantID);
            if(report !== null)
                for(const r of report) 
                    link.push({
                        link: `./index.cfm?P=507&tzID=${r.TazWorksID}`,
                        name: 'Credit Report'
                    });
        } else {
            const report = await models.CreditCheckLog.getByTenantID(data.tenantID);
            if(report !== null) {
                link.push({
                    link: `./index.cfm?P=166&TID=${data.tenantID}`,
                    name: 'Credit Report'
                });
                // others on lease
                const others = await models.TazWorks.getOthersOnLease(data.tenantID);
                if(others !== null) {
                    for(const o of others) {
                        link.push({
                            link: `./index.cfm?P=507&tzID=${o.TazWorksID}`,
                            name: `Credit Report - ${o.FirstName} ${o.LastName}`
                        });
                    }
                }
            }
        }
        return res.json(link);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getCreditReport"
        );
        return res.json([]);
    }  
}

exports.getDocuments = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.Documents.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getDocuments"
        );
        return res.json([]);
    }  
}

exports.getForms = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        let output = [];
        const forms = await models.TempSignForm.getTenantDetailsDocs(tenantID);
        for(const f of forms) {
            const enc = new Encrypt();
            const encryptedID = enc.encrypt(f.TempSignFormID.toString());
            output.push({
                link: `https://myirent.com/NodeJS/iRent/forms/getPDF/${encryptedID}/PDF`,
                name: f.FormName,
                dateTime: f.Datetime
            });
        }
        return res.json(output);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getForms"
        );
        return res.json([]);
    }  
}

exports.getListForms = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const company = await models.Company.get(data.companyID);
        let RHAWA = false;
        if(parseInt(data.propertyID) === 993 || parseInt(company.LeadSourceCompanyID) === 337) {
            RHAWA = true;
        }
        return res.json(await models.FormsCreator.getTenantListForm({
            RHAWA,
            propertyID: data.propertyID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getListForms"
        );
        return res.json([]);
    }  
}

exports.get3DayNoticeAmt = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        let amt = 0;
        const prop = await models.Properties.getByID(propertyID);
        amt = prop.ThreeDayNoticeTAmount === '' ? 0 : parseFloat(prop.ThreeDayNoticeTAmount);
        return res.json(amt);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - get3DayNoticeAmt"
        );
        return res.json([]);
    }  
}

exports.getLedger = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        let alllocatedPayments = new Map();
        const ledger = await models.TenantTransactions.getTenantLedger(tenantID);
        for(const l of ledger) {
            const payments = await models.TenantAllocatedPayment.getByTransactionID(parseInt(l.TenantTransactionID));
            alllocatedPayments.set(parseInt(l.TenantTransactionID), payments);
        }
        return res.json({
            ledger,
            alllocatedPayments: Object.fromEntries(alllocatedPayments)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getLedger"
        );
        return res.json([]);
    }  
}

exports.deleteTransaction = async (req, res, next) => {
    try {
        const tenantTransactionID = req.params.ttID;
        
        const tenantTransaction = await models.TenantTransactions.getByID(tenantTransactionID);
        // remove/update Check Register?
        if(tenantTransaction !== null && parseInt(tenantTransaction.TransactionTypeID) === 2) {
            const amount = parseFloat(tenantTransaction.TransactionAmount);
            const checkRegister = await models.CheckRegister.getByID(parseInt(tenantTransaction.CheckRegisterID));
            if(checkRegister !== null) {
                if(amount === parseFloat(checkRegister.Amount)) {
                    // delete
                    await models.CheckRegister.delete(parseInt(tenantTransaction.CheckRegisterID));
                } else {
                    // update
                    await models.CheckRegister.updAmount({
                        amount: parseFloat(checkRegister.Amount) - amount,
                        checkRegisterID: parseInt(tenantTransaction.CheckRegisterID)
                    });
                }
            }
        }
        await models.TenantTransactions.delete(tenantTransactionID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteTransaction"
        );
        return res.json(-1);
    }  
}

exports.getWorkOrders = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await models.WorkOrders.getTenantWK(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getWorkOrders"
        );
        return res.json([]);
    }  
}

exports.deleteWK = async (req, res, next) => {
    try {
        const workOrderID = req.params.wkID;
            
        await models.WorkOrders.delete(workOrderID);
        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteWK"
        );
        return res.json(-1);
    }  
}

exports.getCommentsNotes = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.Notes.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getCommentsNotes"
        );
        return res.json([]);
    }  
}

exports.addCommentNote = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.Notes.add({
            userID: data.userID,
            tenantID: data.tenantID,
            note: data.note
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addCommentNote"
        );
        return res.json(-1);
    }  
}

exports.getPromiss = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.PromissToPay.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getPromiss"
        );
        return res.json([]);
    }  
}

exports.addPromissToPay = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.PromissToPay.add({
            userID: data.userID,
            tenantID: data.tenantID,
            promiss: data.promiss,
            promissDate: data.promissDate
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addPromissToPay"
        );
        return res.json(-1);
    }  
}

exports.editPromissToPay = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.PromissToPay.edit({
            userID: data.userID,
            promiss: data.promiss,
            promissDate: data.promissDate,
            id: data.id
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - editPromissToPay"
        );
        return res.json(-1);
    }  
}

exports.deletePromissToPay = async (req, res, next) => {
    try {
        const promissToPayID = req.params.ppID;
        
        await models.PromissToPay.delete(promissToPayID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deletePromissToPay"
        );
        return res.json(-1);
    }  
}

exports.addOthersOnLease = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.TenantOthersOnLease.add({
            tenantID: data.tenantID,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone ? data.phone.toString().replace(/[^0-9]/g, '') : '',
            email: data.email,
            ssn: data.ssn,
            dob: data.dob,
            userID: data.userID,
            driverslicense: data.driverslicense ? data.driverslicense : '',
            dlState: data.dlState ? data.dlState : ''
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addOthersOnLease"
        );
        return res.json(-1);
    }  
}

exports.updateOthersOnLease = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.TenantOthersOnLease.update({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone ? data.phone.toString().replace(/[^0-9]/g, '') : '',
            email: data.email,
            ssn: data.ssn,
            dob: data.dob,
            userID: data.userID,
            driverslicense: data.driverslicense ? data.driverslicense : '',
            dlState: data.dlState ? data.dlState : '',
            id: data.id
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateOthersOnLease"
        );
        return res.json(-1);
    }  
}

exports.addVehicle = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.TenantVehicles.add({
            tenantID: data.tenantID,
            make: data.make,
            model: data.model,
            year: data.year,
            color: data.color,
            licensePlate: data.licensePlate,
            parkingSpace: data.parkingSpace ? data.parkingSpace : ''
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addVehicle"
        );
        return res.json(-1);
    }  
}

exports.editVehicle = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.TenantVehicles.edit({
            make: data.make,
            model: data.model,
            year: data.year,
            color: data.color,
            licensePlate: data.licensePlate,
            parkingSpace: data.parkingSpace ? data.parkingSpace : '',
            id: data.id
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - editVehicle"
        );
        return res.json(-1);
    }  
}

exports.deleteVehicle = async (req, res, next) => {
    try {
        const tenantVehicleID = req.params.tvID;
        
        await models.TenantVehicles.delete(tenantVehicleID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteVehicle"
        );
        return res.json(-1);
    }  
}

exports.deleteOthersOnLease = async (req, res, next) => {
    try {
        const tenantOthersOnLeaseID = req.params.tolID;
        
        await models.TenantOthersOnLease.delete(tenantOthersOnLeaseID)
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteOthersOnLease"
        );
        return res.json(-1);
    }  
}

exports.getEmergencyContacts = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await models.TenantEmergencyContact.getByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getEmergencyContacts"
        );
        return res.json([]);
    }  
}

exports.addEmergencyContact = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.TenantEmergencyContact.add({
            tenantID: data.tenantID,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            relationship: data.relationship
        });
        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addEmergencyContact"
        );
        return res.json(-1);
    }  
}

exports.deleteEmergencyContacts = async (req, res, next) => {
    try {
        const tenantEmergencyContactID = req.params.tecID;
        
        await models.TenantEmergencyContact.delete(tenantEmergencyContactID)
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteEmergencyContacts"
        );
        return res.json(-1);
    }  
}

exports.updateEmergencyContact = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.TenantEmergencyContact.update({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            relationship: data.relationship
        });
        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateEmergencyContact"
        );
        return res.json(-1);
    }  
}

exports.getLeaseViolations = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await models.LeaseViolations.getByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getLeaseViolations"
        );
        return res.json([]);
    }  
}

exports.deleteLeaseViolation = async (req, res, next) => {
    try {
        const leaseViolationID = req.params.lvID;
        
        await models.LeaseViolations.delete(leaseViolationID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteLeaseViolation"
        );
        return res.json(-1);
    }  
}

exports.getThreeDayNotice = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await models.ThreeDayNotice.getByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getThreeDayNotice"
        );
        return res.json([]);
    }  
}

exports.getVacantUnitByProperty = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        
        return res.json(await models.Units.getVacantByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getVacantUnitByProperty"
        );
        return res.json([]);
    }  
}

exports.getTenantBackground = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.Background.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenantBackground"
        );
        return res.json([]);
    }  
}

exports.transferTenant = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;

        const background = await models.Background.getByTenantID(data.tenantID);
        if(background === null){
            await models.Background.addTransfer({
                tenantID: data.tenantID,
                DOB: data.DOB
            });
        } else {
            // update
            await models.Background.updateTransfer({
                tenantID: data.tenantID,
                backgroundID: parseInt(background.BackgroundID)
            });
        }
        const unit = await models.Units.getByID(parseInt(data.unitID));
        // update tenant
        await models.Tenants.updateTransfer({
            unitID: data.unitID,
            unitTypeID: parseInt(unit.UnitTypeID),
            firstName: data.firstName,
            lastName: data.lastName,
            onLease: data.onLease,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            rentalAmount: parseFloat(data.rentalAmount).toFixed(2),
            housingAmount: parseFloat(data.housingAmount).toFixed(2),
            petRent: parseFloat(data.petRent).toFixed(2),
            tvCharge: parseFloat(data.tvCharge).toFixed(2),
            utilityCharge: parseFloat(data.utilityCharge).toFixed(2),
            parkingCharge: parseFloat(data.parkingCharge).toFixed(2),
            storageCharge: parseFloat(data.storageCharge).toFixed(2),
            securityDeposit: parseFloat(data.securityDeposit).toFixed(2),
            comment: data.comment,
            ssn: data.ssn,
            leaseStartDate: data.leaseStartDate,
            moveInDate: data.moveInDate,
            leaseEndDate: data.leaseEndDate,
            moveOutDate: data.moveOutDate,
            propertyID: data.propertyID,
            tenantID: data.tenantID
        });

        // insert one time charge
        if(data.oneTimeCharge > 0) {
            await models.TenantTransactions.addOneTimeTransaction({
                tenantID: data.tenantID,
                oneTimeCharge: data.oneTimeCharge,
                userID: data.userID
            });
        }

        // set unit occupied
        await models.Units.setOccupiedVacant({
            unitID: data.unitID,
            occupied: 1
        });

        // set previous unit vacant
        await models.Units.setOccupiedVacant({
            unitID: data.previousUnitID,
            occupied: 0,
            vacantDate: new Date()
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - transferTenant"
        );
        return res.json(-1);
    }  
}

exports.getAllocatedPayments = async (req, res, next) => {
    try {
        const tenantTransactionID = req.params.ttID;
            
        return res.json(await models.TenantAllocatedPayment.getByTransactionID(tenantTransactionID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getAllocatedPayments"
        );
        return res.json([]);
    }  
}

exports.getPaymentCategories = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
            
        return res.json(await models.PaymentsCategory.getByPropertyID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getPaymentCategories"
        );
        return res.json([]);
    }  
}

exports.getTransactionAmount = async (req, res, next) => {
    try {
        const tenantTransactionID = req.params.ttID;
        
        const tt = await models.TenantTransactions.getByID(tenantTransactionID);
        return res.json(parseFloat(tt.TransactionAmount));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTransactionAmount"
        );
        return res.json([]);
    }  
}

exports.saveAllocatePayment = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.TenantAllocatedPayment.deleteByTransactionID(data.tenantTransactionID);
        for(const payment of data.payments) {
            await models.TenantAllocatedPayment.add({
                tenantTransactionID: data.tenantTransactionID,
                categoryID: parseInt(payment.CategoryID),
                paymentAmount: parseFloat(payment.PaymentAmount).toFixed(2)
            });
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - saveAllocatePayment"
        );
        return res.json(-1);
    }  
}

exports.addPaymentCategory = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        const cat = await models.PaymentsCategory.getByNameAndProperty({
            propertyID: data.propertyID,
            categoryName: data.categoryName
        });
        if(cat !== null)    return res.json("You already have a Category with the name: " + data.categoryName);

        const chargesType = await models.ChargesType.getByName({
            categoryName: data.categoryName
        });
        if(chargesType !== null)    return res.json("You already have a Category with the name: " + data.categoryName);

        // Add
        await models.PaymentsCategory.add({
            propertyID: data.propertyID,
            categoryName: data.categoryName
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - saveAllocatePayment"
        );
        return res.json("Error processing your request. Please, contact us.");
    }  
}

exports.updateTenantDetails = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.Tenants.updDetails({
            fistName: data.fistName,
            lastName: data.lastName,
            ssn: data.ssn,
            email: data.email,
            phone: data.phone ? data.phone.toString().replace(/[^0-9]/g, '') : '',
            othersLease: data.othersLease,
            comment: data.comment,
            tenantID: data.tenantID
        });
        const background = await models.Background.getByTenantID(data.tenantID);
        if(background === null) {
            await models.Background.addTransfer({
                tenantID: data.tenantID,
                DOB: data.dob
            });
        }
        await models.Background.updTenantDetails({
            tenantID: data.tenantID,
            DOB: data.dob,
            dl: data.dl,
            dlState: data.dlState
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateTenantDetails"
        );
        return res.json(-1);
    }  
}

exports.updateRecurringCharges = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        await models.Tenants.updrecurringCharges({
            tenantID: data.tenantID,
            rentalAmount: parseFloat(data.rentalAmount).toFixed(2),
            housingAmount: parseFloat(data.housingAmount).toFixed(2),
            petRent: parseFloat(data.petRent).toFixed(2),
            tvCharge: parseFloat(data.tvCharge).toFixed(2),
            utilityCharge: parseFloat(data.utilityCharge).toFixed(2),
            parkingCharge: parseFloat(data.parkingCharge).toFixed(2),
            storageCharge: parseFloat(data.storageCharge).toFixed(2),
            hoaFee: parseFloat(data.hoaFee).toFixed(2),
            garageAmount: parseFloat(data.garageAmount).toFixed(2),
            cam: parseFloat(data.cam).toFixed(2),
            monthToMonth: parseFloat(data.monthToMonth).toFixed(2),
            additionalTenantsCharge: parseFloat(data.additionalTenantsCharge).toFixed(2),
            RVCharge: parseFloat(data.RVCharge).toFixed(2),
            trashCharge: parseFloat(data.trashCharge).toFixed(2),
            sewerCharge: parseFloat(data.sewerCharge).toFixed(2),
            taxesFee: parseFloat(data.taxesFee).toFixed(2),
            insuranceFee: parseFloat(data.insuranceFee).toFixed(2)
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateRecurringCharges"
        );
        return res.json(-1);
    }  
}

exports.updateRecurringConcession = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.Tenants.updRecurringConcession({
            tenantID: data.tenantID,
            amount: parseFloat(data.amount).toFixed(2),
            reason: data.reason
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateRecurringConcession"
        );
        return res.json(-1);
    }  
}

exports.updateLeaseDates = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.Tenants.updLeaseDates({
            tenantID: data.tenantID,
            leaseStartDate: data.leaseStartDate,
            moveInDate: data.moveInDate,
            leaseEndDate: data.leaseEndDate,
            moveOutDate: data.moveOutDate,
            notice: data.notice,
            mtm: data.mtm
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateLeaseDates"
        );
        return res.json(-1);
    }  
}

exports.getFutureLeaseChange = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await models.FutureLease.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getFutureLeaseChange"
        );
        return res.json(null);
    }  
}

exports.updateFutureLeaseChanges = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        const future = await models.FutureLease.getByTenantID(data.tenantID);
        if(future === null) {
            await models.FutureLease.insertByTenantID({
                tenantID: data.tenantID,
                leaseChangeDate: data.leaseChangeDate,
                housingAmount: parseFloat(data.housingAmount).toFixed(2),
                rentalAmount: parseFloat(data.rentalAmount).toFixed(2),
                utilityCharge: parseFloat(data.utilityCharge).toFixed(2)
            });
        } else {
            await models.FutureLease.updByTenantID({
                tenantID: data.tenantID,
                leaseChangeDate: data.leaseChangeDate,
                housingAmount: parseFloat(data.housingAmount).toFixed(2),
                rentalAmount: parseFloat(data.rentalAmount).toFixed(2),
                utilityCharge: parseFloat(data.utilityCharge).toFixed(2)
            });
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateFutureLeaseChanges"
        );
        return res.json(-1);
    }  
}

exports.getDocumentTypes = async (req, res, next) => {
    try {
        return res.json(await models.DocumentTypes.getAll());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getDocumentTypes"
        );
        return res.json(null);
    }  
}

const promisifiledUrlExists = util.promisify(urlExists);
exports.getEditTenantDocuments = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;

        let docs = [];
        const getDocs = await models.Documents.getEditTenantDocs(tenantID);
        for(const d of getDocs) {
            const docName = ESAPI.encoder().encodeForHTML(d.DocumentName);
            const path = `https://myirent.com/rent/TenantFiles/${d.PropertyID}/${tenantID}/${docName}`;
            const exists = await promisifiledUrlExists(path)
            if(exists) {
                docs.push({
                    path,
                    audited: d.Audited,
                    comment: d.Comment,
                    documentID: d.DocumentID,
                    docType: d.DocumentType,
                    docName: d.DocumentName
                });
            }
        }
        return res.json(docs);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getDocuments"
        );
        return res.json([]);
    } 
}

exports.addDoument = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        await models.Documents.add({
            documentTypeID: data.documentTypeID,
            tenantID: data.tenantID,
            docName: data.docName
        });
        if(parseInt(data.documentTypeID) === 13) {
            await models.Tenants.updRentersInsurance({
                tenantID: data.tenantID,
                rentersInsuranceExpiration: data.rentersInsuranceExpiration
            });
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addCoument"
        );
        return res.json(-1);
    }  
}

exports.createDirectory = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        let path = data.path;
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
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - createDirectory"
        );
        return res.json(-1);
    }  
}

exports.deleteDocument = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        await models.Documents.delete(data.documentID);
        const rentersInsurance = await models.Documents.tenantHasRentersInsurance(data.tenantID);
        if(!rentersInsurance) {
            await models.Tenants.setNoRentersInsurance(data.tenantID);
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - deleteDocument"
        );
        return res.json(-1);
    }  
}

exports.isTransactionClosedOut = async (req, res, next) => {
    try {
        const tenantTransactionID = req.params.ttID;

        return res.json(await models.TenantTransactions.isTransactionClosedOut(tenantTransactionID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - isTransactionClosedOut"
        );
        return res.json(true);
    }  
}

exports.getEditTransactionDetails = async (req, res, next) => {
    try {
        const tenantTransactionID = req.params.ttID;
        
        return res.json(await models.TenantTransactions.getEditTransactionDetails(tenantTransactionID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getEditTransactionDetails"
        );
        return res.json([]);
    }  
}

exports.getEditTransactionTypes = async (req, res, next) => {
    try {        
        const transactionTypeID = req.params.ttypeID;

        let output = [];
        let data = null;
        data = await models.ChargesType.getAll();
        for(const d of data) {
            output.push({
                id: d.ChargeTypeID,
                desc: d.ChargeType       
            })
        }
        /*
        if(transactionTypeID in [1 ,3]) {
            data = await models.ChargesType.getAll();
            for(const d of data) {
                output.push({
                    id: d.ChargeTypeID,
                    desc: d.ChargeType       
                })
            }
        } else {
            data = await models.DepositSource.getAll();
            for(const d of data) {
                output.push({
                    id: d.DepositSourceID,
                    desc: d.DepositSource       
                });
            }
        }
        */
        return res.json(output);            
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getAllChargeTypes"
        );
        return res.json([]);
    }  
}

exports.getEditTransactionTenants = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        const tenant = await models.Tenants.get(tenantID);
        return res.json(await models.Tenants.getByProperty(parseInt(tenant.PropertyID)));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getEditTransactionDetails"
        );
        return res.json([]);
    }  
}

exports.editTransaction = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        const tenantTransaction = await models.TenantTransactions.getByID(parseInt(data.tenantTransactionID));
        const checkRegister = await models.CheckRegister.getByID(parseInt(tenantTransaction.CheckRegisterID));
            
        // update check register amount
        if(checkRegister !== null) {
            const newAmount = 
                (parseFloat(checkRegister.Amount) - parseFloat(tenantTransaction.TransactionAmount)) 
                + parseFloat(data.transactionAmount);
            await models.CheckRegister.updAmount({
                amount: parseFloat(newAmount).toFixed(2),
                checkRegisterID: parseInt(tenantTransaction.CheckRegisterID)
            });
        }
            
        // update transaction
        await models.TenantTransactions.updEditTransaction({
            tenantID: data.tenantID,
            transactionAmount: data.transactionAmount,
            transactionDate: data.transactionDate,
            chargeTypeID: parseInt(data.chargeTypeID),
            userID: data.userID,
            comment: data.comment,
            tenantTransactionID: data.tenantTransactionID
        });
            
        // If the escrow reimbursement is being changed, we also need to update the check register
        if(parseInt(data.chargeTypeID) === 32 && checkRegister !== null)
            await models.CheckRegister.updEscrowReimbursement(parseInt(tenantTransaction.CheckRegisterID));

        // reconcile?
        if(parseInt(data.reconciled) === 1 && checkRegister !== null)
            await models.CheckRegister.reconcile(parseInt(tenantTransaction.CheckRegisterID));

        // Log
        await models.TransactionChanges.add({
            originalTransactionDate: data.originalTransactionDate,
            transactionDate: data.transactionDate,
            tenantTransactionID: data.tenantTransactionID,
            userID: data.userID,
            originalAmount: data.originalAmount,
            transactionAmount: data.transactionAmount,
            originalChargeTypeID: data.originalChargeTypeID,
            chargeTypeID: data.chargeTypeID,
            originalComment: data.originalComment,
            comment: data.comment,
            propertyID: data.propertyID,
            originalTenantID: data.originalTenantID,
            tenantID: data.tenantID
        });
            
        const company = await models.Company.get(parseInt(data.companyID));
        if(parseInt(company.TurnOffUpdatedTransactionNotification) === 0) {
            const property = await models.Properties.getByID(data.propertyID);
            const ownersData = await models.User.getOwnersByProperty(data.propertyID);
            const pmData = await models.User.getPMByProperty(data.propertyID);
            const user = await models.User.get(data.userID);
            const originalCharge = await models.ChargesType.getByID(data.originalChargeTypeID);
            const originalTenant = await models.Tenants.get(data.originalTenantID);
            const newCharge = await models.ChargesType.getByID(data.chargeTypeID);
            const newTenant = await models.Tenants.get(data.tenantID);
                
            let owners = '';
            for(const o of ownersData) {
                owners += o.UserEmail + ',';
            }
            let pms = '';
            for(const pm of pmData) {
                pms += pm.UserEmail + ',';
            }

            const transDate = data.originalTransactionDate.toString().substring(5, 7) + '/' + data.originalTransactionDate.toString().substring(8, 10) + "/" + data.originalTransactionDate.toString().substring(0, 4);
            const newTransDate = data.transactionDate.toString().substring(5, 7) + '/' + data.transactionDate.toString().substring(8, 10) + "/" + data.transactionDate.toString().substring(0, 4);

            let htmlMsg = `${user.UserFName} ${user.UserLName} has modified a transaction for <b>${property.PropertyName}</b> <br/><br/>
                <b color="red">The original transaction details were:</b><br/>
                Transaction Type: <font color="red">${originalCharge.ChargeType}</font><br/>
                Amount: <font color="red">$${parseFloat(data.originalAmount).toFixed(2)}</font><br/>
                Transaction Date: <font color="red">${transDate}</font><br/>
                Tenant: <font color="red"> ${originalTenant.TenantFName} ${originalTenant.TenantLName}</font><br/>
                Comment: <font color="red"> ${data.originalComment} </font><br/><br/>

                <B color="blue">The new transaction details are:</B><br/>
                Transaction Type: <font color="blue">${newCharge.ChargeType}</font><br/>
                Amount: <font color="blue">$${parseFloat(data.transactionAmount).toFixed(2)}</font><br/>
                Transaction Date: <font color="blue">${newTransDate}</font><br/>
                Tenant: <font color="blue"> ${newTenant.TenantFName} ${newTenant.TenantLName}</font><br/>
                Comment: <font color="blue"> ${data.comment} </font><br/><br/>
            `;

            const notify = new Email();
            const notifyTransporter = notify.getTransporter();
            await notifyTransporter.sendMail({
                from: "support@myirent.com", 
                cc: pms.substring(0, pms.length-1),
                to: owners.substring(0, owners.length-1), 
                subject: `${property.PropertyName} - Modified Transaction`, 
                html: htmlMsg, 
            }); 
        }

        return res.json(0);
    } catch(err) {
            console.log(err);
        /*
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - editTransaction"
        );
        */
        return res.json(-1);
    }  
}

exports.getUnitCharges = async (req, res, next) => {
    try {
        const unitID = req.params.uID;
        
        return res.json(await models.Units.getCharges(unitID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getUnitCharges"
        );
        return res.json([]);
    }  
}

exports.addTenant = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;

        const getUnitType = await models.UnitTypes.getByunitID(parseInt(data.unitID));
        const tenantID = await models.Tenants.add({
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            ssn: data.ssn,
            leaseStart: data.leaseStart,
            unitTypeID: parseInt(getUnitType.UnitTypeID),
            userID: data.userID,
            propertyID: data.propertyID,
            leaseEnd: data.leaseEnd,
            moveIn: data.moveIn,
            moveOut: data.moveOut,
            unitID: parseInt(data.unitID),
            rentalAmount: parseFloat(data.rentalAmount).toFixed(2),
            secDeposit: parseFloat(data.secDeposit).toFixed(2),
            petRent: parseFloat(data.petRent).toFixed(2),
            TVCharge: parseFloat(data.TVCharge).toFixed(2),
            utilityCharge: parseFloat(data.utilityCharge).toFixed(2),
            storageCharge: parseFloat(data.storageCharge).toFixed(2),
            parkingCharge: parseFloat(data.parkingCharge).toFixed(2),
            HOAFee: parseFloat(data.HOAFee).toFixed(2),
            housingAmount: data.housingAmount !== undefined ? parseFloat(data.housingAmount).toFixed(2) : 0
        });

        if(data.dob !== undefined) {
            await models.Background.addTransfer({
                tenantID,
                DOB: data.dob
            });
        }

        // set unit occupied
        await models.Units.setOccupiedVacant({
            unitID: parseInt(data.unitID),
            occupied: 1
        });
        // The one time Fees
        if(parseFloat(data.secDeposit) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 17,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.secDeposit).toFixed(2),
                comment: "Security Deposit",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.nonRefDeposit) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 11,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.nonRefDeposit).toFixed(2),
                comment: "Non Refundable Deposit",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.lastMonthRent) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 57,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.lastMonthRent).toFixed(2),
                comment: "Last Month Rent Charge",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.proRated) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 10,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.proRated).toFixed(2),
                comment: "Pro-Rated Rent Charge",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.admin) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 20,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.admin).toFixed(2),
                comment: "Admin Fee",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.application) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 18,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.application).toFixed(2),
                comment: "Application Fee",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.reservationFee) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 47,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.reservationFee).toFixed(2),
                comment: "Reservation Charge",
                userID: data.userID,
                depositSourceID: 1
            });

        if(parseFloat(data.petDeposit) !== 0)
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 26,
                tenantID: tenantID,
                transactionType: 1,
                amount: parseFloat(data.petDeposit).toFixed(2),
                comment: "Pet Deposit Charge",
                userID: data.userID,
                depositSourceID: 1
            });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - addTenant"
        );
        return res.json(-1);
    }  
}

exports.getChargeTypes = async (req, res, next) => {
    try {
        return res.json(await models.ChargesType.getAll());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getChargeTypes"
        );
        return res.json(null);
    }  
}

const addTenantCharge = async (data) => {
    if(parseInt(data.transactionType) === 3 && data.admin in [1, 2]) {
        data.transactionType = 2;
    }
    let transactionDate = new Date();
    if(data.transactionDate !== undefined)
        transactionDate = data.transactionDate;
    await models.TenantTransactions.addOneTimeFee({
        chargeTypeID: data.chargeTypeID,
        tenantID: data.tenantID,
        transactionType: data.transactionType,
        amount: data.amount,
        comment: data.comment,
        userID: data.userID,
        depositSourceID: data.depositSourceID,
        transactionDate
    });
    // If charge is insufficient funds, add a bank charge to the tenant and the check register
    if(parseInt(data.chargeTypeID) === 12) {
        const nsf = await models.RecurringChargesTax.getByPropertyID(parseInt(data.propertyID));
        if(nsf !== null && parseFloat(nsf.NSFFee) > 0) {
            const NSFTaxAmount = parseFloat(data.amount) * (parseFloat(nsf.NSFFee) / 100);
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 45,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(NSFTaxAmount).toFixed(2),
                comment: "NSF Fee Tax",
                userID: data.userID,
                depositSourceID: 1
            });
        }
        const property = await models.Properties.getByID(parseInt(data.propertyID));
        await models.TenantTransactions.addOneTimeFee({
            chargeTypeID: parseInt(data.chargeTypeID),
            tenantID: data.tenantID,
            transactionType: parseInt(data.transactionType),
            amount: parseFloat(property.BankFee).toFixed(2),
            comment: data.comment,
            userID: parseInt(data.userID),
            depositSourceID: parseInt(data.depositSourceID)
        });
        await models.CheckRegister.add({
            propertyID: parseInt(data.propertyID),
            vendorID: 0,
            amount: parseFloat(property.BankFee).toFixed(2),
            memo: "Bank Charge NSF Fee",
            expenseTypeID: 6,
            escrow: 0,
            invoiceDate: new Date(),
            invoiceNumber: '0',
            userID: parseInt(data.userID),
            unitID: 0
        });
    }
}
exports.applyAdditionalCharges = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;

        const tenants = data.tenants;
        for(const t of tenants) {
            await addTenantCharge({
                chargeTypeID: parseInt(data.chargeTypeID),
                tenantID: parseInt(t.tenantID),
                transactionType: parseInt(data.transactionType),
                amount: parseFloat(data.amount).toFixed(2),
                comment: data.comment,
                userID: parseInt(data.userID),
                depositSourceID: parseInt(data.depositSourceID),
                propertyID: parseInt(data.propertyID),
                admin: parseInt(data.admin),
                transactionDate: data.transactionDate
            });
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - applyAdditionalCharges"
        );
        return res.json(-1);
    }  
}

exports.getPreviousTenants = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const company = await models.Company.get(data.companyID);
        return res.json(await models.Tenants.getPreviousTenants({
            multiprop: data.multiprop,
            userID: data.userID,
            propertyID: data.propertyID,
            showAllPropertiesTenants: company.ShowAllPropertiesTenants
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getPreviousTenants"
        );
        return res.json([]);
    }  
}

exports.getReconcilePreviousTenants = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const company = await models.Company.get(data.companyID);
        return res.json(await models.Tenants.getReconcilePreviousTenants({
            multiprop: data.multiprop,
            userID: data.userID,
            propertyID: data.propertyID,
            showAllPropertiesTenants: company.ShowAllPropertiesTenants
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getReconcilePreviousTenants"
        );
        return res.json([]);
    }  
}

exports.getSendToCollection = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        
        const company = await models.Company.get(companyID);
        if(company === null)    return res.json(0);
        return res.json(parseInt(company.SendToCollection));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getSendToCollection"
        );
        return res.json(0);
    }  
}

exports.sendToCollection = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        await models.Collections.add({tenantID});
        await models.Tenants.updCollections({
            tenantID,
            collections: 1
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - sendToCollection"
        );
        return res.json(-1);
    }  
}

exports.getCompanyPropertyDetails = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.Properties.getCompanyPropDetailsByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getCompanyPropertyDetails"
        );
        return res.json(null);
    }  
}

exports.getTenantBalanceUntil = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        let bal = 0;
        const balances = await models.TenantTransactions.getBalanceUntil({
            tenantID: data.tenantID,
            date: data.date
        });
        if(balances !== null) {
            const tenantBalance = (balances.TotalDebit === null ? 0 : parseFloat(balances.TotalDebit)) - (balances.TotalCredit === null ? 0 : parseFloat(balances.TotalCredit));
            const housingBalance = (balances.HousingDebit === null ? 0 : parseFloat(balances.HousingDebit)) - (balances.HousingCredit === null ? 0 : parseFloat(balances.HousingCredit));
            bal = tenantBalance + housingBalance;
        }
        return res.json(bal);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenantBalanceUntil"
        );
        return res.json(0);
    }  
}

exports.getTransactionsAfterDate = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
            
        return res.json(await models.TenantTransactions.getAfterDate({
            tenantID: data.tenantID,
            date: data.date
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTransactionsAfterDate"
        );
        return res.json(0);
    }  
}

exports.getTempTransactionDetails = async (req, res, next) => {
    try {
        const tempTransactionID = req.params.ttID;

        return res.json(await models.TempTransactions.getTransactionReceiptData(tempTransactionID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTempTransactionDetails"
        );
        return res.json(null);
    }  
}

exports.getAllTenantsStatement = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        
        let output= [];
        const tenantStatements = await models.Tenants.getAllTenantsStatement({
            multiprop: data.multiprop,
            userID: data.userID,
            propertyID: data.propertyID
        });
        for(const ts of tenantStatements) {
            let skip = false;
            if(data.onlyDeliquents) {
                const tenantBalance = (isNaN(parseFloat(ts.TotalDebit)) ? 0 : parseFloat(ts.TotalDebit)) - (isNaN(parseFloat(ts.TotalCredit)) ? 0 : parseFloat(ts.TotalCredit))
                const housingBalance = (isNaN(parseFloat(ts.HousingDebit)) ? 0 : parseFloat(ts.HousingDebit)) - (isNaN(parseFloat(ts.HousingCredit)) ? 0 : parseFloat(ts.HousingCredit))
                const balance = tenantBalance - housingBalance;
                if(parseFloat(balance) <= 0)    skip = true
            }
            if(!skip) {
                output.push({
                    TenantFName: ts.TenantFName,
                    TenantLName: ts.TenantLName,
                    PropertyAddress1: ts.PropertyAddress1,
                    UnitName: ts.UnitName,
                    PropertyCity: ts.PropertyCity,
                    PropertyState: ts.PropertyState,
                    PropertyZip: ts.PropertyZip,
                    RentalAmount: ts.RentalAmount,
                    HousingAmount: ts.HousingAmount,
                    PetRent: ts.PetRent,
                    UtilityCharge: ts.UtilityCharge,
                    LeaseStartDate: ts.LeaseStartDate,
                    LeaseEndDate: ts.LeaseEndDate,
                    Statements: await models.TenantTransactions.getTenantStatement(parseInt(ts.TenantID))
                });
            }
        }
        return res.json(output);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getAllTenantsStatement"
        );
        return res.json([]);
    }  
}

exports.getMoveOutStatementData = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        let output = {
            TenantFName: null,
            TenantLName: null,
            UnitName: null,
            ReasonLeft: null,
            RentalAmount: null,
            HousingAmount: null,
            PetRent: null,
            UtilityCharge: null,
            LeaseStartDate: null,
            LeaseEndDate: null,
            MoveOutDate: null,
            Statements: []
        };
        const tenant = await models.Tenants.getMoveOutStatementData(tenantID);
        if(tenant !== null) {
            output.TenantFName = tenant.TenantFName;
            output.TenantLName = tenant.TenantLName;
            output.UnitName = tenant.UnitName;
            output.ReasonLeft = tenant.MoveOutReason;
            output.RentalAmount = tenant.RentalAmount;
            output.HousingAmount = tenant.HousingAmount;
            output.PetRent = tenant.PetRent;
            output.UtilityCharge = tenant.UtilityCharge;
            output.LeaseStartDate = tenant.LeaseStartDate;
            output.LeaseEndDate = tenant.LeaseEndDate;
            output.MoveOutDate = tenant.MoveOutDate;
            output.Statements = await models.TenantTransactions.getTenantStatement(parseInt(tenantID))
        }
            
        return res.json(output);
    } catch(err) {
            console.log(err);
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getMoveOutStatementData"
        );
        return res.json(null);
    }  
}

exports.getTenantTransactionsStatement = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
            
        return res.json(await models.TenantTransactions.getTenantStatement(parseInt(tenantID)));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getTenantTransactionsStatement"
        );
        return res.json(0);
    }  
}

exports.sendLedgerToTenant = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        const tenantID = data.tenantID;
        const userID = data.userID;
            
        const tenant = await models.Tenants.get(tenantID);
        if(tenant === null) return res.json("Invalid Tenant.");
        if(!validateEmail.validate(tenant.TenantEmail))
            return res.json("Tenant does not have a valid email. Please update the tenant email.");

        const property = await models.Properties.getByID(parseInt(tenant.PropertyID));
        const unit = await models.Units.getByID(parseInt(tenant.UnitID));
        const ledger = await models.TenantTransactions.getTenantLedger(tenantID);
        
        let totalDebit = 0;
        let totalCredit = 0;
        let tenantBalance = 0;
        let housingBalance = 0;
        const renderLedger = () => {
            let body = ``;
            ledger.map((obj) => {
                let credit = 0;
                let debit = 0;
                if(parseInt(obj.TransactionTypeID) === 1) {
                    if(obj.CheckDate) transDate = moment.utc(obj.CheckDate).valueOf();
                    else            transDate = moment.utc(obj.TenantTransactionDate).valueOf(); 
                    debit = parseFloat(obj.TransactionAmount).toFixed(2);
                    tenantBalance += parseInt(obj.ChargeTypeID) !== 6 ? parseFloat(obj.TransactionAmount) : 0;
                    housingBalance += parseInt(obj.ChargeTypeID) === 6 ? parseFloat(obj.TransactionAmount) : 0;
                    totalDebit += parseFloat(obj.TransactionAmount);
                } else if(parseInt(obj.TransactionTypeID) === 2) {
                    if(obj.CheckDate) transDate = moment.utc(obj.CheckDate).valueOf();
                    else            transDate = moment.utc(obj.TenantTransactionDate).valueOf();
                    credit = parseFloat(obj.TransactionAmount).toFixed(2);
                    tenantBalance -= parseInt(obj.ChargeTypeID) !== 6 ? parseFloat(obj.TransactionAmount) : 0;
                    housingBalance -= parseInt(obj.ChargeTypeID) === 6 ? parseFloat(obj.TransactionAmount) : 0;
                    totalCredit += parseFloat(obj.TransactionAmount);
                }
                const renderBalance = () => {
                    let total = parseFloat(totalDebit-totalCredit);
                    return `${total < 0 ? '(' : ''}${parseFloat(Math.abs(total)).toFixed(2)}${total < 0 ? ')' : ''}`
                }
                body += `
                    <tr>
                        <td>${moment.utc(obj.TenantTransactionDate).format("MM/DD/YYYY")}</td>
                        <td>${obj.ChargeType} - ${obj.Comment} ${obj.TenantTransactionID}</td>
                        <td>$${parseFloat(debit).toFixed(2)}</td>
                        <td>$${parseFloat(credit).toFixed(2)}</td>
                        <td>$${renderBalance()}</td>
                    </tr>
                `;
            });
            balance = parseFloat(tenantBalance) + parseFloat(housingBalance);
            return body;
        }

        let emailBody = `<H3>Tenant Ledger - ${tenant.TenantFName} ${tenant.TenantLName}`;
        emailBody += `<p> ${property.PropertyName} <br/>`;
        emailBody += `${property.PropertyAddress1}, ${property.PropertyCity}, ${property.PropertyState} ${property.PropertyZip}<br/>`;
        emailBody += `Unit: ${unit.UnitName} <br/>`;
        emailBody += `Lease Expiration Date: ${moment(tenant.LeaseEndDate).format("MM/DD/YYYY")}`;
        emailBody += `
            <table border="1">
                <thead>
                    <tr>
                        <th><B>Transaction Date</B></th>
                        <th><B>Description</B></th>
                        <th><B>Charge</B></th>
                        <th><B>Credit</b></th>
                        <th><B>Balance</B></th>
                    </tr>
                </thead>
                <tbody>
                    ${renderLedger()}
                    <tr>
                        <td colspan='5' align='right'>
                            ${tenantBalance < 0 ? 
                                "Tenant has Credit: $" + Math.abs(parseFloat(tenantBalance).toFixed(2)) + "" : 
                                "Tenant Owes: $" + Math.abs(parseFloat(tenantBalance).toFixed(2)) + "" 
                            }
                        </td>
                    </tr>
                    <tr>
                        <td colspan='5' align='right'>
                            ${housingBalance < 0 ? 
                                "House has Credit: $" + Math.abs(parseFloat(housingBalance).toFixed(2)) + "" : 
                                "House Owes: $" + Math.abs(parseFloat(housingBalance).toFixed(2)) + "" 
                            }
                        </td>
                    </tr>
                    <tr>
                        <td colspan='5' align='right'>
                            ${balance > 0 ? 
                                "<b>Total Due: $" + Math.abs(parseFloat(balance).toFixed(2)) + "</b>" : 
                                "<b>Nothing is currently due</b>" 
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        const user = await models.User.get(userID);
        const tenantSendEmail = new Email();
        const tenantTransporter = tenantSendEmail.getTransporter();
        await tenantTransporter.sendMail({
            from: user.UserEmail, 
            to: tenant.TenantEmail.toString().trim(), 
            subject: `Tenant Ledger - ${tenant.TenantFName} ${tenant.TenantLName}`,
            html: emailBody
        });
        return res.json(0);
    } catch(err) {
            console.log(err);
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - sendLedgerToTenant"
        );
        return res.json('Error processing your request. Please, contact us.');
    }  
}

exports.getByUnit = async (req, res, next) => {
    try {
        const unitID = req.params.uID
            
        return res.json(await models.Tenants.getByUnit(unitID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getByUnit"
        );
        return res.json(null);
    }  
}

exports.updMoveOutDate = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        await models.Tenants.updMoveOutDate({
            moveOutDate: data.moveOutDate,
            tenantID: data.tenantID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updMoveOutDate"
        );
        return res.json(-1);
    }  
}

exports.getPreLeaseProspects = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await models.Tenants.getPreLeaseProspect(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - getPreLeaseProspects"
        );
        return res.json([]);
    }  
}

exports.setPreLeased = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        return res.json(await models.PreLeased.add({
            userID: data.userID,
            moveInDt: data.moveInDt,
            tenantID: data.tenantID,
            unitID: data.unitID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - setPreLeased"
        );
        return res.json(-1);
    }  
}

exports.deletePreLeased = async (req, res, next) => {
    try {
        const preLeasedID = req.params.plID;
        await models.PreLeased.delete(preLeasedID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - setPreLeased"
        );
        return res.json(-1);
    }  
}

exports.updateTenantTransactionType = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        await models.TenantTransactions.updTransactionType({
            transactionTypeID: data.transactionTypeID,
            tenantTransactionID: data.tenantTransactionID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateTenantTransactionType"
        );
        return res.json(-1);
    }  
}

exports.updateDelinquencyComment = async (req, res, next) => {
    try {
        const data = req.body || req.body.data;
        await models.Tenants.updateDelinquencyComment({
            delinquencyComments: data.delinquencyComments.replace(/'/g, "\\'"),
            tenantID: data.tenantID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Tenants Controller - updateDelinquencyComment"
        );
        return res.json(-1);
    }  
}