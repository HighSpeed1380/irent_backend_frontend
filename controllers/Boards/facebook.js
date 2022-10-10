const builder = require('xmlbuilder');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require("path");

const Email = require('../../util/email');

exports.createFeed = async (req, res, next) => {
    try {
        const data = req.body.data || req.body;
            
        let buildXML;
        const xml = fs.readFileSync(path.resolve(__dirname, "./facebook.xml"), 'utf8');
        const parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
            
            const listings = result.listings.listing || [];
            for(let i=0; i<listings.length; i++) {
                if(listings[i].home_listing_id[0] === data.id) {
                    delete result.listings.listing[i];
                    break;
                }
            }
            buildXML = result;
        });

        // Generate the XML
        const root = builder.create('listing');
        root.ele("home_listing_id", data.id);
        root.ele("name", data.PropertyName);
        root.ele("availability", "for_rent");
        root.ele("description", data.PropertyName);
        
        const address = root.ele("address", {'format': 'simple'});
        address.ele("component", {'name': 'addr1'}, data.PropertyAddress1);
        address.ele("component", {'name': 'city'}, data.PropertyCity);
        address.ele("component", {'name': 'region'}, data.PropertyState);
        address.ele("component", {'name': 'country'}, 'United States');
        address.ele("component", {'name': 'postal_code'}, data.PropertyZip);

        for(const img of data.images) {
            const xmlImage = root.ele("image");
            xmlImage.ele("url", img);
        }

        root.ele("listing_type", "for_rent_by_owner");
        root.ele("num_baths", data.Bathrooms);
        root.ele("num_beds", data.Bedrooms);
        root.ele("num_units", data.totalUnits || 1);
        root.ele("price", parseFloat(data.UnitCharge).toFixed(2));
        root.ele("property_type", "apartment");
        root.ele("url", "https://myirent.com");

        parser.parseString(root, function (err, result) {
            buildXML.listings.listing.push(result.listing);
        });

        const generateXML = new xml2js.Builder();
        const generatedXML = generateXML.buildObject(buildXML);
        fs.writeFileSync(path.resolve(__dirname, "./facebook.xml"), generatedXML, 'utf8');

        return res.json(0);
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err,
            "iRent Backend - Facebook Controller - createFeed"
        );
        return res.json(-1);
    } 
}

exports.getXML = async (req, res, next) => {
    return res.type('application/xml').send(
        fs.readFileSync(path.resolve(__dirname, "./facebook.xml"), 'utf8')
    );
}