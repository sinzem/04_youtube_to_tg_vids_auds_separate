require('dotenv').config();

const yolcuBeats = {
    url: process.env.URL_YOLCUBEATS,
    channelId: {
        full: process.env.CHANNEL_ID_YOLCUBEATS_FULL,
        video: process.env.CHANNEL_ID_YOLCUBEATS_VIDEO,
        audio: process.env.CHANNEL_ID_YOLCUBEATS_AUDIO
    },
    startWord: process.env.START_WORD_YOLCUBEATS,
    saveVideo: true,
    selector: ".shortsLockupViewModelHostEndpoint.reel-item-endpoint"
}


module.exports = yolcuBeats;
