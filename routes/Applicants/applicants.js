const express =  require('express');
const router = express.Router();

const applicantsController = require('../../controllers/Applicants/applicants');

router.get('/getProspects/:pID', applicantsController.getProspects);
router.get('/deniedProspect/:tID', applicantsController.deniedProspect);
router.get('/getUnitTypes/:pID', applicantsController.getUnitTypes);
router.get('/getLeadSources/:cID', applicantsController.getLeadSources);
router.post('/convertToApplicant', applicantsController.convertToApplicant);
router.post('/updateProspectApplicant', applicantsController.updateProspectApplicant);
router.get('/getApplicants/:pID', applicantsController.getApplicants);
router.get('/getReviewData', applicantsController.getReviewData);
router.post('/reviewApplicant', applicantsController.reviewApplicant);
router.post('/getTazworksReportURL', applicantsController.getTazworksReportURL);
router.get('/getOthersOnLease/:tID', applicantsController.getOthersOnLease);
router.post('/addLeaseHolder', applicantsController.addLeaseHolder);
router.post('/updateLeaseHolder', applicantsController.updateLeaseHolder);
router.get('/getPropertyByID/:pID', applicantsController.getPropertyByID);
router.get('/getUnitDetails/:uID', applicantsController.getUnitDetails);
router.post('/convertToTenant', applicantsController.convertToTenant);
router.post('/getDeniedProspects', applicantsController.getDeniedProspects);
router.get('/removeProspect/:tID', applicantsController.removeProspect);
router.post('/addNewProspectApplicant', applicantsController.addProspectApplicant);
router.get('/getCompanyDetails/:cID', applicantsController.getCompanyDetails);
router.get('/getBackgroundPackages/:cID', applicantsController.getBackgroundPackages);
router.get('/getApplicantCreditCard/:tID', applicantsController.getApplicantCreditCard);
router.get('/getTentOthersOnLeaseByID/:tolID', applicantsController.getTentOthersOnLeaseByID);
router.post('/getRunBSDetails', applicantsController.getRunBSDetails);
router.get('/getVicTigSignUpData/:cID', applicantsController.getVicTigSignUpData);
router.post('/submitVicTigDocs', applicantsController.submitVicTigDocs);
router.get('/getTenantUnitType/:utID', applicantsController.getTenantUnitType);
router.get('/getTenantLeadSource/:lsID', applicantsController.getTenantLeadSource);
router.get('/getTenantVehicles/:tID', applicantsController.getTenantVehicles);
router.get('/getTenantReferences/:tID', applicantsController.getTenantReferences);
router.get('/companyNeedToSignUpScreening/:cID', applicantsController.companyNeedToSignUpScreening);

module.exports = router;