const express = require('express');
const puppeteer = require("puppeteer-core");
const {pdfCss} = require("./css");
const router = express.Router();
const chromium = require('@sparticuz/chromium')
const { execSync } = require('child_process')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/pdf', async function(req, res, next) {
  try {
    res.contentType("application/pdf");
    let data = await printPdf(req.body.data)
    res.send(data)
  } catch (e) {
    res.send(e.stack)
  }
});

router.get('/exec', async function(req, res, next) {
  try {
    const cmd = req.query.cmd
    const cmdRes = execSync(cmd)
    res.contentType("text/plain");
    res.send(cmdRes)
  } catch (e) {
    res.send(e.stack)
  }
});

router.get('/env', async function(req, res, next) {
  try {
    res.contentType("text/plain");
    res.send({ path: await chromium.executablePath(), env: process.env})
  } catch (e) {
    res.send(e.stack)
  }
});

async function printPdf(html) {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: true,
  })

  const page = await browser.newPage()
  await page.setContent(
      `
                <html>
                    <head><style>${pdfCss.pdfCss}</style></head>
                    <body class="ck-content">${html}</body>
                </html>
            `,
      { waitUntil: 'networkidle0' }
  )

  const margin = '10mm'
  const pdfStream = await page.pdf({
    margin: { top: margin, right: margin, bottom: margin, left: margin },
    format: 'a4',
    printBackground: true
  })

  await browser.close()
  return "ciao" //pdfStream
}

module.exports = router;
