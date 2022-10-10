const html_to_pdf = require('html-pdf-node');
const Email = require('../../util/email');
const Encrypt = require('../../util/encrypt');

const FormsCreatorModel = require('../../models/formsCreator');
const PropertyModel = require('../../models/properties');
const TenantsModel = require('../../models/tenants');
const UsersModel = require('../../models/users');
const TenantOthersOnLeaseModel = require('../../models/tenantOthersOnLease');
const LayoutMapContactModel = require('../../models/layoutMapContact');
const UnitsModel = require('../../models/units');
const TenantTransactionsModel = require('../../models/tenantTransactions');
const SignedFormsModel = require('../../models/signedForms');
const TempSignFormModel = require('../../models/tempSignForm');

const FormsCreator = new FormsCreatorModel();
const Property = new PropertyModel();
const Tenants = new TenantsModel();
const Users = new UsersModel();
const TenantOthersOnLease = new TenantOthersOnLeaseModel();
const LayoutMapContact = new LayoutMapContactModel();
const Units = new UnitsModel();
const TenantTransactions = new TenantTransactionsModel();
const SignedForms = new SignedFormsModel();
const TempSignForm = new TempSignFormModel();

const googleFonts = `<style>
        /* latin-ext */
        @font-face {
          font-family: 'Aguafina Script';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/aguafinascript/v9/If2QXTv_ZzSxGIO30LemWEOmt1b3o8QooCQer9bA.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Aguafina Script';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/aguafinascript/v9/If2QXTv_ZzSxGIO30LemWEOmt1b3rcQooCQerw.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Alex Brush';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/alexbrush/v12/SZc83FzrJKuqFbwMKk6EhUvz7RlNiCY0GA.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Alex Brush';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/alexbrush/v12/SZc83FzrJKuqFbwMKk6EhUXz7RlNiCY.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Bilbo';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/bilbo/v10/o-0EIpgpwWwZ220oroVR4BxFW_0.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Bilbo';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/bilbo/v10/o-0EIpgpwWwZ220mroVR4BxF.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Condiment';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/condiment/v8/pONk1hggFNmwvXALyH6iooP5gVjiCHcF.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Condiment';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/condiment/v8/pONk1hggFNmwvXALyH6irIP5gVjiCA.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Great Vibes';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/greatvibes/v8/RWmMoKWR9v4ksMfaWd_JN9XLiaQoDmlrMlY.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Great Vibes';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/greatvibes/v8/RWmMoKWR9v4ksMfaWd_JN9XFiaQoDmlr.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Herr Von Muellerhoff';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/herrvonmuellerhoff/v10/WBL6rFjRZkREW8WqmCWYLgCkQKXb4CAft0cz9KN63hPRW1c.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Herr Von Muellerhoff';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/herrvonmuellerhoff/v10/WBL6rFjRZkREW8WqmCWYLgCkQKXb4CAft0c99KN63hPR.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin */
        @font-face {
          font-family: 'Kristi';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/kristi/v12/uK_y4ricdeU6zwdhDRcSEP2UXg.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin */
        @font-face {
          font-family: 'Meddon';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/meddon/v13/kmK8ZqA2EgDNeHTpgx1A_SzQog.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Monsieur La Doulaise';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/monsieurladoulaise/v9/_Xmz-GY4rjmCbQfc-aPRaa4pqV340p7EZm5XyEA242TzTO8.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Monsieur La Doulaise';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/monsieurladoulaise/v9/_Xmz-GY4rjmCbQfc-aPRaa4pqV340p7EZm5ZyEA242Tz.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Norican';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/norican/v9/MwQ2bhXp1eSBqjkPKJtbtUk9hbF2rA.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Norican';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/norican/v9/MwQ2bhXp1eSBqjkPKJVbtUk9hbE.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin */
        @font-face {
          font-family: 'Nothing You Could Do';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/nothingyoucoulddo/v10/oY1B8fbBpaP5OX3DtrRYf_Q2BPB1SnfZb3OOnVsH2pmp.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Parisienne';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/parisienne/v8/E21i_d3kivvAkxhLEVZpQyZwD8CtevK5qw.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Parisienne';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/parisienne/v8/E21i_d3kivvAkxhLEVZpQyhwD8CtevI.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin */
        @font-face {
          font-family: 'Permanent Marker';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/permanentmarker/v10/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cf5b6jlg.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin-ext */
        @font-face {
          font-family: 'Sacramento';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/sacramento/v8/buEzpo6gcdjy0EiZMBUG4CMf_f5Iai0Ycw.woff2) format('woff2');
          unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        /* latin */
        @font-face {
          font-family: 'Sacramento';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/sacramento/v8/buEzpo6gcdjy0EiZMBUG4C0f_f5Iai0.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        /* latin */
        @font-face {
          font-family: 'Yellowtail';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/yellowtail/v11/OZpGg_pnoDtINPfRIlLohlvHwWL9f4k.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }</style>
        `;

