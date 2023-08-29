const fse = require('fs-extra')

const dst = '.chrome'
const src = process.env.CHROME_PATH

fse.copySync(src, dst)
console.log(`CHROME COPY DONE from ${src} to ${dst}`)
