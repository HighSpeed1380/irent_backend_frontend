const Email = require('../../util/email');

const HelpVideosModel = require('../../models/helpvideos');
const HelpVideos = new HelpVideosModel();

exports.getVideos = async (req, res, next) => {
    try {
        let output = new Map();
        const data = req.body.data || req.body;
        let words = data.sentence.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g,"");
        words = words.split(' ');
        
        for(const word of words) {
            let search = word.trim();
            if(search !== '') {
                const query = await HelpVideos.getByKeyWord(search);
                for(const result of query) {
                    if(!output.has(result.HelpVideosID)) {
                        const posStart = result.VideoEmbed.indexOf('src=') + 5;
                        const posEnd = result.VideoEmbed.indexOf('" width=');
                        const link = result.VideoEmbed.substring(posStart, posEnd);
                        output.set(result.HelpVideosID, {
                            id: result.HelpVideosID,
                            name: result.VideoName,
                            link
                        });
                    }
                }
            }
        }

        return res.json(Array.from(output.values()));
    } catch(err) {
        const email = new Email();
        await email.errorEmail(
            err.toString(),
            "iRent Backend - ChatBot Controller - getVideos"
        );
        return res.json(-1);
    }  
}