exports.getForms = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const leadSourceCompanyID = await FormsCreator.getLeadSource(propertyID);
        const forms = await FormsCreator.getForms({
            leadSourceCompanyID,
            propertyID
        });
        return res.json(forms);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - getForms"
        );
        return res.json(-1);
    }  
}

exports.getForm = async (req, res, next) => {
    try {
        const propertyID = req.params.pID;
        const formsCreatorID = req.params.formID;
        const leadSourceCompanyID = await FormsCreator.getLeadSource(propertyID);
        return res.json(await FormsCreator.getForm({
            propertyID,
            FormsCreatorID: formsCreatorID,
            leadSourceCompanyID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - getForm"
        );
        return res.json(-1);
    }
}

exports.delete = async (req, res, next) => {
    const formsCreatorID = req.params.formID;
    const propertyID = req.params.pID;
    await FormsCreator.delete(formsCreatorID, propertyID);
    return res.json(0);
}

exports.save = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        if(data.SaveAllProps === 1){
            // get all active properties
            const properties = await Property.getAllPropsFromPropID(data.PropertyID);
            for(const p of properties) {
                const printableID = await FormsCreator.getFormsPrintable({
                    formID: data.FormCreatorID,
                    propertyID: p.PropertyID
                });
                if(printableID !== 0) {
                    await FormsCreator.updateFormsPrintable({
                        Form: data.Form.replace(/'/g, ''),
                        id: printableID
                    });
                } else {
                    const FormName = await FormsCreator.getbyID(data.FormCreatorID);
                    const insertFormsCreator = await FormsCreator.addFormsCreator({
                        FormName: FormName.FormName,
                        PropertyID: p.PropertyID
                    });
                    await FormsCreator.addFormsPrintable({
                        FormName: FormName.FormName,
                        Form: data.Form.replace(/'/g, ''),
                        PropertyID: p.PropertyID,
                        FormCreatorID: insertFormsCreator
                    });
                }
            }
        } else {
            if(data.FormsPrintableID !== 0) {
                await FormsCreator.updateFormsPrintable({
                    Form: data.Form.replace(/'/g, ''),
                    id: data.FormsPrintableID
                });
            } else {
                const FormName = await FormsCreator.getbyID(data.FormCreatorID);
                await FormsCreator.addFormsPrintable({
                    FormName,
                    Form: data.Form.replace(/'/g, ''),
                    PropertyID: data.PropertyID,
                    FormCreatorID: data.FormCreatorID
                });
            }
        }
        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - save"
        );
        return res.json("Error processing your request. Please contact us.");
    }
}

exports.loadDefault = async (req, res, next) => {
    try {
        const formsCreatorID = req.params.formID;
        const propertyID = req.params.pID;
        const leadSourceCompanyID = await FormsCreator.getLeadSource(propertyID);
           
        return res.json( await FormsCreator.getDefault(formsCreatorID, leadSourceCompanyID));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - loadDefault"
        );
        return res.json(-1);
    }
}

exports.createForm = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        return res.json( await FormsCreator.createForms({
            FormName: data.FormName,
            PropertyID: data.PropertyID
        }));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - createForm"
        );
        return res.json(-1);
    }
}

