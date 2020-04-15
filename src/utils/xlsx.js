import XLSX from 'xlsx'
import docConfig from '../../doc.config'
import {mkdir, pathExists, getPath} from "./readFile";
import {webFrame} from 'electron'
import moment from 'moment'
import path from 'path'
import fs from "fs";

const FILE_TYPE = '.xls'

export const getColumn = (workbook, columnName, sheetName, start, end) => {
  if (sheetName) {
    return getColumnFromSheet(workbook.Sheets[sheetName], columnName, start, end)
  } else {
    return workbook.SheetNames.reduce(
      (pre, sheetName) =>
        pre.concat(
          getColumnFromSheet(workbook.Sheets[sheetName], columnName, start, end)
        ),
      []
    )
  }
}


export async function SKUFiles2PopFiles(fileList) {
  const list = [...fileList]
  const res = []
  while (list.length) {
    const file = list.shift()
    console.log('!!@', file)
    const workbook = readXlsxFromPath(file)
    const columnData =  getColumn(workbook, 'A')
    columnData.splice(0, 2) // 前两列不要
    const popList = await splitPopDoc(columnData)
    res.push(...popList)
  }
  console.log(res)
  return res
}

export async function zipXls2LogisticsFile(fileList, state) {
  const list = [...fileList]
  const res = []
  while (list.length) {
    const file = list.shift()
    const workbook = readXlsxFromPath(file)
    const columnData =  getColumn(workbook, 'D') // 事业部商品编码
    columnData.splice(0, 2) // 前两列不要
    const popList = await splitPopDoc(columnData, state, 'goods', 'logistics')
    res.push(...popList)
  }
  console.log(res)
  return res
}

export async function logisticsFile2StoreFile(fileList, state) {
  const list = [...fileList]
  const res = []
  while (list.length) {
    const file = list.shift()
    const workbook = readXlsxFromPath(file)
    const columnData =  getColumn(workbook, 'A') // 事业部商品编码
    columnData.splice(0, 2) // 前两列不要
    const popList = await splitPopDoc(columnData, state, 'purchase', 'store')
    res.push(...popList)
  }
  console.log(res)
  return res
}

export async function splitPopDoc(columnData, state = {}, configKey = 'popShop', type = 'pop') {
  const max = docConfig[configKey].maxRow
  let start = 0
  let end = start + max - 1
  let now = Date.now().toString(36) + Math.random().toString(36).slice(3, 5)
  let dataArr = columnData.slice(start, end)
  const pathArr = []
  while (dataArr.length) {
    const docPath = createFilePath(type, `${now}-${start}-${end}`)
    await createPopShopFile(dataArr, state,  docPath, configKey)
    pathArr.push(docPath + FILE_TYPE)
    start = end
    end =  start + max - 1
    dataArr = columnData.slice(start, end)
  }
  return pathArr
}


export async function createPopShopFile(data, state = {}, path, configKey) {
  console.log(data, state)
  const {head, fillCol, fillKey} = docConfig[configKey].template
  const dataJson = [
    [...head],
  ]
  for (let i = 0; i < data.length; i++) {
    const row = Array(head.length).fill('').map((e, j) => {
      const idx = fillCol.indexOf(j)
      if (idx >= 0) {
        const key = fillKey[idx]
        if (key === '$$$') {
          return data[i]
        } else {
          return state[key] || ''
        }
      } else {
        return ''
      }
    })
    dataJson.push(row)
  }
  const sheet = createSheet(dataJson)
  const workbook = createWrokBox()
  appendSheetToWorkbook(workbook, sheet, 'POP商品导入')
  await createXlsxFile(workbook, path)
}

export function sheetToJson(sheet) {
  return XLSX.utils.sheet_to_json
}


export function createSheet(dataArr) {
  return XLSX.utils.aoa_to_sheet(dataArr)
}

export function appendSheetToWorkbook(workboox, sheet, sheetName) {
  XLSX.utils.book_append_sheet(workboox, sheet, sheetName);
}

export function getColumnFromSheet(sheet, column, start, end) {
  const parsedRef = parseRef(sheet['!ref'])
  if (!parsedRef || !columnInRange(column, parsedRef)) return []
  if (!start) start = parsedRef.col[0]
  if (!end) end = parsedRef.col[1]
  const res = []
  for (let i = start; i <= end; i++) {
    const cellName = `${column.toUpperCase()}${i}`;
    const cell = sheet[cellName]
    res.push(cell ? cell.v : '')
  }
  return res
}

export function columnInRange(column, parsedRef) {
  const {row} = parsedRef
  const [min, max] = row
  if (!min && !max || !column) return false
  return parseInt(column, 36) >= parseInt(min, 36) && parseInt(column, 36) <= parseInt(max, 36)
}

export function parseRef(ref = '') {
  const match = ref.match(/^([A-Z]+)(\d+)\:([A-Z]+)(\d+)$/)
  if (!match || match.length !== 5) return null
  return {
    row: [match[1], match[3]],
    col: [match[2], match[4]],
  }
}

export function readXlsxFromPath(path) {
  return XLSX.readFile(path)
}

export function readXlsxFromFile(file) {
  console.log('file', file)
  if (!fs.existsSync(file)) return Promise.reject({status: 'FAIL', msg: "文件不存在"})
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, {type: 'array'});
      resolve(workbook)
    };
    reader.readAsArrayBuffer(file);
  })
}

export function createWrokBox() {
  return XLSX.utils.book_new()
}

export function createXlsxFile(workbook, path) {
  return new Promise((resolve, reject) => {
    if (pathExists(path)) {
      path += '(R)'
    }
    XLSX.writeFileAsync(path + FILE_TYPE, workbook, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    });
  })

}

export function createFilePath(type, name) {
  return path.join(getDirPath(type), name)
}

export function getDirPath(type) {
  const pathArr = [`${moment().format('YYYYMMDD')}${process.pid}`, type]
  const str = pathArr.reduce((a, b) =>{
    const p = path.join(a, b)
    const dir = getPath(p)
    if (!pathExists(dir)) mkdir(dir)
    return p
  }, '')
  return getPath(str);
}