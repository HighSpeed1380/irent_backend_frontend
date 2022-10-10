const express =  require('express');
const router = express.Router();

const chatBotController = require('../../controllers/ChatBot/ChatBot');

router.post('/getVideos', chatBotController.getVideos);

module.exports = router;