const getMapVariables = async (data) => {
    const today = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let output = new Map();

    const tenant = await Tenants.get(data.tenantID);
        output.set("#tenantFName#", tenant.TenantFName || "");
        output.set("#tenantLName#", tenant.TenantLName || "");
        output.set("#tenantEmail#", tenant.TenantEmail || "");
        output.set("#moveInDate#", formattedDate(tenant.MoveInDate));
        output.set("#leaseStartDate#", formattedDate(tenant.LeaseStartDate));
        output.set("#leaseEndDate#", formattedDate(tenant.LeaseEndDate));
        output.set("#moveOutDate#", formattedDate(tenant.MoveOutDate));
        output.set("#rentalAmount#", parseFloat(tenant.RentalAmount).toFixed(2) ||"");
        output.set("#housePortion#", parseFloat(tenant.HousingAmount).toFixed(2) || "");
        output.set("#securityDeposit#", parseFloat(tenant.SecurityDeposit).toFixed(2) || "");
        output.set("#tenantPortion#", (parseFloat(tenant.RentalAmount)-parseFloat(tenant.HousingAmount)).toFixed(2)|| "");
        output.set("#petFee#", parseFloat(tenant.PetRent).toFixed(2) || "");
        output.set("#TvCharge#", parseFloat(tenant.TVCharge).toFixed(2) || "");
        output.set("#utilityCharge#", parseFloat(tenant.UtilityCharge).toFixed(2) || "");
        output.set("#parkingCharge#", parseFloat(tenant.ParkingCharge).toFixed(2) || "");
        output.set("#storageCharge#", parseFloat(tenant.StorageCharge).toFixed(2) || "");

        const othersOnlease = await TenantOthersOnLease.getByTenantID(data.tenantID);
        output.set("#peopleOnLease#", othersOnlease.names);
        output.set("#othersOnleaseTotal#", othersOnlease.total);

        const user = await Users.getUserSecurityLevel(data.userID);
        output.set("#userName#", user.UserFName + " " + user.UserLName);
        output.set("#userEmail#", user.UserEmail);
        output.set("#userRole#", user.securitylevel);
        output.set("#userSignatureDate#", formattedDate(new Date()));

        const property = await Property.getByID(data.propertyID);
        const lateFee = property.LateFee === "" || property.LateFee === undefined ? 0 : parseFloat(property.LateFee).toFixed(2);
        const storageCharge = property.StorageCharge === "" || property.StorageCharge === undefined ? 0 : parseFloat(property.StorageCharge).toFixed(2);
        const bankFee = property.BankFee === "" || property.BankFee === undefined ? 0 : parseFloat(property.BankFee).toFixed(2);
        output.set("#lateFee#", lateFee);
        output.set("#dailylateFee#", storageCharge);
        output.set("#bankFee#", bankFee);
        output.set("#propertyName#", property.PropertyName || "");
        output.set("#propertyPhone#", property.PropertyPhone || "");
        output.set("#propertyEmail#", property.PropertyEmail || "");
        output.set("#propertyStreet#", property.PropertyAddress1 || "");
        output.set("#propertyCity#", property.PropertyCity || "");
        output.set("#propertyState#", property.PropertyState || "");
        output.set("#propertyZIP#", property.PropertyZip || "");

        const mapContact = await LayoutMapContact.getByPropertyID(data.propertyID);
        output.set("#officeHours#", mapContact.customDateTime || "");

        output.set("#currentDay#", today.getDate().toString());
        output.set("#currentDate#", formattedDate(new Date()));
        output.set("#currentDate3Days#", formattedDate(today.setDate(today.getDate() + 3)));
        output.set("#currentWeekDay#", days[today.getDay()]);
        output.set("#currentMonth#", (today.getMonth()+1).toString());
        output.set("#currentMonth#", (today.getFullYear()).toString());
        
        const getUnit = await Units.getByID(tenant.UnitID);
        output.set("#unitNumber#", getUnit.UnitName);

        const tOwes = await TenantTransactions.getTenantBalance(data.tenantID);
        output.set("#tenantOwes#", parseFloat(tOwes).toFixed(2));

        // signatures
        const userSignature = await Users.getSignatures(data.userID);
        output.set("#userSignatureDate#", formattedDate(new Date()));
        output.set("#UserSignatureName#", userSignature.name || "");
        output.set("#UserSignatureFont#", userSignature.font || "");
        return output;
}

exports.getFormsVaraibles = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        const output = await getMapVariables(data);
        res.json([...output]);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - getFormsVaraibles"
        );
        return res.json(-1);
    }
}

