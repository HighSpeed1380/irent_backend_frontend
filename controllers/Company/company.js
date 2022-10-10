const stripe = require('stripe')('sk_live_6aZmxxvH4racmYveW4MEA0Qc');
const generator = require('generate-password');

const Email = require('../../util/email');
const Encrypt = require('../../util/encrypt');

const CompanyModel = require('../../models/company');
const CurrenciesModel = require('../../models/currencies');
const PropertyExcludesModel = require('../../models/propertiesExclude');
const CustomerCCModel = require('../../models/customerCC');
const CustomerBankModel = require('../../models/customerBank');
const StripeCustomerModel = require('../../models/stripeCustomer');
const PropertiesModel = require('../../models/properties');
const SecurityLevelsModel = require('../../models/securityLevels');
const UsersModel = require('../../models/users');
const NotificationsModel = require('../../models/notifications');
const UserPropertyMapModel = require('../../models/userpropertymap');
const OwnersModel = require('../../models/owners');
const OwnerPropertyMapModel = require('../../models/ownerPropertyMap');

const Company = new CompanyModel();
const Currencies = new CurrenciesModel();
const PropertyExcludes = new PropertyExcludesModel();
const CustomerCC = new CustomerCCModel();
const CustomerBank = new CustomerBankModel();
const StripeCustomer = new StripeCustomerModel();
const Property = new PropertiesModel();
const SecurityLevels = new SecurityLevelsModel();
const Users = new UsersModel();
const Notifications = new NotificationsModel();
const UserPropertyMap = new UserPropertyMapModel();
const Owners = new OwnersModel();
const OwnerPropertyMap = new OwnerPropertyMapModel();

const models = require('../../models/importAll');

exports.getDetails = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Company.get(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getDetails"
        );
        return res.json([]);
    }  
}

exports.getLeadSource = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Company.getLeadSource(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getLeadSource"
        );
        return res.json([]);
    }  
}

exports.getCurrencies = async (req, res, next) => {
    try {
        const data = await Currencies.getAll();
        return res.json(data);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getCurrencies"
        );
        return res.json([]);
    } 
}

exports.getBillingNotification = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await PropertyExcludes.getByCompanyID(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getBillingNotification"
        );
        return res.json({});
    } 
}

exports.getCompanyCC = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await CustomerCC.getByCompany(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getCompanyCC"
        );
        return res.json({});
    } 
}

exports.getCompanyBank = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await CustomerBank.getByCompany(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getCompanyBank"
        );
        return res.json({});
    } 
}

exports.updDetails = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await Company.updDetails(data));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updDetails"
        );
        return res.json(-1);
    } 
}

exports.updSettings = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await Company.updSettings(data));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updSettings"
        );
        return res.json(-1);
    } 
}

exports.updAutoBill = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await PropertyExcludes.updateCompanyBilling(data));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updAutoBill"
        );
        return res.json(-1);
    } 
}

exports.updCompCC = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        
        // create Stripe token
        await stripe.tokens.create({
            card: {
              number: data.cardNumber,
              exp_month: data.cardExpMonth,
              exp_year: data.cardExpYear,
              cvc: data.cardCVC,
              address_zip: data.cardZip
            },
        }).then(async (cardToken) => {
            const token = cardToken.id;
            let stripeCustomerID = '';
            const getStripeCustomer = await StripeCustomer.getByCompanyID(data.companyID);
            if(getStripeCustomer === "") {
                // create Customer
                const customer = await stripe.customers.create({
                    description: data.companyName,
                    email: data.companyEmail,
                    source: token
                });
                stripeCustomerID = customer.id;
                // saved the stripe customer ID
                await StripeCustomer.addByCompany({
                    companyID: data.companyID,
                    stripeCustomerID
                });
            } else {
                stripeCustomerID = getStripeCustomer;
                const customer = await stripe.customers.retrieve(
                    stripeCustomerID
                );
                for(const s of customer.sources.data) {
                    console.log(s);
                    if(s.object === 'card') {
                            console.log('delete cc');
                        await stripe.customers.deleteSource(
                            stripeCustomerID,
                            s.id
                        );
                    }
                }
                await stripe.customers.createSource(
                    stripeCustomerID,
                    {
                        source: token
                    }
                );
            }
            const enc = new Encrypt();
            const encryptedCard = enc.encrypt(data.cardNumber.toString());
            const encryptedCardCCV = enc.encrypt(data.cardCVC.toString());
            // Update database
            await CustomerCC.insertUpdate({
                companyID: data.companyID,
                nameOnCard: data.nameOnCard,
                cardNumber: encryptedCard,
                cardCCV: encryptedCardCCV,
                cardExpMonth: data.cardExpMonth,
                cardExpYear: data.cardExpYear,
                cardZip: data.cardZip
            });
            return res.json(0);
        }).catch((err) => {
            return res.json(err.raw.message);
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updCompCC"
        );
        return res.json("Error processing your request. Please contact us");
    } 
}

