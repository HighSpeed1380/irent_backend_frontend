const Email = require('../../util/email');
const models = require('../../models/importAll');
const moment = require('moment');
const html_to_pdf = require('html-pdf-node');
const FTPClient = require('ftp');
const axios = require('axios');

exports.getProspects = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await models.Tenants.getProspectsByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getProspects"
        );
        return res.json([]);
    }  
}

exports.getApplicants = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
            
        const property = await models.Properties.getByID(propertyID);
        const applicants = await models.Tenants.getApplicantsByProperty(propertyID);
        const backgroundScreening = new Map();
        for(const app of applicants) {
            if(parseInt(property.BackgroundScreening) !== 1) {
                // tazworks
                const temp = [];
                const tenantReport = await models.TazWorks.getByTenantID(parseInt(app.TenantID));
                temp.push({ name: null, report: tenantReport });

                const othersOnLease = await models.TenantOthersOnLease.getListByTenantID(parseInt(app.TenantID));
                for(const ool of othersOnLease) {
                    const report = await models.TazWorks.getByOthersOnLease({
                        tenantID: parseInt(app.TenantID),
                        othersOnLeaseID: parseInt(ool.TenantsOthersOnLeaseID)
                    });
                    temp.push({
                        name: `${ool.FirstName} ${ool.LastName}`,
                        othersOnLeaseID: ool.TenantsOthersOnLeaseID,
                        report
                    });
                }
                backgroundScreening.set(parseInt(app.TenantID), temp);
            } else {
                // CIC
                const temp = [];
                const tenantReport = await models.CreditCheckLog.getByTenantID(parseInt(app.TenantID));
                temp.push({ name: null, report: tenantReport });

                const othersOnLease = await models.TenantOthersOnLease.getListByTenantID(parseInt(app.TenantID));
                for(const ool of othersOnLease) {
                    const report = await models.CreditCheckLog.getByOthersOnLeaseID(parseInt(ool.TenantsOthersOnLeaseID));
                    temp.push({
                        name: `${ool.FirstName} ${ool.LastName}`,
                        othersOnLeaseID: ool.TenantsOthersOnLeaseID,
                        report,
                    });
                }
                backgroundScreening.set(parseInt(app.TenantID), temp);
            }
        }   
            
        return res.json({
            applicants,
            backgroundScreening: Object.fromEntries(backgroundScreening)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getApplicants"
        );
        return res.json([]);
    }  
}

exports.deniedProspect = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        await models.Tenants.deniedTenant(tenantID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - deniedProspect"
        );
        return res.json(-1);
    }  
}

exports.convertToApplicant = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        // update tenant
        await models.Tenants.updDetails({
            fistName: data.fistName,
            middleName: data.middleName,
            lastName: data.lastName,
            phone: data.phone.replace(/'/g, "\\'"),
            email: data.email,
            ssn: data.ssn,
            othersLease: '',
            comment: data.comment,
            leadSourceID: data.leadSourceID,
            tenantID: data.tenantID
        });
        await models.Tenants.updateProspectType({
            prospect: 1,
            tenantID: data.tenantID
        });

        // insert if does not exist
        const isBackground = await models.Background.getByTenantID(data.tenantID);
        if(isBackground !== null) {
            // update background
            await models.Background.update({
                houseNumber: data.houseNumber,
                street: data.street,
                unit: data.unit,
                city: data.city,
                state: data.state,
                zip: data.zip,  
                landlordName: data.landlordName,
                landlordPhone: data.landlordPhone,
                prevHouseNumber: data.prevHouseNumber,
                prevStreet: data.prevStreet,
                prevCity: data.prevCity,
                prevState: data.prevState,
                prevZip: data.prevZip,
                prevLandlordName: data.prevLandlordName, 
                prevLandlordPhone: data.prevLandlordPhone,
                employer: data.employer,
                employerContact: data.employerContact,
                employerPhone: data.employerPhone,
                employerSalary: data.employerSalary,
                prevEmployer: data.prevEmployer, 
                prevEmployerContact: data.prevEmployerContact,
                prevEmployerPhone: data.prevEmployerPhone,
                driversLicense: data.driversLicense,
                dlState: data.dlState,
                tenantID: data.tenantID,
            });
        } else {
            await models.Background.addProspectApplicant({
                tenantID: data.tenantID,
                dob: data.dob,
                driversLicense: data.driversLicense,
                dlState: data.dlState,
                currSalary: 0,
                currEmployer: data.employer,
                currEmployerContact: data.employerContact,
                currEmployerPhone: data.employerPhone,
                prevEmployer: data.prevEmployer, 
                prevEmployerContact: data.prevEmployerContact,
                prevEmployerPhone: data.prevEmployerPhone,
                houseNumber: data.houseNumber,
                streetName: data.street,
                city: data.city,
                state: data.state,
                zip: data.zip,
                lastLandlordName: data.landlordName,
                lastLandlordPhone: data.landlordPhone,
                houseNumber2: '',
                streetName2: '',
                city2: '',
                state2: '',
                zip2: '',
                state2: '',
                prevLandlordName: data.prevLandlordName, 
                prevLandlordPhone: data.prevLandlordPhone,
            });
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - convertToApplicant"
        );
        return res.json(-1);
    }  
}

exports.getUnitTypes = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await models.UnitTypes.getByPropertyID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getUnitTypes"
        );
        return res.json([]);
    }  
}

exports.getLeadSources = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await models.LeadSource.getByCompany(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getLeadSources"
        );
        return res.json([]);
    }  
}

exports.updateProspectApplicant = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        await models.Tenants.updProspectApplicant({
            ssn: data.ssn,
            email: data.email,
            phone: data.phone.replace(/'/g, "\\'"),
            unitTypeID: data.unitTypeID,
            tenantID: data.tenantID
        });
        const bgData = {
            dob: data.dob,
            driversLicense: data.driversLicense,
            dlState: data.dlState,
            currSalary: data.currSalary,
            currEmployer: data.currEmployer,
            currEmployerContact: data.currEmployerContact,
            currEmployerPhone: data.currEmployerPhone,
            prevEmployer: data.prevEmployer,
            prevEmployerContact: data.prevEmployerContact,
            prevEmployerPhone: data.prevEmployerPhone,
            houseNumber: data.houseNumber,
            streetName: data.streetName,
            city: data.city,
            state: data.state,
            zip: data.zip,
            lastLandlordName: data.lastLandlordName,
            lastLandlordPhone: data.lastLandlordPhone,
            houseNumber2: data.houseNumber2,
            streetName2: data.streetName2,
            city2: data.city2,
            state2: data.state2,
            zip2: data.zip2,
            prevLandlordName: data.prevLandlordName,
            prevLandlordPhone: data.prevLandlordPhone,
            tenantID: data.tenantID
        }
        const background = await models.Background.getByTenantID(parseInt(data.tenantID));
        if(background === null) {
            await models.Background.addProspectApplicant(bgData);
        } else {
            await models.Background.updProspectApplicant({
                ...bgData,
                backgroundID: parseInt(background.BackgroundID)
            })
        }

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - updateProspectApplicant"
        );
        return res.json(-1);
    }  
}

