const builder = require('xmlbuilder');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require("path");

const Email = require('../../util/email');

const today = new Date();
const IP = "65.175.100.122";

exports.createFeed = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        let buildXML;
        const xml = fs.readFileSync(path.resolve(__dirname, "./oodle.xml"), 'utf8');
        const parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            
            const listings = result.listings.listing || [];
            for(let i=0; i<listings.length; i++) {
                if(listings[i].id[0] === data.id) {
                    delete result.listings.listing[i];
                    break;
                }
            }
            buildXML = result;
        });

        // Generate the XML
        const root = builder.create('listing');
        root.ele("category", "Apartments for Rent"); 
        root.ele("description", `${data.PropertyName}`);
        root.ele("id", data.id);
        root.ele("title", data.PropertyName);
        root.ele("url", "http://myirent.com");

        root.ele("address", data.PropertyAddress1);
        root.ele("city", data.PropertyCity);
        root.ele("country", data.PropertyState);
        root.ele("state", "US");
        root.ele("zip_code", data.PropertyZip);

        root.ele("agent", data.PropertyManager);
        root.ele("agent_email", data.PropertyManagerEmail);
        root.ele("agent_phone", data.PropertyManagerPhone);
        root.ele("agent_url");

        root.ele("amenities");
        root.ele("balconies");
        root.ele("bathrooms", data.Bathrooms);
        root.ele("bedrooms", data.Bedrooms);

        root.ele("broker", data.PropertyManager);
        root.ele("broker_email", data.PropertyManagerEmail);
        root.ele("broker_phone", data.PropertyManagerPhone);
        root.ele("broker_url");

        root.ele("condition", "existing");
        root.ele("create_time", today.toISOString());
        root.ele("currency", "USD");

        root.ele("event_date");
        root.ele("expire_time");
        root.ele("facing");
        root.ele("fee", "no");

        root.ele("furnished", data.Furnished);
        let images = "";
        for(const img of data.images){
            images += img + "|";
        }
        root.ele("image_url", images.substring(0, images.length-1));
        root.ele("ip_address", IP);

        root.ele("lot_size");
        root.ele("lot_size_units", "acres");
        root.ele("mls_id", data.PropertyID);

        root.ele("price", parseFloat(data.UnitCharge).toFixed(2));
        root.ele("registration", "no");

        root.ele("seller_email", data.PropertyManagerEmail);
        root.ele("seller_name", data.PropertyManager);
        root.ele("seller_phone", data.PropertyManagerPhone);
        root.ele("seller_type", "by owner");
        root.ele("seller_url");
        root.ele("square_feet");
        root.ele("vastu_compliant");
        root.ele("year");  

        parser.parseString(root, function (err, result) {
            buildXML.listings.listing.push(result.listing);
        });

        const generateXML = new xml2js.Builder();
        const generatedXML = generateXML.buildObject(buildXML);
        fs.writeFileSync(path.resolve(__dirname, "./oodle.xml"), generatedXML, 'utf8');

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Oodle Controller - createFeed"
        );
        return res.json(-1);
    }  
}

exports.getXML = async (req, res, next) => {
    return res.type('application/xml').send(
        fs.readFileSync(path.resolve(__dirname, "./oodle.xml"), 'utf8')
    );
}