exports.updCompBank = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            console.log(data);
        await stripe.tokens.create({
            bank_account: {
              country: 'US',
              currency: 'usd',
              account_holder_name: data.accountName,
              account_holder_type: 'individual',
              routing_number: data.routingNumber,
              account_number: data.accountNumber,
            },
        }).then(async (bankToken) => {
            const token = bankToken.id;

            const getStripeCustomer = await StripeCustomer.getByCompanyID(data.companyID);
            if(getStripeCustomer === '') {
                // create Customer
                const customer = await stripe.customers.create({
                    description: data.companyName,
                    email: data.companyEmail,
                    source: token
                });
                stripeCustomerID = customer.id;
                // saved the stripe customer ID
                await StripeCustomer.addByCompany({
                    companyID: data.companyID,
                    stripeCustomerID
                });
            } else {
                stripeCustomerID = getStripeCustomer;
                const customer = await stripe.customers.retrieve(
                    stripeCustomerID
                );
                for(const s of customer.sources.data) {
                    console.log(s);
                    if(s.object === 'bank_account') {
                        await stripe.customers.deleteSource(
                            stripeCustomerID,
                            s.id
                        );
                    }
                }
                await stripe.customers.createSource(
                    stripeCustomerID,
                    {
                        source: token
                    }
                );
            }
            const enc = new Encrypt();
            const encryptedAccount = enc.encrypt(data.accountNumber.toString());

            await CustomerBank.insertUpdate({
                companyID: data.companyID,
                accountHolderName: data.accountName,
                accountNumber: encryptedAccount,
                routingNumber: data.routingNumber
            });
            return res.json(0);
        }).catch((err) => {
            return res.json(err.raw.message);
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updCompBank"
        );
        return res.json("Error processing your request. Please contact us");
    } 
}