exports.getReviewData = async (req, res, next) => {
    try {
        return res.json(await models.Approve.getAll())
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getReviewData"
        );
        return res.json([]);
    }  
}

exports.reviewApplicant = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.Background.updReview({
            comment: data.comment,
            approve: data.approve,
            backgroundID: data.backgroundID
        });
        if(parseInt(data.approve) === 4) {
            await models.Tenants.deniedTenant(data.tenantID);
        } else {
            await models.Tenants.activeApplicant(data.tenantID);
        }

        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - reviewApplicant"
        );
        return res.json(-1);
    }  
}

exports.getTazworksReportURL = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        return res.json(await models.BackgroundScreenings.getByProperty(data.propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTazworksReportURL"
        );
        return res.json(null);
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
            "iRent Backend - Applicants Controller - getOthersOnLease"
        );
        return res.json([]);
    }  
}

exports.addLeaseHolder = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.TenantOthersOnLease.add({
            tenantID: data.tenantID,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            ssn: data.ssn,
            dob: data.dob,
            userID: data.userID,
            driverslicense: data.driverslicense !== undefined ? data.driverslicense : '',
            dlState: data.dlState !== undefined ? data.dlState : ''
        });

        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - addLeaseHolder"
        );
        return res.json(-1);
    }  
}

exports.updateLeaseHolder = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.TenantOthersOnLease.update({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            ssn: data.ssn,
            dob: data.dob,
            userID: data.userID,
            driverslicense: data.driverslicense !== undefined ? data.driverslicense : '',
            dlState: data.dlState !== undefined ? data.dlState : '',
            id: data.tenantsOthersOnLeaseID
        });

        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - updateLeaseHolder"
        );
        return res.json(-1);
    }  
}

exports.getPropertyByID = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await models.Properties.getByID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getPropertyByID"
        );
        return res.json(null);
    }  
}

exports.getUnitDetails = async (req, res, next) => {
    try {
        const unitID = req.params.uID;
        return res.json(await models.Units.getUnitUnitTypeDetails(unitID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getUnitDetails"
        );
        return res.json(null);
    }  
}

exports.convertToTenant = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        // validate if there is anyone in the unit
        if((await models.Tenants.getByUnitNotProspect(data.unitID)) !== null)
            return res.json("Unit is occupied!");

        // remove pre leased 
        await models.PreLeased.deleteByUnitID(data.unitID);

        // update Tenants
        await models.Tenants.updateConvertToTenant({
            rentalAmount: parseFloat(data.rentalAmount).toFixed(2),
            leaseStartDate: data.leaseStartDate,
            leaseEndDate: data.leaseEndDate,
            moveInDate: data.moveInDate,
            moveOutDate: data.moveOutDate,
            housingAmount: parseFloat(data.housingAmount).toFixed(2),
            petRent: parseFloat(data.petRent).toFixed(2),
            TVCharge: parseFloat(data.TVCharge).toFixed(2),
            utilityCharge: parseFloat(data.utilityCharge).toFixed(2),
            storageCharge: parseFloat(data.storageCharge).toFixed(2),
            parkingCharge: parseFloat(data.parkingCharge).toFixed(2),
            securityDeposit: parseFloat(data.securityDeposit).toFixed(2),
            HOAFee: parseFloat(data.HOAFee).toFixed(2),
            propertyID: data.propertyID,
            unitID: data.unitID,
            tenantID: data.tenantID
        });

        // Create and Save PDF Application
        await generateApplicationPDF({
            tenantID: data.tenantID,
            unitID: data.unitID
        });

        // take of vacant 
        await models.Units.setOccupiedVacant({
            occupied: 1,
            unitID: data.unitID
        });

        if(data.nonRefundableDeposit !== undefined && parseFloat(data.nonRefundableDeposit) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 11,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.nonRefundableDeposit).toFixed(2),
                comment: 'Non Refundable Deposit',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.securityDeposit !== undefined && parseFloat(data.securityDeposit) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 17,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.securityDeposit).toFixed(2),
                comment: 'Security Deposit',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.proRatedRent !== undefined && parseFloat(data.proRatedRent) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 10,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.proRatedRent).toFixed(2),
                comment: 'Pro-Rated Rent Charge',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.lastMonthRent !== undefined && parseFloat(data.lastMonthRent) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 57,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.lastMonthRent).toFixed(2),
                comment: 'Last Month Rent Charge',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.reservationFee !== undefined && parseFloat(data.reservationFee) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 47,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.reservationFee).toFixed(2),
                comment: 'Reservation Charge',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.petDepositOneTime !== undefined && parseFloat(data.petDepositOneTime) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 26,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.petDepositOneTime).toFixed(2),
                comment: 'Pet Deposit Charge',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.oneTimeConcession !== undefined && parseFloat(data.oneTimeConcession) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 9,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.oneTimeConcession).toFixed(2),
                comment: data.concessionComment,
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.adminFee !== undefined && parseFloat(data.adminFee) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 20,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.adminFee).toFixed(2),
                comment: 'Admin Fee',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }
        if(data.applicationFee !== undefined && parseFloat(data.applicationFee) > 0) {
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 18,
                tenantID: data.tenantID,
                transactionType: 1,
                amount: parseFloat(data.applicationFee).toFixed(2),
                comment: 'Application Fee',
                paymentType: 0,
                userID: data.userID,
                depositSourceID: 1
            });
        }

        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - convertToTenant"
        );
        return res.json(-1);
    }  
}

