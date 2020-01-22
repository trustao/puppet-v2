export default {
  resourceFile: {
    filePath: ''
  },
  popShop: {
    template: {
      downloadPath: 'https://b.jclps.com/static/template/PopGoodsImportTemplate.xls',
      filePath: '',
      head: ['POP店铺商品编号（SKU编码）', '商家商品标识', '商品条码'],
      fillCol: [0, 1, 2],
      fillKey: ['$$$', '$$$', '$$$']
    },
    maxRow: 4000,
  },
  goods: {
    template: {
      downloadPath: 'https://b.jclps.com/static/template/GoodsLogisticsTemplate.xls',
      filePath: '',
      head: [
        "事业部商品编码\n（若此列不为空，以此编码获取的商品为准）",
        "事业部编码\n（事业部商品编码为空时必填）",
        "商家商品编号\n（事业部商品编码为空时必填）",
        "长(mm)\n（必填，大于0）",
        "宽(mm)\n（必填，大于0）",
        "高(mm)\n（必填，大于0）",
        "净重(kg)",
        "毛重(kg)\n（必填，大于0）"
      ],
      fillRow: [0, 3, 4, 5, 7],
      fillKey: ['$$$', 'l', 'w', 'h', 'kg']
    },
    maxRow: 2000
  },
  purchase: {
    template: {
      downloadPath: 'https://b.jclps.com/static/template/采购入库单商品导入模板.xls',
      filePath: '',
      head: [
        'CLPS事业部商品编码', '外部店铺商品编码', '商品数量（个）',
        '代贴条码(是/否)', '单价(全球购采购单必填)', '质检比例（大件且开通质检服务）0-100',
        '是否序列号入库（是/否）', '商家包装规格编码', '包装单位'
      ],
      fillRow: [0, 2, 5],
      fillKey: ['$$$', 'count', 'scale']
    }
  }
}
