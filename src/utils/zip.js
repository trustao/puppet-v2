// import unzip from 'unzipper'
import _ from 'lodash'
import fs from "fs";
import path from "path";

const unzip = {}

/**
 * 映射 d 文件夹下的文件为模块
 */
const getFiles = d => {

  // 获得当前文件夹下的所有的文件夹和文件
  const [dirs, files] = _(fs.readdirSync(d)).partition(p => fs.statSync(path.join(d, p)).isDirectory())

  return files
}


export const unZipToDir = (filePath, dir) => {
  if (!fs.existsSync(filePath)) return Promise.reject()
  if (!dir) {
    dir = filePath.slice(0, filePath.lastIndexOf('.') || filePath.length)
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const stream = fs.createReadStream(filePath).pipe(unzip.Extract({ path: dir }));
  console.log('unZip')
  return new Promise((resolve, reject) => {
    stream.on('close', () => {
      const files = getFiles(dir)
      resolve(files.map(file =>path.join(dir, file)))
    })
  })
}