const generateApplicationPDF = async (data) => {
    const getTenant = await models.Tenants.get(data.tenantID);
    const getBackground = await models.Background.getByTenantID(data.tenantID);
    const backgroundVehicles = await models.BackgroundVehicles.getByTenantID(data.tenantID);
    const backgroundReferences = await models.BackgroundReferences.getByTenantID(data.tenantID);
    const unitType = await models.UnitTypes.getByunitID(data.unitID);
    const leadSource = await models.LeadSource.get(parseInt(getTenant.LeadSourceID));
    const othersOnLease = await models.TenantOthersOnLease.getListByTenantID(data.tenantID);
    const tenantResponses = await models.TenantResponses.getByTenant(data.tenantID);

    let currAddress = getBackground.HouseNumber.toString() + " " + getBackground.StreetName;
    if(getBackground.Unit !== '' && getBackground.Unit !== 0 && getBackground.Unit !== null)
        currAddress += " " + getBackground.Unit;
    currAddress += ", " + getBackground.City + ", " + getBackground.State + " " + getBackground.Zip;

    let currAddress2 = (getBackground.HouseNumber2 !== null ? getBackground.HouseNumber2.toString() : '') + " " + (getBackground.StreetName2 !== null ? getBackground.StreetName2 : '');
    if(getBackground.Unit2 !== '' && getBackground.Unit2 !== 0 && getBackground.Unit2 !== null)
        currAddress2 += " " + getBackground.Unit2;
    currAddress2 += ", " + (getBackground.City2 !== null ? getBackground.City2 : '') + ", " + (getBackground.State2 !== null ? getBackground.State2 : '') + " " + (getBackground.Zip2 !== null ? getBackground.Zip2 : '');

    const property = await models.Properties.getByID(parseInt(getTenant.TenantID));
    isSeattle = (property !== null && parseInt(property.Seattle) === 1) ? true : false;
    let isRHAWA = false;

    const renderBank = () => { 
        if(!isRHAWA) {
            return (
                `
                <div class="panel panel-primary">
                    <div class="panel-heading">Bank Account</div>
                    <div class="panel-body">
                        <div class="form-group">
                            <label for="name" class="col-lg-2">Bank Name:</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${getBackground.ProspectBank !== null ? getBackground.ProspectBank : ''}" readonly >
                            </div>
                            <label for="name" class="col-lg-2">Bank Phone:</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${getBackground.ProspectBankPhone !== null ? getBackground.ProspectBankPhone : ''}" readonly >
                            </div>
                            <label for="name" class="col-lg-2">Account Number:</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${getBackground.ProspectBankAccount !== null ? getBackground.ProspectBankAccount : ''}" readonly >
                            </div>
                        </div>
                    </div>
                </div>
                `
            )
        }
    }

    const renderAcknowledgment = () => {
        if(isRHAWA) {
            if(isSeattle) {
                paragraph = `
                    In compliance with the Fair Credit Act and RCW 59.18.257 (2), this is to inform you that a credit investigation involving the statements made on this application for tenancy will be initiated. Any false, fraudulent or misleading information provided on the application may be grounds for denial of tenancy and/or forfeiture of rental or lease agreement. An incomplete application causes delay in processing and may result in denial of tenancy. If you are declined due to the consumer report, you may obtain a free copy of your credit report from the bureau it was obtained from within 60 days of denial. You also have the right to dispute the accuracy of the report and/or add a consumer statement to the report. This is NOT an agreement to rent and all applications must be approved.<br><br/>
                    I certify to the best of my knowledge all statements are true. I authorize the agent/owner for initial tenancy and again upon any future lease modifications or renewals to verify the information provided on the application including, but not limited to, obtaining credit reports, character reports, civil and/or criminal records, verifying source of income and rental history. I understand that false, fraudulent or misleading information may be grounds for denial of tenancy and/or forfeiture of my rental or lease agreement.<br><br/>
                    By checking the box and agreeing with these terms and conditions, I acknowledge having been notified in writing, or by posting, of what types of information will be accessed to conduct the tenant screening and what criteria may result in denial of the application, as required by RCW 59.18.257.
                `;
            } else {
                paragraph = `
                    In compliance with the Fair Credit Act and RCW 59.18.257 (2), this is to inform you that a credit investigation involving the statements made on this application for tenancy will be initiated. Any false, fraudulent or misleading information provided on the application may be grounds for denial of tenancy and/or forfeiture of rental or lease agreement. An incomplete application causes delay in processing and may result in denial of tenancy. If you are declined due to the consumer report, you may obtain a free copy of your credit report from the bureau it was obtained from within 60 days of denial. You also have the right to dispute the accuracy of the report and/or add a consumer statement to the report. This is NOT an agreement to rent and all applications must be approved. Disputes: If the screening of your application for tenancy included RHAWA’s Full Credit Report and you wish to dispute any or all information on your credit report, contact Rental Housing Association to file the dispute on your behalf. Rental Housing Association of WA - Tenant Screening 2414 SW Andover St, Ste D207 Seattle, WA 98106 Phone: (800) 335 2990/tenantscreening@RHAwa.org. <br><br/>
                    I certify to the best of my knowledge all statements are true. I authorize the agent/owner for initial tenancy and again upon any future lease modifications or renewals to verify the information provided on the application including, but not limited to, obtaining credit reports, character reports, civil and/or criminal records, verifying source of income and rental history. I understand that false, fraudulent or misleading information may be grounds for denial of tenancy and/or forfeiture of my rental or lease agreement. <br><br/>
                    By checking the box and agreeing with these terms and conditions, I acknowledge having been notified in writing, or by posting, of what types of information will be accessed to conduct the tenant screening and what criteria may result in denial of the application, as required by RCW 59.18.257.
                `;
            }

            return `
            <div class="panel panel-primary">
                <div class="panel-heading">Acknowledgment</div>
                <div class="panel-body">
                    <div class="form-group">
                        <div class="col-lg-12">
                            ${paragraph}
                        </div>
                    </div>
                </div>
            </div>
            `
        }
        return '';
    }

    const renderTenantResponse = (data) => {
        return `
            ${data.map((obj) => {
                const renderPets = () => {
                    if(obj.AnyPets !== null && parseInt(obj.AnyPets) === 1 ) {
                        return `
                        <div class="form-group">
                            <div class="col-lg-4">
                                <input type="text" class="form-control" value="${obj.PetsTypes !== null ? obj.PetsTypes : ''}" readonly />
                            </div>
                            <div class="col-lg-4">
                                <input type="text" class="form-control" value="${obj.PetsBreeds !== null ? obj.PetsBreeds : ''}" readonly />
                            </div>
                            <div class="col-lg-4">
                                <input type="text" class="form-control" value="${obj.PetsWeights !== null ? obj.PetsWeights : ''}" readonly />
                            </div>
                        </div> 
                        `
                    }
                    return '';
                }
                const renderBoat = () => {
                    if(!isRHAWA) {
                        return `
                        <div class="form-group">
                            <label for="name" class="col-lg-6">Do you have a boat?</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${parseInt(obj.Boat) === 1 ? 'Yes' : 'No'}" readonly >
                            </div>
                            <div class="col-lg-4" >
                                <input type="text" class="form-control" value="${obj.BoatComment !== null ? obj.BoatComment : ''}" readonly>
                            </div>
                        </div>
                        `
                    }
                }
                const renderMotorcycle = () => {
                    if(!isRHAWA) {
                        return `
                        <div class="form-group">
                            <label for="name" class="col-lg-6">Do you have a motorcycle?</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${parseInt(obj.Motorcycle) === 1 ? "Yes" : "No"}" readonly >
                            </div>
                            <div class="col-lg-4" >
                                <input type="text" class="form-control" value="${obj.MotorcycleComment !== null ? obj.MotorcycleComment : ''}" readonly>
                            </div>
                        </div>
                        `
                    }
                    return '';
                }
                const renderMilitary = () => {
                    if(!isRHAWA) {
                        return `
                        <div class="form-group">
                                <label for="name" class="col-lg-6">Are any members in the family in the military?</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${parseInt(obj.Military) === 1 ? 'Yes' : 'No'}" readonly >
                                </div>
                                <div class="col-lg-4" >
                                    <input type="text" class="form-control" value="${obj.MilitaryComment !== null ? obj.MilitaryComment : ''}" readonly>
                                </div>
                        </div>
                        `
                    }
                    return '';
                }
                const renderSeattleConvicted = () => {
                    if(isRHAWA) {
                        if(isSeattle) {
                            return `
                            <div class="form-group">
                                    <label for="name" class="col-lg-6">Have you ever been convicted of a crime?</label>
                                    <div class="col-lg-2">
                                        <input type="text" class="form-control" value="${parseInt(obj.Crime) === 1 ? 'Yes' : 'No'}" readonly >
                                    </div>
                                    <div class="col-lg-4" >
                                        <input type="text" class="form-control" value="${obj.CrimeComment !== null ? obj.CrimeComment : ''}" readonly>
                                    </div>
                            </div>
                            `
                        }
                        return '';
                    }
                    return '';
                }
                const renderFullDeposit = () => {
                    if(!isRHAWA) {
                        return `
                        <div class="form-group">
                            <label for="name" class="col-lg-6">Have you ever failed to receive your full deposit?</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${parseInt(obj.FullDeposit) === 1 ? 'Yes' : 'No'}" readonly >
                            </div>
                            <div class="col-lg-4" >
                                <input type="text" class="form-control" value="${obj.FullDepositComment !== null ? obj.FullDepositComment : ''}" readonly>
                            </div>
                        </div>
                        `
                    }
                    return '';
                }
                const renderForclosure = () => {
                    if(!isRHAWA) {
                        return `
                        <div class="form-group">
                            <label for="name" class="col-lg-6">Have you had a short sale, forclosure or not paid as agreed on your mortgage in the last 7 years?</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${parseInt(obj.MortageLastYears) === 1 ? 'Yes' : 'No'}" readonly >
                            </div>
                            <div class="col-lg-4" >
                                <input type="text" class="form-control" value="${obj.MortageLastYearsComment !== null ? obj.MortageLastYearsComment : ''}" readonly>
                            </div>
                        </div>
                        `;
                    }
                    return '';
                }
                const renderCreditProblems = () => {
                    if(!isRHAWA) {
                        return `
                        <div class="form-group">
                            <label for="name" class="col-lg-6">Do you have any credit problems or delinquent accounts?</label>
                            <div class="col-lg-2">
                                <input type="text" class="form-control" value="${parseInt(obj.DelinquentAccounts) === 1 ? 'Yes' : 'No'}" readonly >
                            </div>
                            <div class="col-lg-4" >
                                <input type="text" class="form-control" value="${obj.DelinquentAccountsComment !== null ? obj.DelinquentAccountsComment : ''}" readonly>
                            </div>
                        </div>
                        `
                    }
                    return '';
                }
                return (
                    `
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Do you have any pets?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.AnyPets) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        ${parseInt(obj.AnyPets) === 1 ? 
                            `<div class="col-lg-4" >
                                <input type="number" class="form-control" value="${obj.PetsQuantity}" readonly>
                            </div>` : ''
                        }
                    </div>
                    ${renderPets()}
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Do you have a waterbed?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.WaterBed) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.WaterBedComment !== null ? obj.WaterBedComment : ''}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Do you have an Aquarium?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.Aquarium) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.AquariumComment !== null ? obj.AquariumComment : ''}" readonly>
                        </div>
                    </div>
                    ${renderBoat()}
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Do you have a motorhome?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.Motorhome) === 1 ? "Yes" : "No"}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.MotorhomeComment !== null ? obj.MotorhomeComment : ''}" readonly>
                        </div>
                    </div>
                    ${renderMotorcycle()}
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Do you or any of the occupants smoke?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.Smoke) === 1 ? "Yes" : "No"}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.SmokeComment !== null ? obj.SmokeComment : ''}" readonly>
                        </div>
                    </div>
                    ${renderMilitary()}
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Have you or any proposed occupant ever had any judgement?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.Judgement) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.JudgementComment !== null ? obj.JudgementComment : ''}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Have you ever filed for bankruptcy?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.Bankruptcy) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.BankruptcyComment !== null ? obj.BankruptcyComment : ''}" readonly>
                        </div>
                    </div>        
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Have you ever willfully refused to pay rent when it was due?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.RefusedPay) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.RefusedPayComment !== null ? obj.RefusedPayComment : ''}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="name" class="col-lg-6">Have you ever been evicted or had an unlawful detainer filed against you?</label>
                        <div class="col-lg-2">
                            <input type="text" class="form-control" value="${parseInt(obj.LeftMoney) === 1 ? 'Yes' : 'No'}" readonly >
                        </div>
                        <div class="col-lg-4" >
                            <input type="text" class="form-control" value="${obj.LeftMoneyComment !== null ? obj.LeftMoneyComment : ''}" readonly>
                        </div>
                    </div>
                    ${renderSeattleConvicted()}
                    ${renderFullDeposit()}
                    ${renderForclosure()}
                    ${renderCreditProblems()}
                    `
                );
            })}
            `;
    }

    const renderSignature = () => {
        if(parseInt(getTenant.UserID) === 0) {
            return `
                <p><b>Electrically signed and agreed to by ${getTenant.TenantFName} ${getTenant.TenantLName} on ${moment.utc(getTenant.ProspectStartDate).format("MM/DD/YYYY")}</b></p>
            `
        }
        return '';
    }

    let content = `
        <html>
            <head>
                <title>Full Application</title>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
                <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
            </head>
            <body>
            <div class="container">
                <br><br>
                <form class="form-horizontal">
                    <div class="panel panel-primary">
                        <div class="panel-heading">Applicant Information</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-3">Prospect First Name:</label>
                                <div class="col-lg-3">
                                    <input type="text" class="form-control" value="${getTenant.TenantFName}" readonly >
                                </div>
                                <label for="name" class="col-lg-3">Prospect Last Name:</label>
                                <div class="col-lg-3">
                                    <input type="text" class="form-control" value="${getTenant.TenantLName}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-1">Phone:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getTenant.TenantPhone}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">eMail:</label>
                                <div class="col-lg-3">
                                    <input type="text" class="form-control" value="${getTenant.TenantEmail}" readonly >
                                </div>
                                <label for="name" class="col-lg-1">SSN:</label>
                                <div class="col-lg-3">
                                    <input type="text" class="form-control" value="${getTenant.SSN}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-1">DOB:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${moment.utc(getBackground.DOB).format("MM/DD/YYYY")}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Drivers License:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.DriversLicense !== null ? getBackground.DriversLicense : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Drivers License State:</label>
                                <div class="col-lg-1">
                                    <input type="text" class="form-control" value="${getBackground.DLState !== null && getBackground.DLState !== 'XX' ? getBackground.DLState : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Former Name:</label>
                                <div class="col-lg-10">
                                    <input type="text" class="form-control" value="${getBackground.FormerName !== null ? getBackground.FormerName : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Property Information</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Interest:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${unitType !== null ? unitType.UnitType : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Desired Move In:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.DesiredMoveInDate !== null ? moment.utc(getBackground.DesiredMoveInDate).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Desired Lease Term:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.DesiredLeaseTerm}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Lead Source:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${leadSource !== null ? leadSource.LeadSource : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Specified Rent:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="$${parseFloat(getBackground.DesiredRent).toFixed(2)}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Others On Lease:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getTenant.OnLease !== null ? getTenant.OnLease : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Others Responsible on Lease</div>
                        <div class="panel-body">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                      <th align=center>First Name</th>
                                      <th align=center>Last Name</th>
                                      <th align=center>Phone</th>
                                      <th align=center>eMail</th>
                                      <th align=center>SSN</th>
                                      <th align=center>DOB</th>
                                      <th align=center>Drivers License</th>
                                      <th align=center>Drivers License State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${othersOnLease.map((obj) => {
                                        return (
                                            `
                                            <tr>
                                                <td align=center>${obj.FirstName}</td>
                                                <td align=center>${obj.LastName}</td>
                                                <td align=center>${obj.Phone}</td>
                                                <td align=center>${obj.eMail}</a></td>
                                                <td align=center>${obj.SSN}</td>
                                                <td align=center>${moment.utc(obj.DOB).format("MM/DD/YYYY")}</td>
                                                <td align=center>${obj.DriversLicense}</td>
                                                <td align=center>${obj.DLState}</td>
                                            <tr>
                                            `
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Current Address</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Current Address:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${currAddress}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Current Occupancy Type:</label>
                                <div class="col-lg-1">
                                    <input type="text" class="form-control" value="${getBackground.CurrentOccupancyType}" readonly >
                                </div>
                                <label for="name" class="col-lg-1">Move in:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.CurrentAddressMoveIn !== null ? moment.utc(getBackground.CurrentAddressMoveIn).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Reason for Moving:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.LastMoveReason !== null ? getBackground.LastMoveReason : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Landlord Name:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.LastLandlordName !== null ? getBackground.LastLandlordName : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Landlord Phone:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.LastLandlordPhone !== null ? getBackground.LastLandlordPhone : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Landlord Email:</label>
                                <div class="col-lg-3">
                                    <input type="text" class="form-control" value="${getBackground.LastLandlordEmail !== null ? getBackground.LastLandlordEmail : ''}" readonly >
                                </div>
                                <cfif not local.RHAWA>
                                    <label for="name" class="col-lg-2">Contact Landlord:</label>
                                    <div class="col-lg-1">
                                        <input type="text" class="form-control" value="${parseInt(getBackground.LastLandLordContact) === 1 ? "Yes" : "No"}" readonly >
                                    </div>
                                </cfif>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Previous Address</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Previous Residence:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${currAddress2}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Previous Landlord Name:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.PreviousLandlordName !== null ? getBackground.PreviousLandlordName : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Previous Landlord Phone:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousLandlordPhone !== null ? getBackground.PreviousLandlordPhone : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Move in:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousAddressMoveIn !== null ? moment.utc(getBackground.PreviousAddressMoveIn).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Move out:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousAddressMoveOut !== null ? moment.utc(getBackground.PreviousAddressMoveOut).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Current Employer</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-1">Kind:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployeerStatus !== null ? getBackground.CurrentEmployeerStatus : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Self Employed:</label>
                                <div class="col-lg-1">
                                    <input type="text" class="form-control" value="${parseInt(getBackground.CurrentSelfEmployment) === 1 ? 'Yes' : 'No'}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Employer Address:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployeerAddress !== null ? getBackground.CurrentEmployeerAddress : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Supervisor:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployerContact !== null ? getBackground.CurrentEmployerContact : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Supervisor Email:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployeerEmail !== null ? getBackground.CurrentEmployeerEmail : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Supervisor Phone:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployerPhone !== null ? getBackground.CurrentEmployerPhone : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Position:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployeerPosition !== null ? getBackground.CurrentEmployeerPosition : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Start Date:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployeerStartDate !== null ? moment.utc(getBackground.CurrentEmployeerStartDate).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Income:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.CurrentSalary !== null ? `$${parseFloat(getBackground.CurrentSalary).toFixed(2)}` : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Company Name:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.CurrentEmployer !== null ? getBackground.CurrentEmployer : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Previous Employeers</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-1">Kind:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmploymentType !== null ? getBackground.PreviousEmploymentType : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Self Employed:</label>
                                <div class="col-lg-1">
                                    <input type="text" class="form-control" value="${parseInt(getBackground.PreviousSelfEmployment) === 1 ? 'Yes' : 'No'}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Employer Address:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployeerAddress !== null ? getBackground.PreviousEmployeerAddress : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Supervisor:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployerContact !== null ? getBackground.PreviousEmployerContact : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Supervisor Email:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployeerEmail !== null ? getBackground.PreviousEmployeerEmail : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Supervisor Phone:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployerPhone !== null ? getBackground.PreviousEmployerPhone : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Position:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployeerPosition !== null ? getBackground.PreviousEmployeerPosition : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Start Date:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployeerStartDate !== null ? moment.utc(getBackground.PreviousEmployeerStartDate).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">End Date:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployeerEndDate !== null ? moment.utc(getBackground.PreviousEmployeerEndDate).format("MM/DD/YYYY") : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-1">Income:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.PreviousEmployeerIncome !== null ? `$${parseFloat(getBackground.PreviousEmployeerIncome).toFixed(2)}` : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Company Name:</label>
                                <div class="col-lg-3">
                                    <input type="text" class="form-control" value="${getBackground.PreviousCompanyName !== null ? getBackground.PreviousCompanyName : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Other Sources of Income</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Income Sources:</label>
                                <div class="col-lg-10">
                                    <input type="text" class="form-control" value="${getBackground.OtherIncome !== null ? getBackground.OtherIncome : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Vehicles</div>
                        <div class="panel-body">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th align=center>Make</th>
                                        <th align=center>Model</th>
                                        <th align=center>Year</th>
                                        <th align=center>Color</th>
                                        <th align=center>License Plate</th>
                                        <th align=center>License Plate State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${backgroundVehicles.map((obj) => {
                                        return (
                                            `
                                            <tr>
                                                <td align=center>${obj.Make !== null ? obj.Make : ''}</td>
                                                <td align=center>${obj.Model !== null ? obj.Model : ''}</td>
                                                <td align=center>${obj.Year !== null ? obj.Year : ''}</td>
                                                <td align=center>${obj.Color !== null ? obj.Color : ''}</td>
                                                <td align=center>${obj.LicensePlate !== null ? obj.LicensePlate : ''}</td>
                                                <td align=center>${obj.State !== null ? obj.State : ''}</td>
                                            <tr>     
                                            `
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ${renderBank()}
                    <div class="panel panel-primary">
                        <div class="panel-heading">Personal References</div>
                        <div class="panel-body">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th align=center>Name</th>
                                        <th align=center>Relationship</th>
                                        <th align=center>Occupation</th>
                                        <th align=center>Address</th>
                                        <th align=center>Phone</th>
                                        <th align=center>eMail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${backgroundReferences.map((obj) => {
                                        return (
                                            `
                                            <tr>
                                                <td align=center>${obj.Name !== null ? obj.Name : ''}</td>
                                                <td align=center>${obj.Relationship !== null ? obj.Relationship : ''}</td>
                                                <td align=center>${obj.Occupation !== null ? obj.Occupation : ''}</td>
                                                <td align=center>${obj.Address !== null ? obj.Address : ''}</td>
                                                <td align=center>${obj.Phone !== null ? obj.Phone : ''}</td>
                                                <td align=center>${obj.Email !== null ? obj.Email : ''}</td>
                                            <tr>     
                                            `
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Emergency Contact</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Name:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.EmergencyName !== null ? getBackground.EmergencyName : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">Relationship:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.EmergencyRelationship !== null ? getBackground.EmergencyRelationship : ''}" readonly >
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Phone:</label>
                                <div class="col-lg-2">
                                    <input type="text" class="form-control" value="${getBackground.EmergencyPhone !== null ? getBackground.EmergencyPhone : ''}" readonly >
                                </div>
                                <label for="name" class="col-lg-2">eMail:</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" value="${getBackground.EmergencyEmail !== null ? getBackground.EmergencyEmail : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Comments</div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label for="name" class="col-lg-2">Comments:</label>
                                <div class="col-lg-10">
                                    <input type="text" class="form-control" value="${getTenant.ProspectComments !== null ? getTenant.ProspectComments : ''}" readonly >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel panel-primary">
                        <div class="panel-heading">Other Questions</div>
                        <div class="panel-body">
                            ${tenantResponses.length > 0 ? renderTenantResponse(tenantResponses) : ''}
                        </div>
                    </div>
                    ${renderAcknowledgment()}
                    ${renderSignature()}
                </form>
        `;

    let options = { 
        format: 'letter',
        margin: {
            right: '40px',
            left: '40px'
        } 
    };
    let file = { content };
    html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
        const destination = `/wwwroot/rent/ApplicantsPDF/${getTenant.PropertyID}/${data.tenantID}`;
            console.log(destination)
        const ftp = new FTPClient();
        ftp.on('ready', function() {
            ftp.mkdir(destination, function(err) {
                if(err) console.log('Directory: ', err);
                ftp.put(pdfBuffer, `${destination}/Application.pdf`, function(err) {
                    if(err) console.log('pdf: ', err)
                    ftp.end()
                }); 
            });
        });

        ftp.connect({
            host: "65.175.100.94",
            user: "giovanniperazzo",
            password: "iRent4Now!", 
        });
    });

    return 0;
}

