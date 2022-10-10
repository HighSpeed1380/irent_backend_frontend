const TenantsModel = require('./tenants');
const CompanyModel = require('./company');
const TenantTransactionsModel = require('./tenantTransactions');
const MoveOutReasonsModel = require('./moveOutReasons');
const UnitsModel = require('./units');
const MoveOutSummaryModel = require('./moveOutSummary');
const WhiteListModel = require('./whiteList');
const SecurityDepositRefundModel = require('./securityDepositRefund');
const CheckRegisterModel = require('./checkRegister');
const TenantOthersOnLeaseModel = require('./tenantOthersOnLease');
const LeadSourceModel = require('./leadSource');
const UserModel = require('./users');
const TenantVehiclesModel = require('./tenantVehicles');
const PropertiesModel = require('./properties');
const TazWorksModel = require('./tazworks');
const CreditCheckLogModel = require('./creditCheckLog');
const DocumentsModel = require('./documents');
const TempSignFormModel = require('./tempSignForm');
const FormsCreatorModel = require('./formsCreator');
const TenantAllocatedPaymentModel = require('./tenantAllocatedPayments');
const WorkOrdersModel = require('./workOrders');
const NotesModel = require('./notes');
const PromissToPayModel = require('./promissToPay');
const TenantEmergencyContactModel = require('./tenantEmergencyContact');
const LeaseViolationsModel = require('./leaseViolations');
const ThreeDayNoticeModel = require('./threeDayNotice');
const BackgroundModel = require('./background');
const PaymentCategoriesModel = require('./paymentsCategory');
const ChargesTypeModel = require('./chargesType');
const FutureLeaseChangeModel = require('./futureLeaseChange');
const DocumentTypesModel = require('./documentTypes');
const DepositSourceModel = require('./depositSource');
const TransactionChangesModel = require('./transactionChanges');
const UnitTypesModel = require('./unitTypes');
const RecurringChargesTaxModel = require('./recurringChargesTax');
const CollectionsModels = require('./collections');
const NotificationsModel = require('./notifications');
const TempTransactionsModel = require('./Temptransactions');
const FormsPrintableModel = require('./forms_Printable');
const SecurityLevelsModels = require('./securityLevels');
const LayoutMapContactModel = require('./layoutMapContact');
const SignedFormsModels = require('./signedForms');
const LeaseViolationTypesModel = require('./leaseViolationTypes');
const StatusModel = require('./status');
const RecurringWorkOrdersModel = require('./recurringworkorders');
const PaymentTypeModel = require('./paymentType');
const LendersModel = require('./lenders');
const EscrowPaymentsModel = require('./escrowPayments');
const JournalModel = require('./journal');
const PreLeasedModel = require('./preLeased');
const ActionItemsModel = require('./actionItems');
const VendorsModel = require('./vendors');
const CustomerBankModel = require('./customerBank');
const CustomerCCModel = require('./customerCC');
const CurrenciesModel = require('./currencies');
const ExpenseTypeModel = require('./expenseType');
const AccountTypeModel = require('./accountType');
const ApproveModel = require('./approve');
const BackgroundScreeningModel = require('./backgroundScreenings');
const PropertyDefaultsModel = require('./propertyDefaults');
const BackgroundVehiclesModel = require('./backgroundVehicles');
const BackgroundReferencesModel = require('./backgroundReferences');
const TenantResponsesModel = require('./tenantResponses');
const ApplicantCreditCardModel = require('./Applicantcreditcard');
const HtmlFormsModel = require('./htmlforms');
const AddOnProductsModel = require('./addOnProducts');
const EpicPayKeysModel = require('./epicpaykeys');
const JournalTypeModel = require('./journalType');
const MakeReadyTasksModel = require('./makeReadyTasks');
const UserPropertyMapModel = require('./userpropertymap');
const FirstTimeUserModel = require('./firstTimeUser');
const CheckModel = require('./checks');

module.exports = {
    Tenants: new TenantsModel(),
    Company: new CompanyModel(),
    TenantTransactions: new TenantTransactionsModel(),
    MoveOutReasons: new MoveOutReasonsModel(),
    Units: new UnitsModel(),
    MoveOutSummary: new MoveOutSummaryModel(),
    WhiteList: new WhiteListModel(),
    SecurityDepositRefund: new SecurityDepositRefundModel(),
    CheckRegister: new CheckRegisterModel(),
    TenantOthersOnLease: new TenantOthersOnLeaseModel(),
    LeadSource: new LeadSourceModel(),
    User: new UserModel(),
    TenantVehicles: new TenantVehiclesModel(),
    Properties: new PropertiesModel(),
    TazWorks: new TazWorksModel(),
    CreditCheckLog: new CreditCheckLogModel(),
    Documents: new DocumentsModel(),
    TempSignForm: new TempSignFormModel(),
    FormsCreator: new FormsCreatorModel(),
    TenantAllocatedPayment: new TenantAllocatedPaymentModel(),
    WorkOrders: new WorkOrdersModel(),
    Notes: new NotesModel(),
    PromissToPay: new PromissToPayModel(),
    TenantEmergencyContact: new TenantEmergencyContactModel(),
    LeaseViolations: new LeaseViolationsModel(),
    ThreeDayNotice: new ThreeDayNoticeModel(),
    Background: new BackgroundModel(),
    PaymentsCategory: new PaymentCategoriesModel(),
    ChargesType: new ChargesTypeModel(),
    FutureLease: new FutureLeaseChangeModel(),
    DocumentTypes: new DocumentTypesModel(),
    DepositSource: new DepositSourceModel(),
    TransactionChanges: new TransactionChangesModel(),
    UnitTypes: new UnitTypesModel(),
    RecurringChargesTax: new RecurringChargesTaxModel(),
    Collections: new CollectionsModels(),
    Notifications: new NotificationsModel(),
    TempTransactions: new TempTransactionsModel(),
    FormsPrintable: new FormsPrintableModel(),
    SecurityLevels: new SecurityLevelsModels(),
    LayoutMapContact: new LayoutMapContactModel(),
    SignedForms: new SignedFormsModels(),
    LeaseViolationTypes: new LeaseViolationTypesModel(),
    Status: new StatusModel(),
    RecurringWorkOrders: new RecurringWorkOrdersModel(),
    PaymentType: new PaymentTypeModel(),
    Lenders: new LendersModel(),
    EscrowPayments: new EscrowPaymentsModel(),
    Journal: new JournalModel(),
    PreLeased: new PreLeasedModel(),
    ActionItems: new ActionItemsModel(),
    Vendors: new VendorsModel(),
    CustomerBank: new CustomerBankModel(),
    CustomerCC: new CustomerCCModel(),
    Currencies: new CurrenciesModel(),
    ExpenseType: new ExpenseTypeModel(),
    AccountType: new AccountTypeModel(),
    Approve: new ApproveModel(),
    BackgroundScreenings: new BackgroundScreeningModel(),
    PropertyDefaults: new PropertyDefaultsModel(),
    BackgroundVehicles: new BackgroundVehiclesModel(),
    BackgroundReferences: new BackgroundReferencesModel(),
    TenantResponses: new TenantResponsesModel(),
    ApplicantCreditCard: new ApplicantCreditCardModel(),
    HtmlForms: new HtmlFormsModel(),
    AddOnProducts: new AddOnProductsModel(),
    EpicPayKeys: new EpicPayKeysModel(),
    JournalType: new JournalTypeModel(),
    MakeReadyTasks: new MakeReadyTasksModel(),
    UserPropertyMap: new UserPropertyMapModel(),
    FirstTimeUser: new FirstTimeUserModel(),
    Check: new CheckModel()
};