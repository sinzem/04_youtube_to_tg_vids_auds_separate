const fs = require("fs");
const path = require("path");
const youtubedl = require("youtube-dl-exec");
const ffmpeg = require('fluent-ffmpeg');

async function downloader(arr, url, channelId, save, sendFunction, offset, messageFormat) {
   
    const channelName = url.split("/").at(-2);
    const dbPath = path.resolve(__dirname, "..", "db", `${channelName}.json`);
    const videosAll = (__dirname, "..", "videos");
    const videosDir = path.resolve(videosAll, channelName);
  
    if(!fs.existsSync(path.resolve(__dirname, "..", "db"))) {
        fs.mkdirSync(path.resolve(__dirname, "..", "db"));
    }
    if(!fs.existsSync(videosAll)) {
        fs.mkdirSync(videosAll);
    }
    if(!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify([]));
    }
    if(!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir);
    }
   
    const processedLinks = JSON.parse(fs.readFileSync(dbPath, {encoding: "utf8"}));
    if (offset > 0) {
        processedLinks.splice(0, offset);
    }
    
    let arrWithDeffence = [];

    arr.forEach(i => (!processedLinks.includes(i)) ? arrWithDeffence.push(i) : null);

    while (arrWithDeffence.length) {
        const downloadLink = arrWithDeffence.pop();
        const nameVideo = downloadLink.split("/").at(-1);
        const nameVideoFormat = downloadLink.split("/").at(-1) + ".mp4";
        const videoPath = path.resolve(videosDir, nameVideoFormat);
        if (!fs.existsSync(videoPath)) {
            try {
                await youtubeDownloader(downloadLink, videosDir, nameVideoFormat);
            } catch (e) {
                console.log({message: `Error while downloading file: ${e}`});
            }
        }
       
        processedLinks.unshift(downloadLink);

        let newName;
        switch(messageFormat) {
            case (undefined):
            case "full":
                await sendFunction("video", videoPath, channelId); 
                break;
            case "audio":
                newName = nameVideo + "_audio.mp3";
                await processVideo("audio", videoPath, path.resolve(videosDir, newName), newName)
                    .then(() => sendFunction("audio", path.resolve(videosDir, newName), channelId))
                    .then(() => fs.rmSync(path.resolve(videosDir, newName)))
                    .catch((e) => console.log({message: `Sending failed: ${e}`}));
                break;
            case "video":
                newName = nameVideo + "_video.mp4";
                await processVideo("video", videoPath, path.resolve(videosDir, newName), newName)
                    .then(() => sendFunction("video", path.resolve(videosDir, newName), channelId))
                    .then(() => fs.rmSync(path.resolve(videosDir, newName)))
                    .catch((e) => console.log({message: `Sending failed: ${e}`}));
                break;
            default:
                console.log("Unknown format")
                return;
        }
        
        if (fs.existsSync(videoPath) && save === false) {
            try {
                fs.rmSync(videoPath);
            } catch (e) {
                console.log({message: `File deletion error ${e}`});
            }
            
        }
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(processedLinks));

    return true;
}

async function youtubeDownloader(address, folder, name) {
    await youtubedl(address, {
        noWarnings: true,
        preferFreeFormats: true,
        f: "mp4",
        o: name,
        paths: folder
    }).then((output) => console.log(output));
}

async function processVideo(format, source, output, outputName) {
    try {
        if (format === "audio") {
            await ffmpegAudioPromise(source, output);
            console.log(`${outputName} processed successfully`);
        } else if (format === "video") {
            await ffmpegVideoPromise(source, output);
            console.log(`${outputName} processed successfully`);
        }
    } catch (error) {
        console.error('Error occurred while processing the file:', error);
    }
}

function ffmpegAudioPromise(source, output) {
    return new Promise((resolve, reject) => {
        ffmpeg(source)
        .noVideo()
        .audioCodec('libmp3lame')
        .output(output)
        .on('end', () => resolve())
        .on('error', (err) => {
            console.error('Ошибка:', err);
            reject(err);
        })
        .run();
    });
}

function ffmpegVideoPromise(source, output) {
    return new Promise((resolve, reject) => {
        ffmpeg(source)
        .videoCodec('libx264')
        .noAudio()
        .output(output)
        .on('end', () => resolve())
        .on('error', (err) => {
            console.error('Ошибка:', err);
            reject(err);
        })
        .run();
    });
}

module.exports = downloader;