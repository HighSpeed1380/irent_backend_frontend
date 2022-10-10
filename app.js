const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');           
const compression = require('compression'); // compression file
const cors = require('cors');

const app = express();
app.use(cors());

const testRoute = require('./routes/test');
//routes
const reportsRoute = require('./routes/reports');
// Home
const homeRouter = require('./routes/Home/home');
const companyRouter = require('./routes/Company/company');
const propertyRouter = require('./routes/Properties/properties');
const screeningRouter = require('./routes/BackgroundScreening/backgroundScreening');
// Company Profile
const companyProfile = require('./routes/Company/profile');
// Boards
const boardsRouter = require('./routes/Boards/boards');
// Forms
const formsRouter = require('./routes/FormsCreator/formsCreator');
// Chatbot
const chatBotRouter = require('./routes/ChatBot/chatbot');
// Bills
const billsRouter = require('./routes/Bills/bill');
// Check Register
const checkRegisterRouter = require('./routes/CheckRegister/checkRegister');
// Tenants
const tenantsRouter = require('./routes/Tenants/tenants');
// Login
const loginRouter = require('./routes/Login/Login');
// Deposit
const depositRouter = require('./routes/Deposit/Deposit');
// Work Orders
const workOrdresRouter = require('./routes/WorkOrders/WorkOrders');
// Printable 
const PrintableRouter = require('./routes/Printable/Printable');
// Helper
const helperRouter = require('./routes/Helper/helper');
// Profile
const profileRouter = require('./routes/Profile/Profile');
// Vendors
const vendorRouter = require('./routes/Vendors/Vendors');
// Applicants
const applicantsRouter = require('./routes/Applicants/applicants');
// Users
const usersRouter = require('./routes/Users/Users');
// Checks
const checksRouter = require('./routes/Checks/checks');

app.use(helmet());
app.use(compression());
app.use(express.json({limit: '250mb'}));

app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: false
}));
app.use(bodyParser.json({limit: "50mb"}));

app.use('/test', testRoute);
app.use('/reports', reportsRoute);
app.use('/home', homeRouter);
app.use('/company', companyRouter);
app.use('/property', propertyRouter);
app.use('/backgroundScreening', screeningRouter);
app.use('/boards', boardsRouter);
app.use('/forms', formsRouter);
app.use('/chatbot', chatBotRouter);
app.use('/bills', billsRouter);
app.use('/checkRegisterRouter', checkRegisterRouter);
app.use('/tenants', tenantsRouter);
app.use('/login', loginRouter);
app.use('/deposit', depositRouter);
app.use('/workOrders', workOrdresRouter);
app.use('/printable', PrintableRouter);
app.use('/helper', helperRouter);
app.use('/profile', profileRouter);
app.use('/vendors', vendorRouter);
app.use('/companyProfile', companyProfile);
app.use('/applicants', applicantsRouter);
app.use('/users', usersRouter);
app.use('/checks', checksRouter);

// 404 error
app.use((req, res, next) => {
    res.status(404).send('<h1>Page Not Found</h1>');
});

app.listen(process.env.PORT || 3006);
