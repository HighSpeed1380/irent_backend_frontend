const builder = require('xmlbuilder');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');
const FormData = require('form-data');

const Email = require('../../util/email');

const TazworksModel = require('../../models/tazworks');
const Tazworks = new TazworksModel();

const winston = require('winston');
const filename = path.join(__dirname, '../../myLog.log');
const logger = winston.createLogger({
    transports: [
        //new winston.transports.Console({ level: 'error' }),
        new winston.transports.File({ filename, level: 'error' })
    ]
});

exports.requestReport = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const root = builder.create('BackgroundCheck');
        root.att('userId', data.USERID);
        root.att('password', data.PASSWORD);

        const BackgroundSearchPackage = root.ele("BackgroundSearchPackage");
        BackgroundSearchPackage.att('action', 'submit');
        BackgroundSearchPackage.att('type', data.PACKAGENAME);

        if(data.ORGANIZATIONNAME && data.ORGANIZATIONNAME !== '') {
            const Organization = BackgroundSearchPackage.ele("Organization");
            Organization.att('type', 'x:requesting');
            Organization.ele("OrganizationName", data.ORGANIZATIONNAME);
            Organization.ele("OrganizationCode", data.ORGANIZATIONCODE);
        }
        BackgroundSearchPackage.ele('ReferenceId', data.REFERENCEID);

        const PersonalData = BackgroundSearchPackage.ele("PersonalData");

        const PostalAdress = PersonalData.ele("PostalAddress", {'type': 'current'});
        PostalAdress.ele("PostalCode", data.POSTALCODE);
        PostalAdress.ele("Region", data.REGION);
        PostalAdress.ele("Municipality", data.MUNICIPALITY);
        PostalAdress.ele("DeliveryAddress")
            .ele("AddressLine", data.ADDRESSLINE);

        const PersonName = PersonalData.ele("PersonName");
        PersonName.ele("GivenName", data.GIVENNAME);
        PersonName.ele("FamilyName", data.FAMILYNAME);
        PersonName.ele("MiddleName", data.MIDDLENAME);

        PersonalData.ele("EmailAddress", data.EMAILADDRESS);
        
        const DemographicDetail = PersonalData.ele("DemographicDetail");
        DemographicDetail.ele("GovernmentId", {'issuingAuthority': 'SSN'}, data.SSN);
        DemographicDetail.ele("DateOfBirth", data.DOB);

        const Screenings = BackgroundSearchPackage.ele("Screenings", {'useConfigurationDefaults': 'yes'});
        Screenings.ele("AdditionalItems", {'type': 'x:postback_url'})
            .ele("Text", "http://www.submittee.com/listener/");
        Screenings.ele("AdditionalItems", {'type': 'x:embed_credentials'})
            .ele("Text", "TRUE");
        Screenings.ele("AdditionalItems", {'type': 'x:integration_type'})
            .ele("Text", "irent");

        // if credit card was sent
        if(data.CARDHOLDERFIRSTNAME !== undefined && data.CARDHOLDERFIRSTNAME !== '') {
            const userArea = root.ele("UserArea");
            const creditCard = userArea.ele("CreditCard");
            creditCard.ele("CardType", data.CARDTYPE);
            creditCard.ele("CardNumber", data.CARDNUMBER);
            creditCard.ele("CardSecurity", data.CARDCVC);
            creditCard.ele("ExpireMonth", data.CARDEXPMONTH);
            creditCard.ele("ExpireYear", data.CARDEXPYEAR);
            creditCard.ele("FirstName", data.CARDHOLDERFIRSTNAME);
            creditCard.ele("LastName", data.CARDHOLDERLASTNAME);
            creditCard.ele("BillingZip", data.CARDPOSTALCODE);
            creditCard.ele("BillingStreetAddress", data.BILLINGSTREETADDRESS);
            creditCard.ele("BillingCity", data.BILLINGCITY);
            creditCard.ele("BillingState", data.BILLINGSTATE);
        }

        const xml = root.end({ pretty: true });  

        await axios.post(data.REQUESTURL, xml, 
            { headers: {
                'Content-Type': 'text/xml'
            } })
            .then(async (result) => {
                const parser = new xml2js.Parser();
                parser.parseStringPromise(result.data).then(async (report) => {
                    const tazworksResponse = report.BackgroundReports.BackgroundReportPackage[0];
                    if(tazworksResponse.ErrorReport !== undefined) 
                        return res.json(tazworksResponse.ErrorReport[0].ErrorDescription[0]);

                    const orderID = tazworksResponse.OrderId[0];
                    const orderStatus = tazworksResponse.ScreeningStatus[0].OrderStatus[0];
                        
                    await Tazworks.add({
                        tenantID: data.TENANTID,
                        OrderID: orderID,
                        Status: orderStatus,
                        OthersOnLeaseID: data.TENANTOTHERSONLEASEID
                    });

                    const notifyBS = new Email();
                    const notifyTransporter = notifyBS.getTransporter();
                    await notifyTransporter.sendMail({
                        from: 'support@myirent.com', 
                        to: "support@myirent.com", 
                        subject: "TazWorks - Report (NodeJS)",
                        text: xml.toString()
                    });

                    return res.json(0);
                })
            })
            .catch(async (error) => {
                const email = new Email();
                await email.errorEmail(
                    error,
                    "iRent Backend - Tazworks Controller - requestReport - Sent to Tazworks"
                );
                return res.json(-1);
            });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Tazworks Controller - requestReport"
        );
        return res.json(-1);
    }  
}

exports.getReport = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            console.log(data)
        const obj = {
            BackgroundCheck: {
                '@userId': data.USERID,
                '@password': data.PASSWORD,
                BackgroundSearchPackage: {
                    '@action': 'status',
                    OrderId: {
                        '#text': data.ORDERID
                    }
                }
            }
        };
        const xml = builder.create(obj).end({ pretty: true});

        let reportURL;
        await axios.post(data.REQUESTURL, xml, 
            { headers: {'Content-Type': 'text/xml'} })
            .then(async (result) => {
                const parser = new xml2js.Parser();
                parser.parseStringPromise(result.data).then(function (report) {
                    console.log(report.BackgroundReports.BackgroundReportPackage[0].ScreeningStatus[0])
                    reportURL = report.BackgroundReports.BackgroundReportPackage[0].ReportURL[0];
                })
            })
            .catch(async (error) => {
                const email = new Email();
                await email.errorEmail(
                    error,
                    "iRent Backend - Tazworks Controller - getReport"
                );
                return res.json(-1);
            });

        return res.json(reportURL);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Tazworks Controller - getReport"
        );
        return res.json(-1);
    }  
}