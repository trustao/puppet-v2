import {SKUFiles2PopFiles} from "../../utils/xlsx";
import {Step} from '../../module/Step.js'
import {ActionType} from '../../module/Action.js'



function pop() {
  const popFileStep = new Step({
    originFiles: {
      value: [],
      desc: 'SKU文件',
      type: 'fileInput'
    },
    popFiles: {
      value: [],
      desc: 'pop文件',
      type: 'hidden'
    }
  }, [
    {
      type: ActionType.Promise,
      promiseFn: async ({state}) => {
        console.log(state)
        const popList = await SKUFiles2PopFiles(state.originFiles)
        if (popFileStep.parentTask) {
          popFileStep.parentTask.state.popFiles.value = popList
        } else {
          popFileStep.state.popFiles.value = popList
        }
      },
      state: {
        originFiles: {
          desc: 'file array'
        },
        popFiles: {
          desc: 'file path array'
        }
      }
    }
  ], '文件分割处理，SKU => POP')

  const login = new Step({
    bName: {
      value: '',
      desc: '账号'
    },
    bPwd: {
      value: '',
      desc: '密码'
    },
  }, [
    {//输入账号
      selector: '#loginname',
      inFrame: '.login-frame',
      state: {
        bName: {
          default: '金康019'
        }
      },
      type: ActionType.Input
    },
    {//输入密码
      selector: '#nloginpwd',
      inFrame: '.login-frame',
      state: {
        bPwd: {
          default: 'jinkang019'
        }
      },
      type: ActionType.Input
    },
    {//输入密码
      selector: '#paipaiLoginSubmit',
      inFrame: '.login-frame',
      type: ActionType.Click
    }
  ], '登录账户')

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


  const clickNew = new Step({}, [
    {
      selector: '#buttonset',
      type: ActionType.Click,
      inFrame: '#mainIframe'
    },
    {
      type: ActionType.Wait
    },
    {
      selector: '#shopGoodsList_batchMaintainShopGoods',
      type: ActionType.Click,
      inFrame: '#mainIframe'
    }
  ], '点击新增店铺商品')

  const inputFile = new Step({
    popShopNo: {
      value: '',
      desc: 'POP店铺编号'
    },
    popFile: {
      value: null,
      desc: 'file',
      type: 'hidden'
    }
  }, [
    {
      selector: '#shopGoodsList_popGoodsImport_popVendorId',
      inFrame: '#mainIframe',
      state: {
        popShopNo: {
          default: 102546752
        }
      },
      type: ActionType.Input
    },
    {
      selector: '#shopGoodsList_popGoodsListFile',
      inFrame: '#mainIframe',
      state: {
        popFile: {}
      },
      type: ActionType.SetFile
    },
  ], '输入POP编号，导入文件')


  popFileStep.on('statusChange', (status) => {
    if (status === 'SUCCESS') {
      const state = inputFile.parentTask.state
      state.popFile.value = state.popFiles.value.shift()
      console.log(inputFile.parentTask)
    }
  })

  return [
    popFileStep,
    login,
    jumpShopM,
    clickNew,
    inputFile
  ]
}

export default function createTaskGroup() {
  return [
    {
      title: 'B端商品信息导入',
      key: 'GROUP-B-1',
      children: [
        ...pop()
      ]
    }
  ]
}