exports.getDeniedProspects = async (req, res, next) => {
    try {
        const { propertyID, fromDt } = req.body.data || req.body;
        const property = await models.Properties.getByID(propertyID);
        const applicants = await models.Tenants.getDeniedProspects(propertyID, fromDt);
        const backgroundScreening = new Map();
        for(const app of applicants) {
            if(parseInt(property.BackgroundScreening) !== 1) {
                // tazworks
                const temp = [];
                const tenantReport = await models.TazWorks.getByTenantID(parseInt(app.TenantID));
                temp.push({ name: null, report: tenantReport });

                const othersOnLease = await models.TenantOthersOnLease.getListByTenantID(parseInt(app.TenantID));
                for(const ool of othersOnLease) {
                    const report = await models.TazWorks.getByOthersOnLease({
                        tenantID: parseInt(app.TenantID),
                        othersOnLeaseID: parseInt(ool.TenantsOthersOnLeaseID)
                    });
                    temp.push({
                        name: `${ool.FirstName} ${ool.LastName}`,
                        othersOnLeaseID: ool.TenantsOthersOnLeaseID,
                        report
                    });
                }
                backgroundScreening.set(parseInt(app.TenantID), temp);
            } else {
                // CIC
                const temp = [];
                const tenantReport = await models.CreditCheckLog.getByTenantID(parseInt(app.TenantID));
                temp.push({ name: null, report: tenantReport });

                const othersOnLease = await models.TenantOthersOnLease.getListByTenantID(parseInt(app.TenantID));
                for(const ool of othersOnLease) {
                    const report = await models.CreditCheckLog.getByOthersOnLeaseID(parseInt(ool.TenantsOthersOnLeaseID));
                    temp.push({
                        name: `${ool.FirstName} ${ool.LastName}`,
                        othersOnLeaseID: ool.TenantsOthersOnLeaseID,
                        report,
                    });
                }
                backgroundScreening.set(parseInt(app.TenantID), temp);
            }
        }   
            
        return res.json({
            applicants,
            backgroundScreening: Object.fromEntries(backgroundScreening)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getDeniedProspects"
        );
        return res.json([]);
    }  
}

exports.removeProspect = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        await models.Tenants.remove(tenantID);

        return res.json(0)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - removeProspect"
        );
        return res.json(-1);
    }  
}