exports.verifyBank = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const amount1 = parseInt(data.amount1 * 100);
        const amount2 = parseInt(data.amount2 * 100);
        const getStripeCustomer = await StripeCustomer.getByCompanyID(data.companyID);

        const getBankSource = async () => {
            let output = '';
            const customer = await stripe.customers.retrieve(
                getStripeCustomer
            );
            for(const s of customer.sources.data) {
                if(s.object === 'bank_account') {
                    output = s.id;
                    break;
                }
            }
            return output;
        }

        const bankAcc = await getBankSource();

        await stripe.customers.verifySource(
            getStripeCustomer,
            bankAcc,
            { amounts: [amount1, amount2] }
        ).then(async () => {
            await CustomerBank.setVerified(data.companyID);
            return res.json(0);
        })
        .catch((err) => {
            res.json(err.raw.message)
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - verifyBank"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.updPaymentMethod = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json(await Company.updatePaymentMethod(data));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updPaymentMethod"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.getProperties = async (req, res, next) => {
    try {
        const companyID = req.params.cID;
        return res.json(await Property.get(companyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getProperties"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.getSecurityLevels = async (req, res, next) => {
    try {
        return res.json(await SecurityLevels.get());
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getSecurityLevels"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.getUsers = async (req, res, next) => {
    try {
        let output = [];
        const companyID = req.params.cID;
        const users = await Users.getCompanyUsers(companyID);
        for(const u of Array.from(users)) {
            const props = await Property.getUsersProperties(u.UserID);
            output.push({
                userID: u.UserID,
                userFName: u.UserFName,
                userLName: u.UserLName,
                userPhone: u.UserPhone,
                userEmail: u.UserEmail,
                securityLevel: u.SecurityLevel,
                securityLevelID: u.SecurityLevelID,
                properties: props
            });
        }
        return res.json(output);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getUsers"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.addUser = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const checkUser = await Users.getByEmail(data.userEmail);
        if(Object.keys(checkUser).length !== 0)
            return res.json(`User with the email: ${data.userEmail} already exists`);

        const password = generator.generate({
            length: 8,
            numbers: true
        });
        const cellPhoneProviderID = 999;
        const userID = await Users.addUser({
            firstName: data.userFName,
            lastname: data.userLName,
            phone: data.userPhone.toString().replace(/[^0-9]/g, ''),
            cellPhoneProvider: cellPhoneProviderID,
            email: data.userEmail,
            password,
            securityLevelID: data.securityLevelID,
            companyID: data.companyID
        });

        if(userID === null)
            return res.json("Error processing your request. Please contact us");

        await Notifications.addUserNotification(userID);

        // Add property map
        for(const p of data.properties)
            await UserPropertyMap.add({propertyID: p.value, userID});

        // Email the user
        let emailBody = "You have been granted access to iRent.";
        emailBody += " To login and change your password, click on this link: ";
        emailBody += `<a href="https://myirent.com/rent">https://myirent.com/rent</a>`;
        emailBody += "<BR><BR>Your Temporary Password is: " + password;
        const userEmail = new Email();
        const userTransporter = userEmail.getTransporter();
        await userTransporter.sendMail({
            from: 'support@myirent.com', 
            to: data.userEmail, 
            subject: "You have been granted access to iRent",
            html: emailBody
        });

        return res.json(userID);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - addUser"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userID = req.params.uID;
        const companyID = req.params.cID;
        // Validate if there is another administrator user
        const user = await Users.get(userID);
        if(user.SecurityLevelID.toString() == '1'){
            const check = await Users.getExtraAdmin(companyID, userID);
            if(!check)
                return res.json("This is the only administrator user. You must have one administrator user.");
        }
        
        await Users.deleteUser(userID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - deleteUser"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.updUser = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await Users.updUser({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            securityLevel: data.securityLevel,
            userID: data.userID
        });
        let propIDs = [];
            console.log(data.properties);
        for(p of data.properties) {
            await UserPropertyMap.update({
                propertyID: p.value,
                userID: data.userID
            });
            propIDs.push(p.value);
        }
        await UserPropertyMap.updDelete({
            userID: data.userID,
            propIDs: propIDs.join(',')
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updUser"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.getOwners = async (req, res, next) => {
    try {
        let output = [];
        const companyID = req.params.cID;
        const owners = await Owners.getCompanyOwners(companyID);
        for(const o of Array.from(owners)) {
            const props = await Property.getOwnersProperties(o.OwnerID);
            output.push({
                ownerID: o.OwnerID,
                ownerName: o.OwnerName,
                ownerRep: o.Rep,
                ownerAddress: o.OwnerAddress,
                ownerCity: o.OwnerCity,
                ownerState: o.OwnerState,
                ownerZip: o.OwnerZip,
                ownerEmail: o.OwnerEmail,
                ownerPhone: o.OwnerPhone,
                ownerCell: o.OwnerCell,
                properties: props
            });
        }
        return res.json(output);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getOwners"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.addOwner = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const password = generator.generate({
            length: 8,
            numbers: true
        });
        const ownerID = await Owners.add({
            name: data.name,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            cell: data.cell.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            password: password,
            companyID: data.companyID,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            agent: data.agent
        });

        if(ownerID === null)
            return res.json("Error processing your request. Please contact us");

        // Add property map
        for(const p of data.properties)
            await OwnerPropertyMap.add({propertyID: p.value, ownerID});

        return res.json(ownerID);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - addOwner"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.deleteOwner = async (req, res, next) => {
    try {
        const ownerID = req.params.oID;
        await Owners.deleteOwner(ownerID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - deleteOwner"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.updOwner = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await Owners.updOwner({
            name: data.name,
            phone: data.phone.toString().replace(/[^0-9]/g, ''),
            cell: data.cell.toString().replace(/[^0-9]/g, ''),
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            agent: data.agent,
            ownerID: data.ownerID
        });
        let propIDs = [];
        for(p of data.properties) {
            await OwnerPropertyMap.update({
                propertyID: p.value,
                ownerID: data.ownerID
            });
            propIDs.push(p.value);
        }
        await OwnerPropertyMap.updDelete({
            ownerID: data.ownerID,
            propIDs: propIDs.join(',')
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updOwner"
        );
        return res.json("Error processing your request. Please contact us");
    }
}

exports.getJournalEntries = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        
        return res.json(await models.Journal.getEntriesByProperty(propertyID))
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getJournalEntries"
        );
        return res.json([]);
    }
}

exports.getJournalType = async (req, res, next) => {
    try {
        return res.json(await models.JournalType.getAll())
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getJournalType"
        );
        return res.json([]);
    }
}

exports.addJournal = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.Journal.includeJornal({
            description: data.description.replace(/'/g, "\\'"),
            journalTypeID: data.journalTypeID,
            amount: data.amount,
            propertyID: data.propertyID,
            userID: data.userID,
            lenderID: 0,
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - addJournal"
        );
        return res.json(-1);
    }
}

exports.deleteJournal = async (req, res, next) => {
    try {
        const journalID = req.params.jID;

        await models.Journal.deleteByID(journalID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - deleteJournal"
        );
        return res.json(-1);
    }
}

exports.getJournalByID = async (req, res, next) => {
    try {
        const journalID = req.params.jID;

        return res.json(await models.Journal.getByID(journalID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getJournalByID"
        );
        return res.json([]);
    }
}

exports.editJournal = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.Journal.update({
            description: data.description.replace(/'/g, "\\'"),
            amount: data.amount,
            journalTypeID: data.journalTypeID,
            journalID: data.journalID,
            userID: data.userID
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - editJournal"
        );
        return res.json(-1);
    }
}

exports.getMakeReadyTasks = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;

        return res.json(await models.MakeReadyTasks.getByPropertyID(propertyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getMakeReadyTasks"
        );
        return res.json([]);
    }
}

exports.deleteMakeReady = async (req, res, next) => {
    try {
        const mkID = req.params.mkID;

        await models.MakeReadyTasks.delete(mkID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - deleteMakeReady"
        );
        return res.json(-1);
    }
}

exports.addMakeReadyTask = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.MakeReadyTasks.add({
            task: data.task.replace(/'/g, "\\'"),
            propertyID: data.propertyID
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - addMakeReadyTask"
        );
        return res.json(-1);
    }
}

exports.getMakeReadyTaskByID = async (req, res, next) => {
    try {
        const mkID = req.params.mkID;

        return res.json(await models.MakeReadyTasks.getById(mkID))
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getMakeReadyTaskByID"
        );
        return res.json(null);
    }
}

exports.updMakeReadyTask = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        await models.MakeReadyTasks.update({
            task: data.task.replace(/'/g, "\\'"),
            makeReadyTaskID: data.makeReadyTaskID
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - updMakeReadyTask"
        );
        return res.json(-1);
    }
}

exports.getGLCategories = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
            
        return res.json(await models.PaymentsCategory.getByPropertyID(propertyID))
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getGLCategories"
        );
        return res.json([]);
    }
}

exports.deleteGLCategories = async (req, res, next) => {
    try {
        const paymentCategoryID = req.params.payID;
            
        await models.PaymentsCategory.deleteByID(paymentCategoryID);
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - getGLCategories"
        );
        return res.json(-1);
    }
}

exports.addGLCategory = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const exists = await models.PaymentsCategory.getByNameAndProperty({
            propertyID: data.propertyID,
            categoryName: data.categoryName
        });
        if(exists !== null)
            return res.json("Category already exists!");

        await models.PaymentsCategory.add({
            propertyID: data.propertyID,
            categoryName: data.categoryName
        });

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Company Controller - addGLCategory"
        );
        return res.json(-1);
    }
}