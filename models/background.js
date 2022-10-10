const db = require('../util/database');
const moment = require("moment");

const today = new Date();
const formattedDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = class Tenants {

    async getByTenantID(tID) {
        let response = null;
        try {
            const res = await db.execute(`
                SELECT * FROM Background Where TenantID = ${tID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addTransfer(data) {
        try {
            await db.execute(`
                INSERT INTO  Background (TenantID, LastResidence, LastLandlordName, LastLandlordPhone, 
                    PreviousResidence, PreviousLandlordName, PreviousLandlordPhone, CurrentEmployer, 
                    CurrentEmployerContact, CurrentEmployerPhone, CurrentSalary, PreviousEmployer, 
                    PreviousEmployerContact, PreviousEmployerPhone, DOB, ApproveID, ApproveComment, 
                    Vehicle1, Vehicle2, Vehicle3)
                VALUES (${data.tenantID}, '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', 
                    '0', '0', '${formattedDate(data.DOB)}', '4', '', '0', '0', '0');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updateTransfer(data) {
        try {
            await db.execute(`
                UPDATE Background
                SET DOB = '${formattedDate(data.DOB)}'
                WHERE BackgroundID = ${data.backgroundID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updTenantDetails(data) {
        try {
            await db.execute(`
                UPDATE Background
                SET DriversLicense = '${data.dl}',
                    DLState = '${data.dlState}',
                    DOB = '${formattedDate(data.DOB)}'
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async update(data) {
        try {
            await db.execute(`
                UPDATE Background
                SET HouseNumber = '${data.houseNumber}',
                    StreetName = '${data.street}',
                    Unit = '${data.unit}',
                    City = '${data.city}',
                    State = '${data.state}',
                    Zip = '${data.zip}',
                    LastLandlordName = '${data.landlordName}',
                    LastLandlordPhone = '${data.landlordPhone}',
                    HouseNumber2 = '${data.prevHouseNumber}',
                    StreetName2 = '${data.prevStreet}',
                    City2 = '${data.prevCity}',
                    State2 = '${data.prevState}',
                    Zip2 = '${data.prevZip}',
                    PreviousLandlordName = '${data.prevLandlordName}',
                    PreviousLandlordPhone = '${data.prevLandlordPhone}',
                    CurrentEmployer = '${data.employer}',
                    CurrentEmployerContact = '${data.employerContact}',
                    CurrentEmployerPhone = '${data.employerPhone}',
                    CurrentSalary = ${data.employerSalary},
                    PreviousEmployer = '${data.prevEmployer}',
                    PreviousEmployerContact = '${data.prevEmployerContact}',
                    PreviousEmployerPhone = '${data.prevEmployerPhone}',
                    DriversLicense = '${data.driversLicense}',
                    DLState = '${data.dlState}'
                WHERE TenantID = ${data.tenantID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async addProspectApplicant(data) {
        try {
            await db.execute(`
                INSERT INTO  Background (TenantID, DOB, DriversLicense, DLState, CurrentSalary, CurrentEmployer,  
                    CurrentEmployerContact, CurrentEmployerPhone, PreviousEmployer, PreviousEmployerContact, 
                    PreviousEmployerPhone, HouseNumber, StreetName, City, State, Zip, LastLandlordName,
                    LastLandlordPhone, HouseNumber2, StreetName2, City2, State2, Zip2, PreviousLandlordName,
                    PreviousLandlordPhone)
                VALUES (${data.tenantID}, '${moment.utc(data.dob).format("YYYY-MM-DD")}', '${data.driversLicense}', '${data.dlState}', ${data.currSalary}, '${data.currEmployer}', 
                    '${data.currEmployerContact}', '${data.currEmployerPhone}', '${data.prevEmployer}', 
                    '${data.prevEmployerContact}', '${data.prevEmployerPhone}', ${data.houseNumber}, '${data.streetName}', 
                    '${data.city}', '${data.state}', '${data.zip}', '${data.lastLandlordName}',
                    '${data.lastLandlordPhone}', '${data.houseNumber2}', '${data.streetName2}', '${data.city2}', 
                    '${data.state2}', '${data.zip2}', '${data.prevLandlordName}', '${data.prevLandlordPhone}');
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updProspectApplicant(data) {
        try {
            await db.execute(`
                UPDATE Background
                SET DriversLicense = '${data.driversLicense}',
                    DOB = '${moment.utc(data.dob).format("YYYY-MM-DD")}',
                    DLState = '${data.dlState}',
                    CurrentSalary = ${parseFloat(data.currSalary).toFixed(2)},
                    CurrentEmployer = '${data.currEmployer}',
                    CurrentEmployerContact = '${data.currEmployerContact}',
                    CurrentEmployerPhone = '${data.currEmployerPhone}',
                    PreviousEmployer = '${data.prevEmployer}',
                    PreviousEmployerContact = '${data.prevEmployerContact}',
                    PreviousEmployerPhone = '${data.prevEmployerPhone}',
                    HouseNumber = ${data.houseNumber},
                    StreetName = '${data.streetName}',
                    City = '${data.city}',
                    State = '${data.state}',
                    Zip = '${data.zip}',
                    LastLandlordName = '${data.lastLandlordName}',
                    LastLandlordPhone = '${data.lastLandlordPhone}',
                    HouseNumber2 = '${data.houseNumber2}',
                    StreetName2 = '${data.streetName2}',
                    City2 = '${data.city2}',
                    State2 = '${data.state2}',
                    Zip2 = '${data.zip2}',
                    PreviousLandlordName = '${data.prevLandlordName}',
                    PreviousLandlordPhone = '${data.prevLandlordPhone}'
                WHERE backgroundID = ${data.backgroundID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async updReview(data) {
        try {
            await db.execute(`
                UPDATE Background
                SET ApproveComment = '${data.comment}',
                    ApproveID = ${data.approve}
                WHERE backgroundID = ${data.backgroundID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async addNewProspectApplicant(data) {
        try {
            const lastResidence = `${data.houseNumber.toString()} ${data.street} ${data.unit}, ${data.city} ${data.state} ${data.zip}`;
            const previousResidence = `${data.houseNumber2.toString()} ${data.street2} ${data.unit2} ${data.city2} ${data.state2} ${data.zip2}`
            await db.execute(`
                INSERT INTO  Background (TenantID, LastResidence, LastLandlordName, LastLandlordPhone, PreviousResidence, PreviousLandlordName, 
                    PreviousLandlordPhone, CurrentEmployer, CurrentEmployerContact, CurrentEmployerPhone, CurrentSalary, PreviousEmployer, 
                    PreviousEmployerContact, PreviousEmployerPhone, DOB, ApproveID, ApproveComment, HouseNumber, StreetName, Unit, City, State, Zip, 
                    HouseNumber2, StreetName2, City2, State2, Zip2, Unit2, Vehicle1, Vehicle2, Vehicle3, DriversLicense, DLState, DesiredMoveInDate, 
                    DesiredLeaseTerm , DesiredRent , FormerName , CurrentOccupancyType , LastRentAmount , LastMoveReason, 
                    LastLandlordEmail , LastLandlordContact , CurrentEmployeerStatus , CurrentEmploymentType , CurrentSelfEmployment, 
                    CurrentEmployeerEmail , CurrentEmployeerAddress , CurrentEmployeerPosition , PreviousEmploymentType, 
                    PreviousSelfEmployment , PreviousEmployeerEmail , PreviousEmployeerAddress , PreviousEmployeerPosition , PreviousEmployeerIncome, 
                    OtherIncome , Pets , VehicleMake , VehicleModel , VehicleYear, 
                    VehicleColor , VehicleLicensePlate , VehicleLicensePlateState , ProspectBank , ProspectBankPhone , ProspectBankAccount, 
                    ReferenceName , ReferenceRelationship , ReferenceOccupation , ReferenceAddress , ReferencePhone , ReferenceEmail, EmergencyName, 
                    EmergencyRelationship , EmergencyPhone , EmergencyEmail)
                VALUES (
                    ${data.tenantID}, '${lastResidence}', '${data.lastLandlordName}', '${data.lastLandlordPhone}', '${previousResidence}',
                    '${data.previousLandlordName}', '${data.previousLandlordPhone}', '${data.currentEmployer}', '${data.currentEmployerContact}',
                    '${data.currentEmployerPhone}', ${parseFloat(data.currentSalary).toFixed(2)}, '${data.previousEmployer}', '${data.previousEmployerContact}',
                    '${data.previousEmployerPhone}', '${moment.utc(data.DOB).format("YYYY-MM-DD")}', 5, '', '${data.houseNumber.toString()}',
                    '${data.street}', '${data.unit}', '${data.city}', '${data.state}', '${data.zip}', '${data.houseNumber2.toString()}',
                    '${data.street2}', '${data.city2}', '${data.state2}', '${data.zip2}', '${data.unit2}', '', '', '', '${data.driversLicense}',
                    '${data.DLState}', '${moment.utc(data.desiredMoveInDate).format("YYYY-MM-DD")}', '${data.desiredLeaseTerm}', ${parseFloat(data.desiredRent).toFixed(2)},
                    '${data.formerName}', '${data.currentOccupancyType}', ${parseFloat(data.lastRentAmount).toFixed(2)}, '${data.lastMoveReason}',
                    '${data.lastLandlordEmail}', '${data.lastLandlordContact}',
                    '${data.currentEmployeerStatus}', '${data.currentEmploymentType}', '${data.currentSelfEmployment}', '${data.currentEmployeerEmail}',
                    '${data.currentEmployeerAddress}', '${data.currentEmployeerPosition}',
                    '${data.previousEmploymentType}', '${data.previousSelfEmployment}', '${data.previousEmployeerEmail}', '${data.previousEmployeerAddress}',
                    '${data.previousEmployeerPosition}', ${parseFloat(data.previousEmployeerIncome).toFixed(2)}, 
                    '${data.otherIncome}', '${data.pets}', '${data.vehicleMake}',
                    '${data.vehicleModel}', '${data.vehicleYear}', '${data.vehicleColor}', '${data.vehicleLicensePlate}', '${data.vehicleLicensePlateState}',
                    '${data.prospectBank}', '${data.prospectBankPhone}', '${data.prospectBankAccount}', '${data.referenceName}', '${data.referenceRelationship}',
                    '${data.referenceOccupation}', '${data.referenceAddress}', '${data.referencePhone}', '${data.referenceEmail}', '${data.emergencyName}',
                    '${data.emergencyRelationship}', '${data.emergencyPhone}', '${data.emergencyEmail}'
                );
            `);
        } catch(err) {
            console.log(err);
        }
    }
}