exports.addProspectApplicant = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const tenantID = await models.Tenants.addProspectApplicant({
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            ssn: data.ssn,
            comment: data.comment,
            startDate: data.startDate,
            unitTypeID: data.unitTypeID,
            prospect: data.prospect,
            propertyID: data.propertyID,
            userID: data.userID,
            leadSourceID: data.leadSourceID,
            otherOnLease: data.otherOnLease
        });
        if(tenantID === 0)  return res.json(-1);

        await models.Background.addNewProspectApplicant({
            tenantID,
            lastLandlordName: data.lastLandlordName,
            lastLandlordPhone: data.lastLandlordPhone,
            previousLandlordName: data.previousLandlordName,
            previousLandlordPhone: data.previousLandlordPhone,
            currentEmployer: data.currentEmployer,
            currentEmployerContact: data.currentEmployerContact,
            currentEmployerPhone: data.currentEmployerPhone,
            currentSalary: data.currentSalary,
            previousEmployer: data.previousEmployer,
            previousEmployerContact: data.previousEmployerContact,
            previousEmployerPhone: data.previousEmployerPhone,
            DOB: data.DOB,
            houseNumber: data.houseNumber,
            street: data.street,
            unit: data.unit,
            city: data.city,
            state: data.state,
            zip: data.zip,
            houseNumber2: data.houseNumber2,
            street2: data.street2,
            city2: data.city2,
            state2: data.state2,
            zip2: data.zip2,
            unit2: data.unit2,
            driversLicense: data.driversLicense,
            DLState: data.DLState,
            desiredMoveInDate: data.desiredMoveInDate !== undefined ? data.desiredMoveInDate : moment.utc().format("YYYY-MM-DD"),
            desiredLeaseTerm: data.desiredLeaseTerm !== undefined ? data.desiredLeaseTerm : '',
            desiredRent: data.desiredRent !== undefined ? data.desiredRent : 0,
            formerName: data.formerName !== undefined ? data.formerName : '',
            currentOccupancyType: data.currentOccupancyType !== undefined ? data.currentOccupancyType : '',
            lastRentAmount: data.lastRentAmount !== undefined ? data.lastRentAmount : 0,
            lastMoveReason: data.lastMoveReason !== undefined ? data.lastMoveReason : '',
            lastLandlordEmail: data.lastLandlordEmail !== undefined ? data.lastLandlordEmail : '',
            lastLandlordContact: data.lastLandlordContact !== undefined ? data.lastLandlordContact : '',
            currentEmployeerStatus: data.currentEmployeerStatus !== undefined ? data.currentEmployeerStatus : '',
            currentEmploymentType: data.currentEmploymentType !== undefined ? data.currentEmploymentType : '',
            currentSelfEmployment: data.currentSelfEmployment !== undefined ? data.currentSelfEmployment : '',
            currentEmployeerEmail: data.currentEmployeerEmail !== undefined ? data.currentEmployeerEmail : '',
            currentEmployeerAddress: data.currentEmployeerAddress !== undefined ? data.currentEmployeerAddress : '',
            currentEmployeerPosition: data.currentEmployeerPosition !== undefined ? data.currentEmployeerPosition : '',
            previousEmploymentType: data.previousEmploymentType !== undefined ? data.previousEmploymentType : '',
            previousSelfEmployment: data.previousSelfEmployment !== undefined ? data.previousSelfEmployment : '',
            previousEmployeerEmail: data.previousEmployeerEmail !== undefined ? data.previousEmployeerEmail : '',
            previousEmployeerAddress: data.previousEmployeerAddress !== undefined ? data.previousEmployeerAddress : '',
            previousEmployeerPosition: data.previousEmployeerPosition !== undefined ? data.previousEmployeerPosition : '',
            previousEmployeerIncome: data.previousEmployeerIncome !== undefined ? data.previousEmployeerIncome : 0,
            otherIncome: data.otherIncome !== undefined ? data.otherIncome : '',
            pets: data.pets !== undefined ? data.pets : '',
            vehicleMake: data.vehicleMake !== undefined ? data.vehicleMake : '',
            vehicleModel: data.vehicleModel !== undefined ? data.vehicleModel : '',
            vehicleYear: data.vehicleYear !== undefined ? data.vehicleYear : '',
            vehicleColor: data.vehicleColor !== undefined ? data.vehicleColor : '',
            vehicleLicensePlate: data.vehicleLicensePlate !== undefined ? data.vehicleLicensePlate : '',
            vehicleLicensePlateState: data.vehicleLicensePlateState !== undefined ? data.vehicleLicensePlateState : '',
            prospectBank: data.prospectBank !== undefined ? data.prospectBank : '',
            prospectBankPhone: data.prospectBankPhone !== undefined ? data.prospectBankPhone : '',
            prospectBankAccount: data.prospectBankAccount !== undefined ? data.prospectBankAccount : '',
            referenceName: data.referenceName !== undefined ? data.referenceName : '',
            referenceRelationship: data.referenceRelationship !== undefined ? data.referenceRelationship : '',
            referenceOccupation: data.referenceOccupation !== undefined ? data.referenceOccupation : '',
            referenceAddress: data.referenceAddress !== undefined ? data.referenceAddress : '',
            referencePhone: data.referencePhone !== undefined ? data.referencePhone : '',
            referenceEmail: data.referenceEmail !== undefined ? data.referenceEmail : '',
            emergencyName: data.emergencyName !== undefined ? data.emergencyName : '',
            emergencyRelationship: data.emergencyRelationship !== undefined ? data.emergencyRelationship : '',
            emergencyPhone: data.emergencyPhone !== undefined ? data.emergencyPhone : '',
            emergencyEmail: data.emergencyEmail !== undefined ? data.emergencyEmail : ''
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - addProspectApplicant"
        );
        return res.json(-1);
    }  
}

