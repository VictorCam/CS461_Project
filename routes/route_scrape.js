const express = require("express");
const router = express.Router();
const cors = require("cors");
const outlook = require("node-outlook");
const { request } = require("express");
const puppeteer = require('puppeteer');
//const connectsql = require("../server_connection"); // no server connection yet

//EMAIL ='beavDMS@outlook.com', PASSWORD = 'mictur-6nedku-qyDdog'

router.get("/", (req, res) => {
  (async () => {
    const browser = await puppeteer.launch({ headless: false }) //(TRUE == NO BROWSER / FALSE == OPEN BROWSER)
    const page = await browser.newPage()

  
    await page.setViewport({ width: 1280, height: 800 })
     await page.goto('https://login.live.com/', { waitUntil: ['networkidle0'] })
     
  
    const navigationPromise = page.waitForNavigation({ waitUntil: ['networkidle0'] })

    //login username
    await page.waitForSelector('[name="loginfmt"]')
    await page.type('[name="loginfmt"]', "BeavDMS@outlook.com")
    await page.click('[type="submit"]')
    console.log("success #1")
  
    //login password
    await navigationPromise  
    await new Promise(r => setTimeout(r, 300));
    await page.waitForResponse(response => response.status() === 200)
    await page.waitForSelector('input[type="password"]', { visible: true })
    await page.type('input[type="password"]', "mictur-6nedku-qyDdog")
    await page.click('[type="submit"]')
    console.log("success #2")
  
    //persist user session (set to yes)
    await navigationPromise
    await new Promise(r => setTimeout(r, 300));
    await page.waitForResponse(response => response.status() === 200)
    await page.waitForSelector('input[id="idSIButton9"]', { visible: true })
    await page.click('[id="idSIButton9"]')
    console.log("success #3")

    //open mail application
    await navigationPromise
    await new Promise(r => setTimeout(r, 500));
    await page.goto('https://outlook.live.com/mail/0/')
    console.log("success #4")

    //start scrap on emails
    await navigationPromise
    await new Promise(r => setTimeout(r, 6000));
    const example = await page.$$('[class="_1xP-XmXM1GGHpRKCCeOKjP"]'); //$$ == querySelectorAll while $ means select one element

    const data = [];

    //emails.forEach(async (emails) => {
    //await emails.click();
    //console.log("ele", e_msg)
    //push data
    //await page.goBack();
    //});
    //this class contains content (class:rps_76ba)

    for(var i = 0; i < example.length; i++) {
      await example[i].click();
      const e_msg = await page.$('[dir="ltr"]')
      await new Promise(r => setTimeout(r, 2000));
      await console.log("msg", e_msg)
    }

    //console.log(await page.content());
    await page.screenshot({path: 'screenshot.png'});
  
    //await browser.close()
  })()
  res.status(200).send("hello") //saying hello world
});

router.use(cors());

module.exports = router;