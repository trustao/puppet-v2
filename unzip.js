const fs = require('fs')
const path = require('path')
const unzip = require('unzipper')

const unZipToDir = (path, dir) => {
  if (!fs.existsSync(path)) return
  if (!dir) {
    dir = path.slice(0, path.lastIndexOf('.') || path.length)
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const stream = fs.createReadStream(path).pipe(unzip.Extract({ path: dir }));
  console.log('unZip')
  return new Promise((resolve, reject) => {
    stream.on('close', () => {
      const files = getFiles(dir)
      console.log('on Close !#@$@~!', files)
      resolve(files)
    })
  })

}

unZipToDir(path.join(__dirname, './static/doc/download/店铺商品列表_20200223230124.zip'), path.join(__dirname, './static/doc/download/'), )