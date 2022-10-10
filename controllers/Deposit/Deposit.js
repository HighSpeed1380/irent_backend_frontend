const Email = require('../../util/email');
const models = require('../../models/importAll');
const moment = require('moment');
const html_to_pdf = require('html-pdf-node');
const axios = require('axios');
const base64 = require('base-64');

exports.getSlip = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        let response = null;
        if(data.checkRegisterID !== null) {
            response = await models.TenantTransactions.getSlipByCheckRegister(parseInt(data.checkRegisterID));
        } else {
            response = await models.TempTransactions.getSlip({
                multiProp: data.multiProp,
                singlecheckbook: data.singlecheckbook,
                propertyID: data.propertyID,
                userID: data.userID
            });
        }
        return res.json(response);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getSlip"
        );
        return res.json([]);
    }  
}

exports.getPaymentTypes = async (req, res, next) => {
    try {
        return res.json(await models.PaymentType.getAll());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getPaymentTypes"
        );
        return res.json([]);
    }  
}

exports.getProspects = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        const property = await models.Properties.getByID(propertyID);
        if(property !== null && property.ApplicantsDepositsPage !== undefined && parseInt(property.ApplicantsDepositsPage) === 1)
            return res.json(await models.Tenants.getDepositProspects({
                propertyID,
                applicantsDepositsPage: true
            }));
        else
            return res.json(await models.Tenants.getDepositProspects({
                propertyID,
                applicantsDepositsPage: false
            }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getProspects"
        );
        return res.json([]);
    }  
}

exports.getFormerTenants = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.Units.getDepositFormerTenantsUnits(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getFormerTenants"
        );
        return res.json([]);
    }  
}

exports.getTenants = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.Units.getDepositTenantsUnits(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getTenants"
        );
        return res.json([]);
    }  
}

exports.getPendingTransactions = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const transactions = await models.TempTransactions.getDepositTransactions({
            multiProp: data.multiprop,
            userID: data.userID,
            propertyID: data.propertyID
        });
        let tenantBalance = new Array(transactions.length).fill("N/A");
        for(let i=0; i<transactions.length; i++) {
            const tID = transactions[i].TenantID === null ? 0 : parseInt(transactions[i].TenantID);
            if(tID !== 0)
                tenantBalance[i] = await models.TenantTransactions.getTenantBalance(tID);
        }
        return res.json({
            transactions,
            tenantBalance
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getPendingTransactions"
        );
        return res.json([]);
    }  
}

exports.getAllDepositSources = async (req, res, next) => {
    try {
        return res.json(await models.DepositSource.getAll())
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getAllDepositSources"
        );
        return res.json([]);
    }  
}

