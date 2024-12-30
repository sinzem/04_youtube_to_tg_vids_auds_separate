require('dotenv').config();
const fs = require('fs');
const path = require("path");
const TGBot = require("node-telegram-bot-api");
const triggerWordStart = require("./triggerWordStart/triggerWordStart");
const yolcuBeats = require("./channel/yolcuBeats");
const mentalpsyzone = require("./channel/mentalpsyzone");

const token = process.env.TELEGRAM_TOKEN;

const bot = new TGBot(token, {polling: true});

bot.on("message", async (msg) => {  
    const chatId = msg.chat.id;
    const text = msg.text;  
    if (text === "/start") {
        await bot.sendMessage(chatId, "Hello")
    }

    if (text.includes(yolcuBeats.startWord)) {
        try {
            triggerWordStart(text, sendToChannel, yolcuBeats, sendMessage, chatId);
        } catch (e) {
            await bot.sendMessage(chatId, "An error occurred, please try later")
        }
    }

    if (text.includes(mentalpsyzone.startWord)) {
        try {
            triggerWordStart(text, sendToChannel, mentalpsyzone, sendMessage, chatId);
        } catch (e) {
            await bot.sendMessage(chatId, "An error occurred, please try later")
        }
    }
})



async function sendToChannel(method, dataPath, channelId) {
    if (fs.existsSync(dataPath)) {
        try {
            const stream = fs.createReadStream(dataPath);
            if (method === "video") {
                await bot.sendVideo(channelId, stream, {}, {contentType: "application/octet-stream"});
            } else if (method === "audio") {
                await bot.sendAudio(channelId, stream);
            }
        } catch (e) {
            console.log({message: `Error sending file: ${e}`});
        }
    }
}

async function sendMessage(chatId, message) {
    await bot.sendMessage(chatId, message);
}



