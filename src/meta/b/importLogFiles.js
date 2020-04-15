import {getPath} from "../../utils/readFile";
import {unZipToDir} from "../../utils/zip";
import {zipXls2LogisticsFile} from "../../utils/xlsx";
import {Step} from '../../module/Step.js'
import {ActionType} from '../../module/Action.js'
import {IfStep} from "../../module/Step";

function b12() {

  const jumpShopM = new Step({}, [
    {
      selector: '#top_104202',
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#li_9250 a',
      type: ActionType.Click
    }
  ], '进入商品店铺管理页')

  const selectA = new Step({
    syb: {
      value: '邱县金康电子商务有限公司',
      desc: '1.2选择事业部',
    }
  }, [
    {
      selector: '#shopGoodsList_deptId',
      inFrame: true,
      type: ActionType.Select,
      state: {
        syb: {}
      }
    },
  ], '选择事业部')

  const selectB = new Step({
    dp: {
      value: '金康运动户外专营店',
      desc: '1.2选择店铺',
    }
  }, [
    {
      selector: '#shopGoodsList_shopId',
      inFrame: true,
      type: ActionType.Select,
      state: {
        dp: {}
      }
    },
  ], '选择店铺')

  const selectC = new Step({
    jp: {
      value: '否',
      desc: '1.2是否京配',
    }
  }, [
    {
      selector: '#shopGoodsList_jdDeliver',
      inFrame: true,
      type: ActionType.Select,
      state: {
        jp: {}
      }
    },
  ], '是否京配')

  const down = new Step({
    'download1-2': {
      value: null,
      desc: '',
      type: 'hidden'
    }
  }, [
    {
      selector: '#shopGoodsList_exportShopGoods',
      type: ActionType.Download,
      inFrame: true,
      state: {
        'download1-2': {}
      }
    }
  ], '导出')

  const unzip = new Step({
    'download1-2': {
      value: getPath('./download/店铺商品列表_20200223230124.zip'),
      desc: '',
      type: 'hidden',
    },
    goodsFilesList: {
      value: null,
      desc: '',
      type: 'hidden'
    }
  }, [
    {
      type: ActionType.Promise,
      promiseFn: async ({state}) => {
        const list = await unZipToDir(state['download1-2'] )
        if (unzip.parentTask) {
          unzip.parentTask.state.goodsFilesList.value = list
        } else {
          unzip.state.goodsFilesList.value = list
        }
      },
      state: {
        goodsFilesList: {
          desc: 'file path array'
        },
        'download1-2': {}
      }
    }
  ], '解压')


  const createLogFiles = new Step({
    l: {
      value: '1',
      desc: '长'
    },
    w: {
      value: '2',
      desc: '宽'
    },
    h: {
      value: '3',
      desc: '高'
    },
    kg: {
      value: '4',
      desc: '重量'
    },
    goodsFilesList: {
      value: [
        getPath('./download/店铺商品列表_20200223230124/������Ʒ�б�1.xls'),
        // getPath('./download/店铺商品列表_20200223230124/������Ʒ�б�2.xls'),
        // getPath('./download/店铺商品列表_20200223230124/������Ʒ�б�3.xls')
      ],
      desc: '',
      type: 'hidden'
    },
    goodsLogFiles: {
      value: [],
      des: '物流信息文件'
    }
  }, [
    {
      type: ActionType.Promise,
      promiseFn: async ({state}) => {
        console.log(state)
        try {
          const goodsLogFiles = await zipXls2LogisticsFile(state.goodsFilesList, state)
          if (createLogFiles.parentTask) {
            createLogFiles.parentTask.state.goodsLogFiles.value = goodsLogFiles
          } else {
            createLogFiles.state.popFiles.value = goodsLogFiles
          }
        } catch (e) {
          console.error(e)
          return {status: 'FAIL'}
        }

      },
      state: {
        l: {
          value: '',
          desc: '长'
        },
        w: {
          value: '',
          desc: '宽'
        },
        h: {
          value: '',
          desc: '高'
        },
        kg: {
          value: '',
          desc: '重量'
        },
        goodsFilesList: {},
        goodsLogFiles: {}
      }
    }
  ], '文件分割处理，商品 => 物流')


  const clickImportBtn = new Step({}, [
    {
      selector: '#top_104202',
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#li_920 a',
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#goodsList_importGoodsAttributeForm',
      inFrame: true,
      type: ActionType.Click
    }
  ], '进入商品主数据管理页点击导入按钮')


  const importLogFile = new Step({
    logFile: {
      value: getPath('./download/202003086844/pop/k7ir92n1sh-0-1999.xls'),
      desc: '',
      type: 'hidden'
    }
  }, [
    {
      selector: '#importAttributeFile',
      inFrame: '#mainIframe',
      state: {
        logFile: {}
      },
      type: ActionType.SetFile
    },
    // {
    //   selector: '#goodsAttributeList_importBtn',
    //   inFrame: true,
    //   type: ActionType.Click
    // }
  ], '导入物流属性文件')


  const getResult = new Step({
    importMsg: {
      value: '',
      desc:"",
      type: 'hidden'
    }
  }, [
    {
      selector: '#importGoodsNews',
      inFrame: true,
      type: ActionType.GetText,
      state: {
        importMsg: {}
      }
    }
  ], '查看导入结果')

  const checkResult = new IfStep(task => {
    return getResult.state.importMsg.includes('导入成功')
  }, '是否成功')


  return [jumpShopM, selectA, selectB, selectC, down, unzip, createLogFiles, clickImportBtn, importLogFile]
}

export default function createTaskGroup() {
  return [
    {
      title: '1.2导入物流属性',
      key: 'GROUP-B-2',
      children: [
        ...b12()
      ]
    }
  ]
}