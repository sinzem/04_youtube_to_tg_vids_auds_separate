require('dotenv').config();

const mentalpsyzone = {
    url: process.env.URL_MENTALPSYZONE,
    channelId: {
        full: process.env.CHANNEL_ID_MENTALPSYZONE_FULL,
        video: process.env.CHANNEL_ID_MENTALPSYZONE_VIDEO,
        audio: process.env.CHANNEL_ID_MENTALPSYZONE_AUDIO
    },
    startWord: process.env.START_WORD_MENTALPSYZONE,
    saveVideo: true,
    selector: ".shortsLockupViewModelHostEndpoint.reel-item-endpoint"
}


module.exports = mentalpsyzone;