exports.getCompanyDetails = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await models.Company.get(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getCompanyDetails"
        );
        return res.json(null);
    }  
}

exports.getBackgroundPackages = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await models.BackgroundScreenings.getPackages(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getBackgroundPackages"
        );
        return res.json([]);
    }  
}

exports.getApplicantCreditCard = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        return res.json(await models.ApplicantCreditCard.getByTenant(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getApplicantCreditCard"
        );
        return res.json(null);
    }  
}

exports.getTentOthersOnLeaseByID = async (req, res, next) => {
    try {
        const toolID = req.params.tolID;
            
        return res.json(await models.TenantOthersOnLease.getByID(toolID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTentOthersOnLeaseByID"
        );
        return res.json(null);
    }  
}

exports.getTenantUnitType = async (req, res, next) => {
    try {
        const unitTypeID = req.params.utID;
            
        return res.json(await models.UnitTypes.getByID(unitTypeID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTenantUnitType"
        );
        return res.json(null);
    }  
}

exports.getTenantLeadSource = async (req, res, next) => {
    try {
        const leadSourceID = req.params.lsID;
            
        return res.json(await models.LeadSource.get(leadSourceID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTenantLeadSource"
        );
        return res.json(null);
    }  
}

exports.getTenantVehicles = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await models.BackgroundVehicles.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTenantVehicles"
        );
        return res.json([]);
    }  
}

