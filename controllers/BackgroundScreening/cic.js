const builder = require('xmlbuilder');
const xml2js = require('xml2js');
const axios = require('axios');
const models = require('../../models/importAll');

const Email = require('../../util/email');

exports.getReport = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        const url = 'https://www.securecontinfo.com/API/prod/';
        const property = await models.PropertyDefaults.getByPropertyID(data.propertyID);

        const xmlData = `
            <?xml version="1.0" encoding="UTF-8" ?> 
            <ScreeningRequest>
                <Request Type="View">
                    <Account>
                        <AppVersion>002</AppVersion>
                        <UserID>${property.CICUserID}</UserID>
                        <UserPassword>${property.CICPassword}</UserPassword>
                    </Account>
                    <ReferenceInformation>	
                        <TransactionID>ID123456</TransactionID>
                    </ReferenceInformation>
                    <Report>	
                        <ReportID>${data.reportID}</ReportID>	
                        <KEY>${data.key}</KEY>
                        <ViewID>${Math.random()}</ViewID>
                        <RequestAdvisement>Yes</RequestAdvisement>
                    </Report>
                </Request>
            </ScreeningRequest>
        `;
            
        let reportURL = null;
        await axios.post(url, xmlData, 
            { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'} })
            .then(async (result) => {
                const parser = new xml2js.Parser();
                await parser.parseStringPromise(result.data).then(function (report) {
                    const response = report.ScreeningResponse.Response[0].Report[0];
                    if(response.Link !== undefined)
                        reportURL = response.Link[0]
                    else
                        reportURL = 'Report is Pending';
                })
            })
            .catch(async (error) => {
                const email = new Email();
                await email.errorEmail(
                    error,
                    "iRent Backend - CIC Controller - getReport"
                );
                return res.json(-1);
            });

        return res.json(reportURL)
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - CIC Controller - getReport"
        );
        return res.json(-1);
    } 
}

exports.runReport = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;

        let userID = '';
        let userPass = ''
        const getCredentials = await models.PropertyDefaults.getByPropertyID(data.propertyID);
        if(getCredentials !== null) {
            userID = getCredentials.CICUserID;
            userPass = getCredentials.CICPassword;
        }
        const user = await models.User.get(data.userID);
        const transactionID = data.tenantOthersOnLeaseID !== 0 ? data.tenantOthersOnLeaseID : data.tenantID;

        const xmlData = `
            <?xml version="1.0" encoding="UTF-8" ?>
            <ScreeningRequest>
                <Request Type="New">
                    <Account>
                        <AppVersion>002</AppVersion>
                        <UserID>${userID}</UserID>
                        <UserPassword>${userPass}</UserPassword>
                        <AppUserID>${user.UserEmail}</AppUserID>
                        <AppCustID>${data.propertyID}</AppCustID>
                    </Account>
                    <ReferenceInformation>	
                        <TransactionID>${transactionID}</TransactionID>
                        <Reference>${data.propertyID}</Reference>
                    </ReferenceInformation>
                    <Products>
                        <HostControlOnly>Y</HostControlOnly>
                    </Products>
                    <Applicant>
                        <LastName>${data.lastName}</LastName>
                        <FirstName>${data.firstName}</FirstName>
                        <MiddleInit>${data.middleNameInit}</MiddleInit>
                        <Suffix>${data.suffix}</Suffix>
                        <DOB>${data.dob}</DOB> 
                        <SSN>${data.ssn}</SSN>
                        <MonthlyIncome>${data.monthlyIncome}</MonthlyIncome>
                        <MonthlyRentAmount>${data.rent}</MonthlyRentAmount>
                        <Address>
                            <HouseNumber>${data.houseNumber}</HouseNumber> 
                            <Street>${data.street}</Street> 
                            <Unit>${data.unit}</Unit> 
                            <City>${data.city}</City> 
                            <State>${data.state}</State> 
                            <Zip>${data.zip}</Zip>
                        </Address>
                    </Applicant>
                </Request>
            </ScreeningRequest>
        `;

        const requestURL = 'https://www.securecontinfo.com/API/prod/';

        await axios.post(requestURL, xmlData, 
            { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'} })
            .then(async (result) => {
                const parser = new xml2js.Parser();
                parser.parseStringPromise(result.data).then(async (report) => {
                    const cicResponse = report.ScreeningResponse.Response[0];
                    if(cicResponse.Errors !== undefined) {
                        return res.json(cicResponse.Errors)
                    }
                    const reportID = cicResponse.Report[0].ReportID[0];
                    const key = cicResponse.Report[0].KEY[0];
                    await models.CreditCheckLog.add({
                        propertyID: data.propertyID,
                        userID: data.userID,
                        reportID,
                        key,
                        tenantID: data.tenantID,
                        tenantOthersOnLeaseID: data.tenantOthersOnLeaseID
                    });

                    return res.json(0);
                })
            })
            .catch(async (error) => {
                const email = new Email();
                await email.errorEmail(
                    error,
                    "iRent Backend - CIC Controller - runReport"
                );
                return res.json(-1);
            });

    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - CIC Controller - runReport"
        );
        return res.json(-1);
    } 
}