import {getPath} from "../../utils/readFile";
import {logisticsFile2StoreFile} from "../../utils/xlsx";
import {Step} from '../../module/Step.js'
import {ActionType} from '../../module/Action.js'
import {IfStep} from "../../module/Step";

function b12() {

  const jumpToPage = new Step({}, [
    {
      selector: '#top_8960',
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#li_9670 a',
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#li_9680 a',
      type: ActionType.Click
    },
  ], '进入采购管理页')

  const jumpToAdd = new Step({}, [
    {
      type: ActionType.Wait,
      time: 4000
    },
    {
      selector: '#addPoMainForm',
      inFrame: true,
      type: ActionType.Click
    }
  ], '进入添加采购单页')


  const editForm = new Step({
    purchaseType: {
      value: '普通采购单',
      desc: '采购单类型',
    },
    sybName: {
      value: '邱县金康电子商务有限公司',
      desc: '事业部名称',
    },
    providerName: {
      value: '邱县金康电子商务有限公司',
      desc: '供应商名称',
    },
    storeName: {
      value: '邢台南宫百川云仓1号库',
      desc: '入库库房',
    },
    importStoreFile: {
      value: getPath('./202003085480/store/k7j1l6sykt-0-499.xls'),
      desc: '',
      type: 'hidden'
    }
  }, [
    {
      selector: '#poTypeList',
      inFrame: true,
      type: ActionType.Select,
      state: {
        purchaseType: {}
      }
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#deptPoList',
      inFrame: true,
      type: ActionType.Select,
      state: {
        sybName: {}
      }
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#supplierPoList',
      inFrame: true,
      type: ActionType.Select,
      state: {
        providerName: {}
      }
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#wareHousePoList',
      inFrame: true,
      type: ActionType.Select,
      state: {
        storeName: {}
      }
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#importPoBlog',
      inFrame: '#mainIframe',
      state: {
        importStoreFile: {}
      },
      type: ActionType.SetFile
    },
  ], '填写表单')

  const upload = new Step({}, [
    {
      type: ActionType.Wait
    },
    {
      selector: '#importPoBtn',
      inFrame: true,
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
  ], '上传采购入库文件')



  const createStoreFiles = new Step({
    count: {
      value: '2',
      desc: '商品数量'
    },
    scale: {
      value: '2',
      desc: '质检比例'
    },
    goodsLogFiles: {
      value: [
        getPath('./202003086844/pop/k7ir92n1sh-0-1999.xls'),
      ],
      desc: '',
      type: 'hidden'
    },
    storeFiles: {
      value: [],
      des: '采购入库文件'
    }
  }, [
    {
      type: ActionType.Promise,
      promiseFn: async ({state}) => {
        console.log(state)
        try {
          const list = await logisticsFile2StoreFile(state.goodsLogFiles, state)
          if (createStoreFiles.parentTask) {
            createStoreFiles.parentTask.state.storeFiles.value = list
          } else {
            createStoreFiles.state.popFiles.value = list
          }
        } catch (e) {
          console.error(e)
          return {status: 'FAIL'}
        }

      },
      state: {
        count: {},
        scale: {},
        goodsLogFiles: {},
        storeFiles: {}
      }
    }
  ], '文件分割处理，物流 => 采购入库')


  const checkResult = new IfStep(task => {
    return getResult.state.importMsg.includes('导入成功')
  }, '是否成功')


  return [createStoreFiles, jumpToPage, jumpToAdd, editForm, upload]
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