const ftp = require("basic-ftp");
const urlExists = require('url-exists');
const Email = require('../../util/email');
const moment = require('moment');

const VendorsModel = require('../../models/vendors');
const ExpenseTypeModel = require('../../models/expenseType');
const LendersModel = require('../../models/lenders');
const UnitsModel = require('../../models/units');
const CheckRegisterModel = require('../../models/checkRegister');
const JournalModel = require('../../models/journal');
const ReceiptsModel = require('../../models/receipts');
const FrequencyModel = require('../../models/frequency');
const PostMethodModel = require('../../models/postMethod');
const RecurringBillsModel = require('../../models/recurringbills');
const ReceiptRecurringModel = require('../../models/receiptsRecurring');
const PropertiesModel = require('../../models/properties');

const Vendors = new VendorsModel();
const ExpenseType = new ExpenseTypeModel();
const Lenders = new LendersModel();
const Units = new UnitsModel();
const CheckRegister = new CheckRegisterModel();
const Journal = new JournalModel();
const Receipts = new ReceiptsModel();
const Frequency = new FrequencyModel();
const PostMethod = new PostMethodModel();
const RecurringBills = new RecurringBillsModel();
const ReceiptRecurring = new ReceiptRecurringModel();
const Properties = new PropertiesModel();

exports.getPayees = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Vendors.getByCompanyID(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getPayees"
        );
        return res.json([]);
    }   
}

exports.getExpenseTypes = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await ExpenseType.getByCompanyID(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getExpenseTypes"
        );
        return res.json([]);
    }   
}

exports.getLenders = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Lenders.getByCompanyID(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getLenders"
        );
        return res.json([]);
    }   
}

exports.getUnits = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await Units.getByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getUnits"
        );
        return res.json([]);
    }   
}

exports.getUnpaidBills = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const getUnpaid = await CheckRegister.getUnpaidBills({
            multiProp: data.multiProp,
            pID: data.propertyID,
            uID: data.userID
        });
        return res.json(getUnpaid);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getUnpaidBills"
        );
        return res.json([]);
    }   
}

exports.deleteBill = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        await CheckRegister.delete(checkRegisterID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - deleteBill"
        );
        return res.json("Error processing your request. Please contact us.");
    }   
}

exports.markPaid = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        const userID = req.params.uID;
        await CheckRegister.markPaid(checkRegisterID, userID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - markPaid"
        );
        return res.json("Error processing your request. Please contact us.");
    }   
}

exports.markUnpaid = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        const userID = req.params.uID;
        await CheckRegister.markUnpaid(checkRegisterID, userID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - markUnpaid"
        );
        return res.json("Error processing your request. Please contact us.");
    }   
}