exports.getTenantReferences = async (req, res, next) => {
    try {
        const tenantID = req.params.tID;
        
        return res.json(await await models.BackgroundReferences.getByTenantID(tenantID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTenantReferences"
        );
        return res.json([]);
    }  
}

exports.getRunBSDetails = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        if(data.backgroundScreening !== null && data.backgroundScreening !== 0)
            return res.json(await models.BackgroundScreenings.getByID(data.backgroundScreening));

        return res.json(await models.BackgroundScreenings.getByProperty(data.propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getRunBSDetails"
        );
        return res.json(-1);
    }  
}

exports.getVicTigSignUpData = async (req, res, next) => {
    try {
        const companyID = req.params.cID;

        const escapeRegExp = (string) => {
            return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        const replaceAll = (str, find, replace) => {
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        }

        const company = await models.Company.get(companyID);

        let clientService = await models.HtmlForms.getByID(2);
        if(clientService !== null)
            clientService = clientService.HtmlData;

        clientService = replaceAll(clientService, "#CompanyName#", company.CompanyName);
        clientService = replaceAll(clientService, "#currentDate#", moment.utc().format("MM/DD/YYYY"));
        clientService = replaceAll(clientService, "#ClientName#", `${company.ContactFName} ${company.ContactLName}`);
        clientService = replaceAll(clientService, "#ClientEmail#", company.ContactEmail);
        clientService = replaceAll(clientService, "#ClientAddress#", `${company.CompanyAdd}, ${company.CompanyCity}, ${company.CompanyState} ${company.CompanyZip}`);

        let creditAddendum = await models.HtmlForms.getByID(3);
        if(creditAddendum !== null)
            creditAddendum = creditAddendum.HtmlData;

        creditAddendum = replaceAll(creditAddendum, "#CompanyName#", company.CompanyName);
        creditAddendum = replaceAll(creditAddendum, "#currentDate#", moment.utc().format("MM/DD/YYYY"));
        creditAddendum = replaceAll(creditAddendum, "#CurrentDate#", moment.utc().format("MM/DD/YYYY"));
        creditAddendum = replaceAll(creditAddendum, "#RepresentativeName#", `${company.ContactFName} ${company.ContactLName}`);
        creditAddendum = replaceAll(creditAddendum, "#CompanyAddress#", `${company.CompanyAdd}, ${company.CompanyCity}, ${company.CompanyState} ${company.CompanyZip}`);
        
        return res.json({
            clientService,
            creditAddendum
        })
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getOthersOnLease"
        );
        return res.json(null);
    }  
}