const formattedDate = (date) => {
    if(typeof date.getMonth !== 'function') return "";
    return (date.getMonth() + 1).toString() + "/" +
    date.getDate().toString() + "/" + date.getFullYear().toString();
}

exports.getSignedForm = async (req, res, next) => {
    try {
        const formsCreatorID = req.params.formID;
        const tenantID = req.params.tID;

        let form = await TempSignForm.getByTenant({
            formID: formsCreatorID,
            tenantID
        });
        form = form.Form || "";

        const googleFonts = `<link href="https://fonts.googleapis.com/css?family=Aguafina+Script|Alex+Brush|Bilbo|Condiment|Great+Vibes|Herr+Von+Muellerhoff|Kristi|Meddon|Monsieur+La+Doulaise|Norican|Nothing+You+Could+Do|Parisienne|Permanent+Marker|Sacramento|Yellowtail" rel="stylesheet">`;
        if(form.indexOf("<html>") === -1){
            const htmlTag = `<!DOCTYPE html><html><head><meta name="viewport" content="initial-scale=1.0" /><style>table { width: 800px !important } #divContent { width: 800px !important }</style>${googleFonts}</head><body><div id="divContent">`;
            form = htmlTag + form + "</div></body></html>";
        } else {
            let  pos = form.indexOf("<head>") + 6;
            form = form.slice(0, pos) + `<meta name="viewport" content="initial-scale=1.0" /><style>table { width: 800px !important } #divContent { width: 800px !important }</style>` + googleFonts + form.slice(pos, form.length);
            pos = form.indexOf("<body>") + 6;
            let posEnd = form.indexOf("</body>");
            form = form.slice(0, pos) + `<div id="divContent">` + form.slice(pos, posEnd) + "</div>" + form.slice(posEnd, form.length);
        }

        return res.json(form);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - getSignedForm"
        );
        return res.json("");
    }
}

exports.openPDFForm = async (req, res, next) => {
    try {
        const id = req.params.formID;

        const encryptID = new Encrypt(id);
        const formID = encryptID.decryptText(id);

        let form = await TempSignForm.get(formID);
        form = form.Form || "";
        let content;
        if(form.indexOf("<html>") === -1){
            const htmlTag = `<html><head><meta name="viewport" content="initial-scale=1.0" />${googleFonts}</head><body>`;
            content = htmlTag + form + "</body></html>";
        } else {
            let  pos = form.indexOf("<head>") + 6;
            content = form.slice(0, pos) + `<meta name="viewport" content="initial-scale=1.0" />` + googleFonts + form.slice(pos, form.length);
        }

        let options = { 
            format: 'letter',
            margin: {
                right: '40px',
                left: '40px'
            } 
        };
        let file = { content };
        html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Content-Type', 'application/pdf');
            return res.end(pdfBuffer);
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - openPDFForm"
        );
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': 1
        });
        return res.end('');
    }
}

exports.sendPDFEmail = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
        const email = data.email || data.EMAIL;
        const formID = data.formID || data.FORMID;
        const subject = data.subject || data.SUBJECT;
        const body = data.body || data.BODY;

        let signedForm = await TempSignForm.get(formID);
        form = signedForm.Form || "";
        let content;
        if(form.indexOf("<html>") === -1){
            const htmlTag = `<html><head><meta name="viewport" content="initial-scale=1.0" />${googleFonts}</head><body>`;
            content = htmlTag + form + "</body></html>";
        } else {
            let  pos = form.indexOf("<head>") + 6;
            content = form.slice(0, pos) + `<meta name="viewport" content="initial-scale=1.0" />` + googleFonts + form.slice(pos, form.length);
        }

        let options = { 
            format: 'letter',
            margin: {
                right: '40px',
                left: '40px'
            } 
        };
        let file = { content };
        html_to_pdf.generatePdf(file, options).then(async (pdfBuffer) => {
            const sendEmail = new Email();
            const emailTransporter = sendEmail.getTransporter();
            await emailTransporter.sendMail({
                from: 'support@myirent.com', 
                to: email, 
                subject, 
                html: body,
                attachments: [
                    {
                        filename: `${signedForm.FormName}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf"
                    }
                ] 
            }); 
            return res.json(0);
        });
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - Forms Creator Controller - sendPDFEmail"
        );
        return res.json('Error processing your request. Please contact us!');
    }
}