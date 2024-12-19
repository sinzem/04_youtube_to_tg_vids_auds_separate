require('dotenv').config();
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');

async function parser(url, offset, selector) {

    const channelName = url.split("/").at(-2);
    const linksDb = path.resolve(__dirname, "..", "db", `${channelName}.json`)
   
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({
        width: 1200,
        height: 800
    });

    if (!fs.existsSync(linksDb) || offset > 42) {
      let links = await page.evaluate(async (classes) => {
        const distance = 80;
        const delay = 400;
        while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
            document.scrollingElement.scrollBy(0, distance);
            await new Promise(resolve => { setTimeout(resolve, delay); });
        }
        const array = document.querySelectorAll(classes);
        const links = [];
        array.forEach(e => links.push(e.href));
        return links;
      }, selector);
      if(!fs.existsSync(path.resolve(__dirname, "..", "db"))) {
        fs.mkdirSync(path.resolve(__dirname, "..", "db"));
      }
      fs.writeFileSync(linksDb, JSON.stringify(links));
    }

    let arr = await page.evaluate((classes) => {
        let shorts = document.querySelectorAll(classes);
        
        let linksAll = [];
        shorts.forEach(e => linksAll.push(e.href));
        return linksAll;
    }, selector)

    await browser.close();
    console.log(arr);
    return arr;
};

module.exports = parser;