exports.submitVicTigDocs = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const escapeRegExp = (string) => {
            return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        const replaceAll = (str, find, replace) => {
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        }

        const company = await models.Company.get(data.companyID);
        const atts = [];

        let clientService = await models.HtmlForms.getByID(2);
        if(clientService !== null)
            clientService = clientService.HtmlData;

        clientService = replaceAll(clientService, "#CompanyName#", company.CompanyName);
        clientService = replaceAll(clientService, "#currentDate#", moment.utc().format("MM/DD/YYYY"));
        clientService = replaceAll(clientService, "#ClientName#", `${company.ContactFName} ${company.ContactLName}`);
        clientService = replaceAll(clientService, "#ClientEmail#", company.ContactEmail);
        clientService = replaceAll(clientService, "#ClientAddress#", `${company.CompanyAdd}, ${company.CompanyCity}, ${company.CompanyState} ${company.CompanyZip}`);
            
        let options = { 
            format: 'letter',
            margin: {
                right: '40px',
                left: '40px'
            } 
        };
        let content = clientService
        let file = { content };
        await html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            console.log(pdfBuffer)
            atts.push({
                filename: `Agreement.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf"
            })
        });

        let creditAddendum = await models.HtmlForms.getByID(3);
        if(creditAddendum !== null)
            creditAddendum = creditAddendum.HtmlData;

        creditAddendum = replaceAll(creditAddendum, "#CompanyName#", company.CompanyName);
        creditAddendum = replaceAll(creditAddendum, "#currentDate#", moment.utc().format("MM/DD/YYYY"));
        creditAddendum = replaceAll(creditAddendum, "#CurrentDate#", moment.utc().format("MM/DD/YYYY"));
        creditAddendum = replaceAll(creditAddendum, "#RepresentativeName#", `${company.ContactFName} ${company.ContactLName}`);
        creditAddendum = replaceAll(creditAddendum, "#CompanyAddress#", `${company.CompanyAdd}, ${company.CompanyCity}, ${company.CompanyState} ${company.CompanyZip}`);
        creditAddendum = replaceAll(creditAddendum, "#CustomerName#", `${company.ContactFName} ${company.ContactLName}`);
        creditAddendum = replaceAll(creditAddendum, "#CustomerSignature#", `${company.ContactFName} ${company.ContactLName}`);
        creditAddendum = replaceAll(creditAddendum, "#SignatureDateTime#", moment.utc().format("MM/DD/YYYY"));
        
        content = creditAddendum;
        file = { content };
        await html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            atts.push({
                filename: `Addendum.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf"
            })
        }).catch((err) => {
            console.log(err)
        });
        
        if(data.letterIntent) {
            let letterIntent = await models.HtmlForms.getByID(3);
            if(letterIntent !== null)
                letterIntent = letterIntent.HtmlData;

            letterIntent = replaceAll(letterIntent, "#CurrentDate#", moment.utc().format("MM/DD/YYYY"));
            letterIntent = replaceAll(letterIntent, "#CustomerName#", `${company.ContactFName} ${company.ContactLName}`);
            letterIntent = replaceAll(letterIntent, "#CompanyStreetAddress#", company.CompanyAdd);
            letterIntent = replaceAll(letterIntent, "#CompanyCitySTZip#", `${company.CompanyCity}, ${company.CompanyState} ${company.CompanyZip}`);
            letterIntent = replaceAll(letterIntent, "#NatureOfBusiness#", data.natureOfBusiness);
            letterIntent = replaceAll(letterIntent, "#IntentService#", data.intentService);
            letterIntent = replaceAll(letterIntent, "#MonthlyVolume#", data.monthlyVolume);
            letterIntent = replaceAll(letterIntent, "#AccessIntent#", data.accessIntent);
            letterIntent = replaceAll(letterIntent, "#CustomerSignature#", `${company.ContactFName} ${company.ContactLName}`);
            letterIntent = replaceAll(letterIntent, "#SignatureDateTime#", moment.utc().format("MM/DD/YYYY"));
            
            content = letterIntent;
            file = { content };
            await html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
                atts.push({
                    filename: `LetterIntent.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf"
                })
            });
        }

        await models.AddOnProducts.add(data.companyID);

        const sendEmail = new Email();
        const emailTransporter = sendEmail.getTransporter();
        const bodyMsg = `
            Attached are PDF files with the information you requested.
            <br /><br />
            Best Wishes,
            <br /><br />
            <b>iRent</b>
        `;
        await emailTransporter.sendMail({
            from: 'support@myirent.com', 
            to: 'mvisser@victig.com, natei@victig.com, support@myirent.com', 
            subject: `${company.CompanyName} signed for VICTIG tenant screening services`, 
            html: bodyMsg,
            attachments: atts
        }); 
        return res.json(0)
        
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - submitVicTigDocs"
        );
        return res.json(-1);
    }  
}

exports.companyNeedToSignUpScreening = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        
        const addOn = await models.AddOnProducts.getByCompany(companyID)
        if(addOn !== null)    
            return res.json(false);

        return res.json(true);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Applicants Controller - getTenantReferences"
        );
        return res.json(true);
    }  
}