exports.add = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const addBill = {
            propertyID: parseInt(data.propertyID),
            vendorID: parseInt(data.vendorID),
            amount: parseFloat(data.amount).toFixed(2),
            memo: data.memo === undefined ? '' : data.memo.toString().replace(/['"]+/g, ''),
            expenseTypeID: parseInt(data.expenseTypeID),
            escrow: data.escrow ? 1 : 0,
            invoiceDate: moment(data.invoiceDate),
            invoiceNumber: data.invoiceNumber === undefined ? '' : data.invoiceNumber.toString().replace(/['"]+/g, ''),
            userID: parseInt(data.userID),
            unitID: data.unitID === undefined || data.unitID === '' ? 0 : parseInt(data.unitID)
        };
        const crID = await CheckRegister.add(addBill);
        if(crID <= 0)
            return res.json("Error processing your request. Please, contact us.");

        // Is Mortgage Principle OR Utility Deposit
        if(parseInt(data.expenseTypeID) === 18 || parseInt(data.expenseTypeID) === 29800) {
            let lenderName = 'Utility Deposit';
            if(parseInt(data.expenseTypeID) === 18)
                lenderName = await Lenders.getLenderName(data.lenderID);
            
            const desc = `Loan - ${lenderName}`;
            let journalType = 5;
            let amount = parseFloat(data.amount) * -1;
            if(parseInt(data.expenseTypeID) === 29800) {
                journalType = 8;
                amount = parseFloat(data.amount);
            }
            await Journal.add({
                propertyID: parseInt(data.propertyID),
                journalType,
                amount,
                userID: parseInt(data.userID),
                description: desc,
                lenderID: parseInt(data.lenderID),
                checkRegisterID: crID
            });
        }
        
        if(data.hasFile) {
            const dt = new Date();
            const month = (dt.getMonth() + 1).toString().padStart(2, "0");
            let path = `/wwwroot/rent/Receipts/${data.propertyID}/${dt.getFullYear()}/${month}`;
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

        return res.json(crID);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - deleteBill"
        );
        return res.json("Error processing your request. Please contact us.");
    }   
}

exports.addBillReceipt = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await Receipts.add({
            checkRegisterID: data.checkRegisterID,
            propertyID: data.propertyID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - addBillReceipt"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.getPaidBills = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        return res.json(await CheckRegister.getPaidBills({
            startDate: data.startDate,
            endDate: data.endDate,
            vendorID: data.vendorID,
            propertyID: data.propertyID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getPaidBills"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.isCheckRegisterClosedOut = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        return res.json(await CheckRegister.isClosedOut(checkRegisterID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getPaidBills"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.billUploadedApp = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const path = `https://myirent.com/rent/iRentAppIMG/Bills/${data.propertyID}/CRID_${data.checkRegisterID}.png`;
        urlExists(path, function(err, exists) {
            if(exists)
                return res.json(`./iRentAppIMG/Bills/${data.propertyID}/CRID_${data.checkRegisterID}.png`);
            else
                return res.json('');
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - billUploadedApp"
        );
        return res.json("Error processing your request. Please contact us.");
    } 
}

exports.getFrequency = async (req, res, next) => {
    try {
        return res.json(await Frequency.get());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getFrequency"
        );
        return res.json("Error processing your request. Please contact us.");
    } 
}

exports.getPostMethod = async (req, res, next) => {
    try {
        return res.json(await PostMethod.get());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getPostMethod"
        );
        return res.json("Error processing your request. Please contact us.");
    } 
}

exports.getRecurringBills = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await RecurringBills.getBills({
            multiProp: data.multiProp,
            userID: data.userID,
            propertyID: data.propertyID
        })); 
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getRecurringBills"
        );
        return res.json("Error processing your request. Please contact us.");
    } 
}

exports.deleteRecurring = async (req, res, next) => {
    try {
        const recurringBillID = req.params.rbID;
        await RecurringBills.delete(recurringBillID);
        return res.json(0); 
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - deleteRecurring"
        );
        return res.json("Error processing your request. Please contact us.");
    } 
}

exports.addRecurring = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        const add = await RecurringBills.add({
            propertyID: data.propertyID,
            vendorID: data.vendorID,
            amount: parseFloat(data.amount).toFixed(2),
            memo: data.memo === undefined ? '' : data.memo.toString().replace(/['"]+/g, ''),
            expenseTypeID: data.expenseTypeID,
            firstPayDate: new Date(data.firstPayDate + ' 00:00:00'),
            escrow: data.escrow ? 1 : 0,
            invoiceNumber: data.invoiceNumber === undefined ? '' : data.invoiceNumber.toString().replace(/['"]+/g, ''),
            userID: data.userID,
            frequencyID: data.frequencyID,
            postMethodID: data.postMethodID,
            unlimited: data.unlimited ? 1 : 0,
            numPayments: data.numPayments === '' ? 0 : data.numPayments,
            paid: data.paid ? 1 : 0
        });
            
        if(add <= 0)
            return res.json("Error processing your request. Please, contact us.");

        if(data.hasFile) {
            const dt = new Date();
            const month = (dt.getMonth() + 1).toString().padStart(2, "0");
            let path = `/wwwroot/rent/ReceiptsRecurring/${data.propertyID}/${dt.getFullYear()}/${month}`;
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

        return res.json(add);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getRecurringBills"
        );
        return res.json("Error processing your request. Please contact us.");
    } 
}

exports.addRecurringReceipt = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await ReceiptRecurring.add({
            recurringBillID: data.recurringBillID,
            propertyID: data.propertyID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - addRecurringReceipt"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.getUserProperties = async (req, res, next) => {
    try {
        const userID = req.params.uID;

        return res.json(await Properties.getUsersProperties(userID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getUserProperties"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.getPayeeUpdate = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const vendorID = req.params.vID;

        return res.json(await CheckRegister.getPayeeUpdate({
            propertyID,
            vendorID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getPayeeUpdate"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.markAllPaid = async (req, res, next) => {
    try {
        const data = req.body.data || req.body; 
        await CheckRegister.markAllPaid(data.crIDs, data.userID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - markAllPaid"
        );
        return res.json("Error processing your request. Please contact us.");
    }   
}

exports.getDupes = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        return res.json(await CheckRegister.getByPropertyID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Bills Controller - getDupes"
        );
        return res.json("Error processing your request. Please contact us.");
    }   
}