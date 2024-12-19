const fs = require("fs");
const path = require("path");
const downloader = require("../downloader/downloader");
const parser = require("../parser/parser");

async function triggerWordStart(message, 
                                sendFunction, 
                                {url, channelId, startWord, saveVideo, selector},
                                sendMessage,
                                chatId) {

    let messageArr = message.split(" ").filter(e => e.length !== 0);
    let offset = 0;
    let channelIdFormat;
    let messageFormat = "full";

    if (messageArr[0] !== startWord) {
        await sendMessage(chatId, "Wrong start word");
        return;
    }

    let num = Number(messageArr[1]);
    if (Number.isInteger(num) && num > 0) {
        offset = num;
    }
    if (num < 0) {
        await sendMessage(chatId, "The number of videos requested must be an integer greater than zero");
        return;
    }

    switch(messageArr[2]) {
        case (undefined):
        case "full":
            channelIdFormat = channelId.full;
            break;
        case "audio":
            messageFormat = "audio";
            channelIdFormat = channelId.audio;
            break;
        case "video":
            messageFormat = "video";
            channelIdFormat = channelId.video;
            break;  
        default:
            await sendMessage(chatId, "Unknown format of requested data");
            return;
    }

    console.log(`${url}: start of processing`);
    await parser(url, offset, selector)
        .then(async (arr) => {
            if (arr.length === 0) {
                await sendMessage(chatId, "Video links not found, the Youtube selector may have been changed");
                return;
            }
            downloader(arr, url, channelIdFormat, saveVideo, sendFunction, offset, messageFormat)
        })
        .then(() => console.log(`${url}: end of processing`))
        .catch(async (e) => {
            console.log({message: `${url}: process error - ${e}`});
            await sendMessage(chatId, "Unknown error, try again later");
            return;
        });
}

module.exports = triggerWordStart;

