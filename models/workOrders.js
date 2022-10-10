const db = require('../util/database');

const formattedDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = class WorkOrders {

    async getTenantWK(tID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT u.UnitName, wk.WorkOrderSubmitDate, wk.WorkOrderDescription, wk.WorkOrderComment, t.PropertyID,
                wk.WorkOrderCompleteDate, s.Status, p.Priority, wk.WorkOrderID, wk.UserID, us.UserFName, us.UserLName
                FROM  WorkOrders wk
                JOIN units u ON wk.unitID = u.unitID
                JOIN Tenants t ON u.unitID = t.unitID
                JOIN Status s ON s.StatusID = wk.WorkOrderComplete
                JOIN Priority p ON p.PriorityID = wk.PriorityID
                LEFT JOIN Users us ON wk.UserID = us.UserID
                WHERE t.TenantID = ${tID}
                AND wk.WorkOrderSubmitDate >= t.MoveInDate 
                AND wk.WorkOrderSubmitDate <= t.MoveOutDate
                AND t.prospect = 2
                ORDER BY wk.WorkOrderSubmitDate
            `);
            if(res[0].length > 0)
                response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getByID(wkID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select * From WorkOrders Where WorkOrderID = ${wkID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async delete(wkID) {
        try {
            await db.execute(`
                Delete From WorkOrders Where WorkOrderID = ${wkID}
            `);
        } catch(err) {
            console.log(err);
        }
    }

    async getOpenWKSummary(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                SELECT unit.UnitName, w.WorkOrderID,
                    u.UserFName, u.UserLName,
                    t.TenantFName, t.TenantLName, t.TenantPhone,
                    w.WorkOrderSubmitDate, w.WorkOrderDescription, w.WorkOrderComment, w.WorkOrderCompleteDate, w.WorkOrderID,
                    s.Status,
                    p.Priority
                FROM WorkOrders w
                INNER JOIN Units unit ON w.UnitID = unit.UnitID
                LEFT JOIN Users u ON w.UserID = u.UserID
                INNER JOIN Tenants t ON unit.UnitID = t.UnitID
                INNER JOIN Priority p ON w.PriorityID = p.PriorityID
                INNER JOIN Status s ON w.WorkOrderComplete = S.StatusID
                Where w.PropertyID = ${pID} AND w.WorkOrderComplete <> 3
                AND t.prospect = 2
                Group By w.WorkOrderID
                Order By w.WorkOrderSubmitDate
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getPrintViewWK(wkID) {
        let response = null;
        try {
            const res = await db.execute(`
                Select wk.WorkOrderID, wk.WorkOrderSubmitDate, u.UserFName, u.UserLName, wk.allowMaintenanceGetIn,
                    wk.WorkOrderDescription, wk.WorkOrderCompleteDate, wk.WorkOrderComment,
                    t.TenantFName, t.TenantLName, ut.UnitName, p.PropertyName, p.PropertyAddress1,
                    p.PropertyAddress2, p.PropertyCity, p.PropertyZip, t.TenantPhone, ut.UnitID
                From WorkOrders wk
                JOIN Properties p on wk.PropertyID = p.PropertyID
                LEFT JOIN Units ut ON wk.UnitID = ut.UnitID
                LEFT JOIN Tenants t ON ut.UnitID = t.UnitID and t.Prospect = 2
                LEFT JOIN Users u ON wk.MaintenanceID = u.UserID
                Where wk.WorkOrderID = ${wkID}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getOpens(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select u.UnitName, t.TenantFName, t.TenantLName, t.TenantPhone, wk.WOrkOrderID, wk.UnitID,
                    wk.WorkOrderSubmitDate, us.UserFName, us.UserLName, WorkOrderDescription, wk.PropertyID,
                    wk.WorkOrderComment, wk.WorkOrderCompleteDate, main.UserFName as MainFName, main.UserLName as MainLName,
                    s.Status, p.Priority, wk.allowMaintenanceGetIn
                From WorkOrders wk
                JOIN Priority p ON p.PriorityID = wk.PriorityID
                JOIN Status s ON s.StatusID = wk.WorkOrderComplete
                LEFT JOIN Units u ON u.UnitID = wk.UnitID
                LEFT JOIN Tenants t ON (t.UnitID = wk.UnitID AND t.MoveInDate <= wk.WorkOrderSubmitDate AND t.MoveOutDate >= wk.WorkOrderSubmitDate)
                LEFT JOIN Users us On us.UserID = wk.UserID
                LEFT JOIN Users main ON main.UserID = wk.MaintenanceID
                Where wk.PropertyID = ${pID}
                AND wk.WorkOrderComplete <> 3
                Order By wk.WorkOrderSubmitDate
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getClosed(pID) {
        let response = [];
        try {
            const res = await db.execute(`
                Select u.UnitName, t.TenantFName, t.TenantLName, t.TenantPhone, wk.WOrkOrderID, wk.UnitID,
                    wk.WorkOrderSubmitDate, us.UserFName, us.UserLName, WorkOrderDescription, wk.PropertyID,
                    wk.WorkOrderComment, wk.WorkOrderCompleteDate, main.UserFName as MainFName, main.UserLName as MainLName,
                    s.Status, p.Priority, wk.allowMaintenanceGetIn
                From WorkOrders wk
                JOIN Priority p ON p.PriorityID = wk.PriorityID
                JOIN Status s ON s.StatusID = wk.WorkOrderComplete
                LEFT JOIN Units u ON u.UnitID = wk.UnitID
                LEFT JOIN Tenants t ON (t.UnitID = wk.UnitID AND t.MoveInDate <= wk.WorkOrderSubmitDate AND t.MoveOutDate >= wk.WorkOrderSubmitDate)
                LEFT JOIN Users us On us.UserID = wk.UserID
                LEFT JOIN Users main ON main.UserID = wk.MaintenanceID
                Where wk.PropertyID = ${pID}
                AND wk.WorkOrderComplete = 3
                Order By wk.WorkOrderSubmitDate
            `);
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addWorkOrder(data) {
        let response = 0;
        try {
            const res = await db.execute(`
                INSERT INTO WorkOrders
                (UnitID, WorkOrderDescription, WorkOrderSubmitDate, WorkOrderCommentDate, WorkOrderComment, 
                WorkOrderComplete, PropertyID, Escrow, EscrowHours, PriorityID, UserID, WorkOrderCompleteDate, 
                MaintenanceID, VendorID, Submittedby)
                VALUES (${data.unitID}, '${data.description}', '${formattedDate(data.submitDate)}', '${formattedDate(new Date())}', 
                '0', 1, ${data.propertyID}, 0, 1, ${data.priorityID}, 
                ${data.userID}, '${formattedDate(new Date())}', ${data.maintenanceID}, ${data.vendorID}, ${data.submittedBy});
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async update(data) {
        try {
            await db.execute(`
                UPDATE WorkOrders
                SET WorkOrderComment = '${data.comment.replace(/"|'/g, '')}',
                    WorkOrderComplete = ${data.status},
                    WorkOrderCommentDate = '${formattedDate(new Date())}',
                    WorkOrderCompleteDate = '${formattedDate(data.completeDt)}',
                    MaintenanceID = ${data.maintenance},
                    Escrow = ${data.escrow},
                    EscrowHours = ${data.escrowHours},
                    PriorityID = ${data.priorityID},
                    VendorID = ${data.vendorID},
                    UserID = ${data.userID}
                Where WorkOrderID = ${data.workOrderID}
            `);
        } catch(err) {
                console.log(err);
            console.log(err);
        }
    }
}
