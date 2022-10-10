const ftp = require("basic-ftp");
const Email = require('../../util/email');

const CheckRegisterModel = require('../../models/checkRegister');
const JournalModel = require('../../models/journal');
const TenantTransactionsModel = require('../../models/tenantTransactions');
const ReconcileLogModel = require('../../models/reconcileLog');
const ReceiptsModel = require('../../models/receipts');

const CheckRegister = new CheckRegisterModel();
const Journal = new JournalModel();
const TenantTransactions = new TenantTransactionsModel();
const ReconcileLog = new ReconcileLogModel();
const Receipts = new ReceiptsModel();

exports.get = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await CheckRegister.get({
            singleCheckbook: data.singleCheckbook,
            propertyID: data.propertyID,
            startDate: data.startDate,
            endDate: data.endDate,
            userID: data.userID,
            checkRegisterID: data.checkRegisterID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - get"
        );
        return res.json([]);
    }   
}

exports.reconcile = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        await CheckRegister.reconcile(checkRegisterID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - reconcile"
        );
        return res.json([]);
    }   
}

exports.delete = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        const userID = req.params.uID;
        
        // is Journal?
        const journal = await Journal.getByCheckRegister(checkRegisterID);
        if(journal) {
            // add new record
            await Journal.add({
                propertyID: journal.PropertyID,
                journalType: journal.JournalTypeID,
                amount: (journal.JournalAmount * -1),
                userID,
                description: `edit check register No: ${checkRegisterID}`,
                lenderID: journal.LenderID,
                checkRegisterID: checkRegisterID
            });
            // Subtract the amount
            const getCR = await CheckRegister.getByID(checkRegisterID);
            const newAmount = getCR.Amount - journal.JournalAmount;
            await CheckRegister.updAmount({
                amount: parseFloat(newAmount).toFixed(2),
                checkRegisterID
            });
            if(parseFloat(newAmount) < 0) {
                await CheckRegister.notReconcile(checkRegisterID);
            }
        } else {
            // delete check register. Then, the tenant transactions
            await CheckRegister.delete(checkRegisterID);
            await TenantTransactions.deleteByCheckRegister(checkRegisterID);
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - delete"
        );
        return res.json([]);
    }   
}

exports.reconcileDebits = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await CheckRegister.getReconcileDebits({
            singleCheckbook: data.singleCheckbook,
            propertyID: data.propertyID,
            userID: data.userID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - reconcileDebits"
        );
        return res.json([]);
    }   
}

exports.reconcileCredits = async (req, res, next) => {
    try {
        let returnData = {
            credits: [],
            details: new Map()
        }
        const data = req.body.data || req.body;
        const credits = await CheckRegister.getReconcileCredits({
            singleCheckbook: data.singleCheckbook,
            propertyID: data.propertyID,
            userID: data.userID
        });
        returnData.credits = credits;
        for(const c of credits) {
            const paymentDetails = await TenantTransactions.getPaymentDetails(parseInt(c.CheckRegisterID));
            let arr = []
            for(const pd of paymentDetails) {
                arr.push({
                    tenantName: `${pd.TenantFName} ${pd.TenantLName}`,
                    amount: parseFloat(pd.TransactionAmount).toFixed(2)
                });
            }
            returnData.details.set(parseInt(c.CheckRegisterID), arr);
        }
        return res.json({
            credits: returnData.credits,
            details: Object.fromEntries(returnData.details)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - reconcileCredits"
        );
        return res.json([]);
    }   
}

exports.getReconcileLog = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await ReconcileLog.getByPropertyID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - getReconcileLog"
        );
        return res.json([]);
    }   
}

exports.getPreviousReconcile = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        return res.json(await CheckRegister.getPreviousReconcile({
            singleCheckbook: data.singleCheckbook,
            propertyID: data.propertyID,
            userID: data.userID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - getPreviousReconcile"
        );
        return res.json([]);
    }   
}

exports.completeReconcile = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const reconAll = await CheckRegister.completeReconcileAll(data.crIDs);
        if(reconAll !== 0)  return res.json(-1);
        // Insert Log
        const log = await ReconcileLog.add({
            userID: data.userID,
            propertyID: data.propertyID,
            crIDs: data.crIDs,
            difference: data.difference
        });
        return res.json(log);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - completeReconcile"
        );
        return res.json([]);
    }   
}

exports.getByID = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
            
        return res.json(await CheckRegister.getByID(checkRegisterID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - getByID"
        );
        return res.json(null);
    }   
}

exports.updateBill = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await CheckRegister.updBill({
            paidDate: data.paidDate,
            amount: parseFloat(data.amount).toFixed(2),
            memo: data.memo,
            invoiceNumber: data.invoiceNumber,
            expenseTypeID: data.expenseTypeID,
            vendorID: data.vendorID,
            escrow: data.escrow ? 1 : 0,
            invoiceDate: data.invoiceDate,
            unitID: data.unitID,
            crID: data.crID
        });

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
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - updateBill"
        );
        return res.json(-1);
    }   
}

exports.updBillReceipt = async (req, res, next) => {
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
            "iRent Backend - Check Registyer Controller - updBillReceipt"
        );
        return res.json("Error processing your request. Please contact us.");
    }  
}

exports.updateItem = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        return res.json(await CheckRegister.updItem({
            amount: data.amount,
            memo: data.memo.replace(/'/g, "\\'"),
            invoiceNumber: data.invoiceNumber.replace(/'/g, "\\'"),
            id: data.checkRegisterID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - updateItem"
        );
        return res.json(-1);
    }   
}

exports.getEditTransactionData = async (req, res, next) => {
    try {
        const tenantTransactionID = req.params.ttID;

        return res.json(await TenantTransactions.getEditTransactionData(tenantTransactionID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - CheckRegister Controller - getEditTransactionData"
        );
        return res.json(null);
    }   
}