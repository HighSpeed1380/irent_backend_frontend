const db = require('../util/database');

const RHAWAFORMSID = 993;

module.exports = class FormsCreator {

    async getbyID(id) {
        let response = 0;
        try {
            const res = await db.execute(`
                SELECT * From FormsCreator
                Where FormsCreatorID = ${id}
            `);
            if(res[0].length > 0)
                response = res[0][0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getForm(data) {
        let response = {
            content: "",
            isDefault: false,
            formPrintableID: 0
        };
        try {
            let res;
            res = await db.execute(`
                SELECT * FROM forms_printable
                Where PropertyID = ${data.propertyID}
                AND formcreatorid = ${data.FormsCreatorID}
            `);
            if(res[0].length === 0) {
                // Get default form
                const propID = data.leadSourceCompanyID === 337 ? RHAWAFORMSID : 0;
                res = await db.execute(`
                    SELECT * FROM forms_printable
                    Where formcreatorid = ${data.FormsCreatorID}
                    AND PropertyID = ${propID}
                `);
                response.isDefault = true;
            }
            for(const f of res[0]) {
                response.content += f.Form;
                response.formPrintableID = f.Forms_PrintableID;
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getForms(data) {
        let response = [];
        try {
            let res;
            if(data.leadSourceCompanyID === 337) {  // RHAWA
                res = await db.execute(`
                    SELECT * FROM formscreator
                    Where PropertyID in (${RHAWAFORMSID}, ${data.propertyID})
                    Order By FormName
                `);
            } else {
                res = await db.execute(`
                    SELECT * FROM formscreator
                    Where PropertyID in (${data.propertyID}, 0)
                    Order By FormName
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getLeadSource(pID) {
        let response = 0;
        try {
            const res = await db.execute(`
                SELECT c.LeadSourceCompanyID 
                From Properties p 
                JOIN Company c ON p.CompanyID = c.CompanyID
                Where p.PropertyID = ${pID}
            `);
            response = res[0][0].LeadSourceCompanyID;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async delete(formID, propID) {
        try {
            // Do NOT delete Default forms
            await db.execute(`
                DELETE From formscreator 
                Where FormsCreatorID = ${formID} and PropertyID not in (0, ${RHAWAFORMSID})
            `);
            await db.execute(`
                DELETE From forms_printable 
                Where FormCreatorID = ${formID} and PropertyID = ${propID}
            `);
        } catch(err) {
            console.log(err);
        }
        return 0;
    }

    async getFormsPrintable(data) {
        let id = 0;
        try {
            const res = await db.execute(`
                Select Forms_PrintableID From forms_printable 
                Where FormCreatorID = ${data.formID} and PropertyID = ${data.propertyID}
            `)
            if(res[0].length > 0)
                id = res[0][0].Forms_PrintableID;
        } catch(err) {
            console.log(err);
        }
        return id;
    }

    async updateFormsPrintable(data) {
        try {
            await db.execute(`
                Update forms_printable 
                set Form = '${data.Form}'
                Where Forms_PrintableID = ${data.id}
            `)
        } catch(err) {
            console.log(err);
        }
        return 0;
    }

    async addFormsPrintable(data) {
        try {
            await db.execute(`
                INSERT INTO forms_printable(Form_Name, Form, PropertyID, FormCreatorID) 
                VALUES('${data.FormName}', '${data.Form}', ${data.PropertyID}, ${data.FormCreatorID})
            `)
        } catch(err) {
            console.log(err);
        }
        return 0;
    }

    async getDefault(formID, leadsourceID) {
        let response = "";
        try {
            const propID = leadsourceID === 337 ? RHAWAFORMSID : 0;
            
            const res = await db.execute(`
                SELECT * From forms_printable
                Where FormCreatorID = ${formID}
                and PropertyID = ${propID}
            `);
            if(res[0].length > 0)
                response = res[0][0].Form;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async addFormsCreator(data) {
        let response = 0;
        try {
            let res = await db.execute(`
                INSERT INTO formscreator (FormName, PropertyID, OrderForms)
                VALUES ('${data.FormName}', ${data.PropertyID}, 0)
            `);
            response = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async createForms(data) {
        let response = {
            formsCreatorID: 0,
            formsPrintableID: 0
        };
        try {
            let res = await db.execute(`
                INSERT INTO formscreator (FormName, PropertyID, OrderForms)
                VALUES ('${data.FormName}', ${data.PropertyID}, 0)
            `);
            response.formsCreatorID = res[0].insertId;

            res = await db.execute(`
                INSERT INTO forms_printable (Form_Name, Form, PropertyID, FormCreatorID)
                VALUES ('${data.FormName}', '', ${data.PropertyID}, ${response.formsCreatorID})
            `);
            response.formsPrintableID = res[0].insertId;
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getFormsPrintableContent(data) {
        let response = "";
        try {
            let res = await db.execute(`
                SELECT * From forms_printable
                Where FormCreatorID = ${data.formID}
                and PropertyID = ${data.propID}
            `);
            if(res[0].length > 0)
                response = res[0][0].Form;
            else {
                const leadsourceID = await this.getLeadSource(data.propID);
                const propID = leadsourceID === 337 ? RHAWAFORMSID : 0;
                    
                res = await db.execute(`
                    SELECT * From forms_printable
                    Where FormCreatorID = ${data.formID}
                    and PropertyID = ${propID}
                `);
                if(res[0].length > 0)
                    response = res[0][0].Form;
            }
        } catch(err) {
            console.log(err);
        }
        return response;
    }

    async getTenantListForm(data) {
        let response = [];
        try {
            let res;
            if(data.RHAWA) {  // RHAWA
                res = await db.execute(`
                    Select FormsCreatorID, FormName, PropertyID, OrderForms, PDFForm, IFNULL(GroupName,"Default") as GroupName
                    From formscreator
                    Where PropertyID in (993, ${data.propertyID})
                    Order By OrderForms, FormName
                `);
            } else {
                res = await db.execute(`
                    Select * From formscreator
                    Where PropertyID in (${data.propertyID}, 0)
                    Order By FormName
                `);
            }
            response = res[0];
        } catch(err) {
            console.log(err);
        }
        return response;
    }
}