exports.emailReceipt = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const transaction = await models.TempTransactions.getTransactionReceiptData(data.id);
        if(transaction) {
            const total = parseFloat(transaction.HousingAmount) + parseFloat(transaction.TenantAmount);
            let content = `<html><head><meta name="viewport" content="initial-scale=1.0" /></head><body>`;
            content += `
                <br/><br/><table align="center"><tr><td align="center" colspan="8"><p class="second">Receipt for Payment</td></td></table>
                <table border="1" align="center">
                    <tr>
                        <td colspan=1><p class="first">
                            ${transaction.TenantFName} ${transaction.TenantLName}
                            <BR>Unit ${transaction.UnitName}
                            <BR>${transaction.TenantPhone !== '0' ? transaction.TenantPhone : ''}
                            <BR>${transaction.TenantEmail !== '0' ? transaction.TenantEmail : ''}<BR><BR><BR>
                        </td>
                        <td Colspan=4 Align="right" border=0 Valign="top">
                            <p class="first">Receipt Date: ${moment.utc().format("MM/DD/YYYY")}
                        </td>
                    </tr>
                    <tr>
                        <TD align=center><p class="first"><B>Transaction Date</B></TD>
                        <TD align=center><p class="first"><B>Transaction Amount</B></TD>
                        <TD align=center><p class="first"><B>Currency Type</B></TD>
                    </tr>
                    <TR>
                        <td align=center><p class="first">${moment.utc(transaction.TransactionDate).format("MM/DD?YYYY")}</td>
                        <TD align=center><p class="first">$${total.toFixed(2)}</TD>
                        <TD align=center><p class="first">${transaction.PaymentType}</TD>
                    </TR>
                </table></body></html>
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
                const tenantEmail = new Email();
                const tenantTransporter = tenantEmail.getTransporter();
                await tenantTransporter.sendMail({
                    from: 'support@myirent.com', 
                    to: data.email, 
                    subject: "Attached is your Receipt",
                    html: `
                        Attached is a PDF file with yout iRent receipt. <br/><br/>
                        Best Wishes, <br/><br/>
                        <b>iRent</b>
                    `,
                    attachments: [
                        {
                            filename: `deposit.pdf`,
                            content: pdfBuffer,
                            contentType: "application/pdf"
                        }
                    ] 
                });
            });
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - emailReceipt"
        );
        return res.json(-1);
    }  
}

exports.delete = async (req, res, next) => {
    try {
        const tempTransactionID = req.params.ttID;
        await models.TempTransactions.delete(tempTransactionID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - delete"
        );
        return res.json(-1);
    }  
}

exports.add = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.TempTransactions.add({
            depositSourceID: parseInt(data.depositSourceID),
            amount: parseFloat(data.amount).toFixed(2),
            tenantID: parseInt(data.tenantID),
            prospectID: parseInt(data.prospectID),
            propertyID: parseInt(data.propertyID),
            transactionDate: data.transactionDate,
            paymentTypeID: parseInt(data.paymentTypeID),
            checkNumber: data.checkNumber !== undefined ? data.checkNumber : '',
            comment: data.comment,
            lenderID: data.lenderID
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - add"
        );
        return res.json(-1);
    }  
}

exports.post = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        let transactions = await models.TempTransactions.getDepositTransactions({
            multiProp: data.multiProp,
            userID: data.userID,
            propertyID: data.propertyID
        });
        let lastPID = 0;    // start with a invalid property
        let crID = 0;   // check register ID
        let memo = "";
        for(const t of transactions) {
            if(parseInt(lastPID) !== parseInt(t.PropertyID)) {
                lastPID = parseInt(t.PropertyID);
                let tAmounts = await models.TempTransactions.getAmountsByProperty(lastPID);
                const tenantAmount = tAmounts.TotalTenantAmount === undefined || tAmounts.TotalTenantAmount === '' ? 0 : parseFloat(tAmounts.TotalTenantAmount);
                const housingAmount = tAmounts.TotalHousingAmountAmount === undefined || tAmounts.TotalHousingAmountAmount === '' ? 0 : parseFloat(tAmounts.TotalHousingAmountAmount);
                const otherAmount = tAmounts.TotalOtherAmount === undefined || tAmounts.TotalOtherAmount === '' ? 0 : parseFloat(tAmounts.TotalOtherAmount);
                let totalAmount = parseFloat(tenantAmount) + parseFloat(housingAmount) + parseFloat(otherAmount);
                if(parseInt(t.DepositSourceID) === 1)
                    memo = "Teannt Payment";
                else if(parseInt(t.DepositSourceID) === 2)
                    memo = "Housing Payment";
                else if(parseInt(t.DepositSourceID) === 3)
                    memo = "Other Payment"
                else if(parseInt(t.DepositSourceID) === 4)
                    memo = "Prospect Payment";
                else if(parseInt(t.DepositSourceID) === 5)
                    memo = "Escrow Reimbursement";
                else if(parseInt(t.DepositSourceID) === 12)
                    memo = "Tenant Deposit";
                else if(parseInt(t.DepositSourceID) === 6) {
                    const lender = await models.Lenders.getByID(parseInt(t.TransactionComment));
                    if(lender !== null) memo = `Loan - ${lender.Lender}`;
                    else                memo = `Loan`;
                }
                // Add to check Register
                crID = await models.CheckRegister.add({
                    propertyID: lastPID,
                    vendorID: 0,
                    amount: parseFloat(totalAmount).toFixed(2),
                    memo,
                    expenseTypeID: 20,
                    transactionType: 2,
                    escrow: 0,
                    invoiceDate: new Date(),
                    invoiceNumber: '0',
                    userID: data.userID,
                    unitID: 0
                });
            }

            if(parseInt(t.DepositSourceID) === 5) {
                // add Escrow
                await models.EscrowPayments.add({
                    checkRegisterID: crID,
                    amount: parseFloat(t.OtherAmount).toFixed(2),
                    userID: data.userID
                });
            } else if(parseInt(t.DepositSourceID) === 6) {
                // add Journal
                await models.Journal.add({
                    propertyID: lastPID,
                    journalType: 5,
                    amount: parseFloat(t.OtherAmount).toFixed(2),
                    userID: data.userID,
                    description: memo,
                    lenderID: parseInt(t.TransactionComment),
                    checkRegisterID: crID
                });
            } else if(parseInt(t.DepositSourceID) === 12) {
                // New Deposit Type: "Tenant Deposit"
                // Add Escrow and Journal
                await models.EscrowPayments.add({
                    checkRegisterID: crID,
                    amount: parseFloat(t.OtherAmount).toFixed(2),
                    userID: data.userID
                });
                await models.Journal.add({
                    propertyID: lastPID,
                    journalType: 5,
                    amount: parseFloat(t.OtherAmount).toFixed(2),
                    userID: data.userID,
                    description: memo,
                    lenderID: 0,
                    checkRegisterID: crID
                });
            } else {
                // tenant amount
                if(parseFloat(t.TenantAmount) !== 0) {
                    let comment = "Tenant Payment";
                    let paymentType = await models.PaymentType.getByID(parseInt(t.PaymentTypeID));
                    if(paymentType !== null)
                        comment += ` via ${paymentType[0].PaymentType}`;
                    await models.TenantTransactions.addOneTimeFee({
                        chargeTypeID: 1,
                        tenantID: parseInt(t.TenantID),
                        transactionType: 2,
                        amount: parseFloat(t.TenantAmount).toFixed(2),
                        comment,
                        transactionDate: t.TransactionDate,
                        paymentType: parseInt(t.PaymentTypeID),
                        checkRegister: crID,
                        userID: data.userID,
                        checkNumber: t.CheckNumber,
                        depositSourceID: parseInt(t.DepositSourceID)
                    });
                }
                // housing amount
                if(parseFloat(t.HousingAmount) !== 0) {
                    await models.TenantTransactions.addOneTimeFee({
                        chargeTypeID: 6,
                        tenantID: parseInt(t.TenantID),
                        transactionType: 2,
                        amount: parseFloat(t.HousingAmount).toFixed(2),
                        comment: "Housing Authority Payment",
                        transactionDate: t.TransactionDate,
                        paymentType: parseInt(t.PaymentTypeID),
                        checkRegister: crID,
                        userID: data.userID,
                        checkNumber: t.CheckNumber,
                        depositSourceID: parseInt(t.DepositSourceID)
                    });
                }
                // other income
                if(parseFloat(t.OtherAmount) !== 0) {
                    await models.TenantTransactions.addOneTimeFee({
                        chargeTypeID: 15,
                        tenantID: 0,
                        transactionType: 2,
                        amount: parseFloat(t.OtherAmount).toFixed(2),
                        comment: t.TransactionComment,
                        transactionDate: t.TransactionDate,
                        paymentType: parseInt(t.PaymentTypeID),
                        checkRegister: crID,
                        userID: data.userID,
                        checkNumber: t.CheckNumber,
                        depositSourceID: parseInt(t.DepositSourceID)
                    });
                }
            }
        }

        // Delete the temp Transactions by Property or multiProp
        await models.TempTransactions.deleteByProperty({
            multiProp: data.multiProp,
            userID: data.userID,
            propertyID: data.propertyID
        })

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - post"
        );
        return res.json(-1);
    }  
}

exports.getTemp = async (req, res, next) => {
    try {
        const tempTransactionID = req.params.ttID;
        return res.json(await models.TempTransactions.getByID(tempTransactionID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getTemp"
        );
        return res.json(null);
    }  
}

exports.getDepositSource = async (req, res, next) => {
    try {
        const depositSourceID = req.params.dpID;
        return res.json(await models.DepositSource.getByID(depositSourceID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getDepositSource"
        );
        return res.json(null);
    }  
}

exports.updateTempTransaction = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        await models.TempTransactions.edit({
            housingAmount: parseFloat(data.housingAmount).toFixed(2),
            tenantAmount: parseFloat(data.tenantAmount).toFixed(2),
            otherAmount: parseFloat(data.otherAmount).toFixed(2),
            tenantID: parseInt(data.tenantID),
            transactionDate: data.transactionDate,
            paymentTypeID: data.paymentTypeID,
            comment: data.comment,
            checkNumber: data.checkNumber,
            id: data.id
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - updateTempTransaction"
        );
        return res.json(-1);
    }  
}

exports.getDepositBreakdown = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        const tenantDeposits = await models.TenantTransactions.depositBreakdown(checkRegisterID);
        const escrowPayments = await models.EscrowPayments.getByCheckRegister(checkRegisterID);
        const loanDeposits = await models.Journal.getAllByCheckRegister(checkRegisterID);
        return res.json({
            tenantDeposits: tenantDeposits || [],
            escrowPayments: escrowPayments || [],
            loanDeposits: loanDeposits || []
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getDepositBreakdown"
        );
        return res.json([]);
    }  
}

exports.markSecurityDepositAsPaid = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        await models.SecurityDepositRefund.markPaid(data.securityDepositID);
        await models.CheckRegister.add({
            transactionType: 1,
            propertyID: data.propertyID,
            vendorID: 0,
            amount: parseFloat(data.amount).toFixed(2),
            memo: data.memo.replace(/'/g, "\\'"),
            expenseTypeID: 29,
            paid: 1,
            escrow: 0,
            invoiceDate: new Date(),
            invoiceNumber: '0',
            userID: data.userID,
            unitID: 0
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - markSecurityDepositAsPaid"
        );
        return res.json(-1);
    }  
}

exports.addLender = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const getByName = await models.Lenders.getByName(data.lender.trim());
        if(getByName !== null)
            return res.json(`Lender: ${data.lender.trim()} already exists`);

        await models.Lenders.add({
            lender: data.lender.trim(),
            companyID: parseInt(data.companyID)
        });
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - addLender"
        );
        return res.json(-1);
    }  
}

exports.getHistory = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
            
        return res.json(await models.CheckRegister.getDepositsHistory(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getHistory"
        );
        return res.json([]);
    }  
}

exports.deleteDepositHistory = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        
        await models.TenantTransactions.deleteByCheckRegister(checkRegisterID);
        await models.CheckRegister.delete(checkRegisterID);

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - deleteDepositHistory"
        );
        return res.json(-1);
    }  
}

exports.getEditDeposits = async (req, res, next) => {
    try {
        const checkRegisterID = req.params.crID;
        
        const deposits = {
            tenantTransactions: [],
            escrowPayments: [],
            journal: []
        }

        deposits.tenantTransactions = await models.TenantTransactions.getByCheckRegister(checkRegisterID);
        deposits.escrowPayments = await models.EscrowPayments.getByCheckRegister(checkRegisterID);
        deposits.journal = await models.Journal.getAllByCheckRegister(checkRegisterID);

        return res.json(deposits);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getEditDeposits"
        );
        return res.json({});
    }  
}

exports.getTenantsByProperty = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        
        return res.json(await models.Tenants.getByProperty(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - getTenantsByProperty"
        );
        return res.json([]);
    }  
}

exports.processTenantCCPayment = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        const addOnlinePayment = async (args) => {
            // insert into check register
            const crID = await models.CheckRegister.add({
                propertyID: args.propertyID,
                vendorID: 0,
                amount: args.amount,
                memo: 'via Credit Card',
                expenseTypeID: 20,
                transactionType: 2,
                paid: 0,
                escrow: 0,
                invoiceDate: moment.utc().format("YYYY-MM-DD"),
                invoiceNumber: 0,
                userID: args.userID,
                unitID: 0
            });

            // add tenant transaction
            await models.TenantTransactions.addOneTimeFee({
                chargeTypeID: 1,
                tenantID: args.tenantID,
                transactionType: 2,
                amount: args.amount,
                comment: 'Tenant Payment via Credit Card',
                paymentType: 7,
                checkRegister: crID,
                userID: args.userID,
                checkNumber: 'Tenant Credit Card Payment',
                depositSourceID: 1,
                stripeChargeID: args.chargeID
            });

            const tenant = await models.Tenants.get(args.tenantID);
            if(tenant !== null && tenant.TenantEmail !== '') {
                const tenantEmail = new Email();
                const tenantTransporter = tenantEmail.getTransporter();
                await tenantTransporter.sendMail({
                    from: 'support@myirent.com', 
                    to: tenant.TenantEmail, 
                    subject: "Payment Received",
                    html: `
                        <b>Online Payment Amount:</b> $${parseFloat(args.amount).toFixed(2)} received. <br/>
                        Tenant: ${tenant.TenantFName} ${tenant.TenantLName}
                        Best Wishes, <br/><br/>
                        <b>iRent</b>
                    `,
                });
            }
        }

        const epicPay = await models.EpicPayKeys.getByPropertyID(data.propertyID);
        if(epicPay !== null) {
            // EpicPay
            const reqUrl = `https://api.epicpay.com/payment/v1/authorize`;
            const amt = parseInt(data.amount * 100);
            const stFields = {
                "amount": amt,
				"currency": "usd",
				"method": "credit_card",
				"transaction_type": "sale",
				"credit_card":{
				    "card_number": data.cardNUmber,
				    "card_holder_name": data.cardName,
				    "exp_month": data.cardExpMonth,
				    "exp_year": data.cardExpYear,
				    "cvv": data.cardCVC
				},
				"billing_address":{
				    "postal_code": data.cardZip
				}
            };
            await axios.post(reqUrl, JSON.stringify(stFields), 
                { headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${base64.encode(`${epicPay.APIKey}:${epicPay.PasswordKey}`)}`
                } })
                .then(async (result) => {
                    const resData = result.data;
                    if(resData.status.response_code === 'Error') {
                        return res.json(resData.status.reason_text)
                    }
                    if(resData.status.response_code === 'Declined') {
                        return res.json(resData.status.reason_text)
                    }
                    // add the charge to the appropriate tables
                    await addOnlinePayment({
                        propertyID: data.propertyID,
                        amount: data.amount,
                        userID: data.userID,
                        tenantID: data.tenantID,
                        chargeID: resData.result.payment.transaction_id
                    });
                    return res.json(0)
                })
                .catch((err) => {
                    return res.json(-1)
                })
        } else {
            // Stripe
            const amt = parseInt(data.amount * 100);
                
            const stripe = require('stripe')('sk_live_6aZmxxvH4racmYveW4MEA0Qc');
            await stripe.tokens.create({
                card: {
                  number: data.cardNUmber,
                  exp_month: data.cardExpMonth,
                  exp_year: data.cardExpYear,
                  cvc: data.cardCVC,
                },
            }, async function(err, result) {
                if(err) {
                    error = err.message;
                    return res.json(error);
                }
                await stripe.charges.create({
                    amount: amt,
                    currency: 'usd',
                    source: result.id,
                    description: `Tenant Payment. TenantID: ${data.tenantID}`,
                }, async function(err2, result2) {
                    if(err2) {
                        //console.log(err2)
                        error2 = err2.message;
                        return res.json(error2);
                    }
                    // add the charge to the appropriate tables
                    await addOnlinePayment({
                        propertyID: data.propertyID,
                        amount: data.amount,
                        userID: data.userID,
                        tenantID: data.tenantID,
                        chargeID: result2.id
                    });
                });
                return res.json(0)
            });
        }

    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Deposit Controller - processTenantCCPayment"
        );
        return res.json(-1);
    }  
}