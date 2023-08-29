const express = require('express');
const puppeteer = require("puppeteer");
const {pdfCss} = require("./css");
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/pdf', async function(req, res, next) {
  res.contentType("application/pdf");
  res.send(await printPdf(req.body.data))
});

async function printPdf(html) {
  const browser = await puppeteer.launch({
    headless: 'new',
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
