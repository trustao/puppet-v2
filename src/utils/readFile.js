import fs from 'fs'
import path from 'path'

export const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(getPath(filePath), {encoding: 'utf8'}, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

export const pathExists = (path) => {
  return fs.existsSync(getPath(path))
}

export const mkdir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err){
        reject(err);
        return
      }
      resolve()
    });
  })
}

export const getPath = (u) => {
  return path.resolve(docPath, u)
}

const docPath = path.resolve(__static, process.env.NODE_ENV === 'development' ? './doc' : '../../doc')