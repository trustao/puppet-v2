import {Step, IfStep} from '../../module/Step.js'
import {Task} from '../../module/newTask.js'
import {action, ActionType} from '../../module/Action.js'



function cpSteps() {
  const step1 = new Step({}, [
    {// 点击仓库图标
      selector: '.topbar__whse-info.el-tooltip',
      type: ActionType.Click
    },
    {
      type: ActionType.Wait
    },
    {// 进入仓库
      selector: '.el-dialog .el-dialog__body button:contains(进入仓库)',
      type: ActionType.Click
    },
  ], '进入仓库')

  const step2 = new Step({}, [
    {
      type: ActionType.Wait,
      state: {time: 3000}
    },
    {// 入库管理
      selector: '.sidebar .el-submenu span:contains(入库管理)',
      type: ActionType.Click
    },

    {// 采购入库
      selector: '.sidebar .el-submenu .el-menu-item span:contains(采购入库)',
      type: ActionType.Click
    },

    {
      type: ActionType.Wait,
      state: {time: 3000}
    },
  ], '进入采购入库页')

  const selectCon = new Step({
    ownerName_l: {
      value: '河北酷硕贸易有限公司',
      desc: '货主'
    },
    status: {
      value: '0',
      desc: '单据状态'
    }
  }, [
    {// 点击验收 第一个
      selector: '#inboundQueryForm #ownerName_l',
      type: ActionType.Select,
      state: {ownerName_l: {}},
      inFrame: true
    },
   {// 点击验收 第一个
      selector: '#inboundQueryForm #status',
      type: ActionType.Select,
      state: {status: {}},
      inFrame: true
    },
    {
      type: ActionType.Wait,
      state: {time: 1000}
    },
    {
      type: ActionType.Click,
      selector: '#queryForm',
      inFrame: true
    },
    {
      type: ActionType.Wait,
      state: {time: 2000}
    },
  ], '输入查询条件')

  const step3 = new Step({}, [
    {// 点击验收 第一个
      selector: '#purchaseTable tbody tr .opera #receiveBtn:visible',
      type: ActionType.Click,
      inFrame: true
    },

    {
      type: ActionType.Wait,
      state: {time: 1000}
    },
  ], '点击验收')

  const step4 = new Step({
    no: {
      value: 30,
      desc: '容器号'
    }
  }, [
    {// 输入容器号
      selector: '#batchin_containerNo',
      state: {
        no: 'text'
      },
      inFrame: true,
      type: ActionType.Input
    },
    {// 失焦
      selector: '#batchin_containerNo',
      inFrame: true,
      type: ActionType.Blur
    },
    {
      type: ActionType.Wait,
      state: {time: 3000}
    },
  ], '输入容器号')


  const step5_2 = new Step({}, [
    {// 全选
      selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
      type: ActionType.Click,
      inFrame: true
    }
  ], '容器号重复, 点击确认')
  step5_2.on('statusChange', status => {
    if (status === 'SUCCESS') step4.state.no.value++
  })
  const step5_3 = new IfStep(() => true, '容器号重复，重新执行填写容器号', step4)

  const checkList = new IfStep(
    async () => {
      await Task.waitMoment(3000)
      const res = await action(ActionType.CheckExist, {
        selector: '#inboundPurchaseReceiveNewTable tbody td:first input:visible',
        inFrame: true
      })
      return !res.state
    },
    '检查列表加载完成'
  )
  checkList.setSteps(checkList)

  const step6 = new Step(
    {},
    [
      {// 全选
        selector: '#inboundPurchaseReceiveNewTable thead th:first-child input[type=checkbox]',
        type: ActionType.Click,
        inFrame: true
      },
      {
        type: ActionType.Wait,
        state: {time: 1000}
      },
      {// 点击完验
        selector: '#containerFulfilNew',
        type: ActionType.Click,
        inFrame: true
      }
    ],
    '全选'
  )

  const step5_1 = new IfStep(
    async () => {
      let hasReadOnly = false, i = 0
      while (!hasReadOnly) {
        await Task.waitMoment(5000)
        const res = await action(ActionType.HasAttr,
          {state: 'readonly', selector: '#batchin_containerNo', inFrame: true})
        hasReadOnly = res.state
        console.log('check', res)
        i++
        if (i > 5) break
      }
      console.log('重复', !hasReadOnly)
      return hasReadOnly
    },
    '检查容器号是否重复',
    checkList
  )

  const step7 = new Step(
    {},
    [
      {
        type: ActionType.Wait,
        state: {time: 2000}
      },
      {// 确认
        selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
        type: ActionType.Click,
        inFrame: true
      }
    ],
    '提交'
  )
  const step8 = new Step(
      {},
      [
        {
          type: ActionType.Wait,
          state: {time: 10000}
        },
        {// 成功确认
          selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
          type: ActionType.Click,
          inFrame: true
        },
      ],
      '确认'
    )

  const back = new Step({}, [
    {
      type: ActionType.Click,
      selector: '#tabs .tab-title li span:contains(采购入库)',
      inFrame: true
    },
      {
        type: ActionType.Wait,
        state: {time: 3000}
      },
  ], '返回采购入库')

  const repeat = new IfStep(() => true, '重复查询验收', step1)

  const productCheck = [
    step1,
    step2,
    selectCon,
    step3,
    step4,
    step5_1,
    step5_2,
    step5_3,
    checkList,
    step6,
    step7,
    step8,
    back,
    repeat
  ]

  const step9 = new Step(
    {},
    [
      {// 入库管理
        selector: '.sidebar .el-submenu span:contains(入库管理)',
        type: ActionType.Click
      },

      {// 进入纸单上架
        selector: '.sidebar .el-submenu .el-menu-item span:contains(纸单上架)',
        type: ActionType.Click
      },
    ],
    '进入纸单上架'
  )

  const clickSJ = new Step(
    {},
    [
      {// 点击上架
        selector: '#putawayTable tbody .opera #PutBtn',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait,
        state: {time: 2000}
      }
    ],
    '点击上架按钮'
  )

  const checkListDone = new IfStep(
    async () => {
      await Task.waitMoment(3000)
      const res = await action(ActionType.CheckExist, {
        selector: '#inboundPutawayOperateTable .realLocation:visible',
        inFrame: true
      })
      return !res.state
    },
    '检查列表加载完成'
  )
  checkListDone.setSteps(checkListDone)

  const inputPisNo = new Step(
    {
      positionNo: {
        value: '1-A01-01-100-1',
        desc: '储位号'
      }
    },
    [
      {
        selector: '#copy_location',
        state: {
          positionNo: {
            type: 'text'
          }
        },
        inFrame: true,
        type: ActionType.Input
      },
      {
        type: ActionType.Wait,
        state: {time: 1000}
      }
    ],
    '输入储位号'
  )

  const clickConfirm = new Step(
    {},
    [
      {// 确认替换
        selector: '.mask #copyLocationBtn',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait
      },
      {// 确认上架
        selector: '.mask #savePutawayBtn',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait,
        state: {time: 10000}
      },
    ],
    '点击替换,并确认'
  )

  const checkPN = new IfStep(
     () => {
       console.log('dsfasdfsdafsd',inputPisNo.state.positionNo.value)
       return !!inputPisNo.state.positionNo.value
     },
    '是否有储位号',
    clickSJ
  )

  const search = new Step({},
    [
      {// 选择状态-上架完成
        selector: '#pt_status',
        state: {
          no: {
            type: 'text',
            default: '5'
          }
        },
        inFrame: true,
        type: ActionType.Input
      },
      {// 点击查询
        selector: '#queryPutaway',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait,
        state: {time: 2000}
      }
    ], '选择状态上架完成, 查询列表')

    const clickDetail = new Step({},
    [
      {// 点击查询明细
        selector: '#putawayTable tbody .opera #PutDetailBtn',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait,
        state: {time: 2000}
      }
    ], '点击查询明细')

    const getPNo = new Step({
      positionNo: {
        value: '1-A01-01-100-1',
        desc: '储位号'
      }},
    [
      {
        selector: '.mask #putawayDetailTable tbody tr:first td:nth-child(9)',
        state: {
          positionNo: {
            type: 'text'
          }
        },
        inFrame: true,
        type: ActionType.GetText
      },

      {// 关闭弹窗
        selector: '.mask .prompt-title .close-win',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait,
        state: {time: 1000}
      }
    ], '获取储位号, 关闭弹窗')

  getPNo.on('statusChange', status => {
    if (status === 'SUCCESS') inputPisNo.state.positionNo.value = getPNo.state.positionNo.value
})

  const searchAgain = new Step(
    {},
    [
      {// 选择未上架
        selector: '#pt_status',
        state: {
          no: {
            type: 'text',
            default: '3'
          }
        },
        inFrame: true,
        type: ActionType.Input
      },
      {// 点击查询
        selector: '#queryPutaway',
        inFrame: true,
        type: ActionType.Click
      },
      {
        type: ActionType.Wait,
        state: {time: 2000}
      }
    ],
    '选择未上架，查询'
  )

  const isSuc = new Step(
    {},
    [
      {type: ActionType.Wait,
        state: {time: 8000}},
      {// 成功确认
        selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
        inFrame: true,
        type: ActionType.Click
      },
      {// 关闭弹窗
        selector: '.mask .prompt-title .close-win',
        inFrame: true,
        type: ActionType.Click
      },
    ],
    '成功点击确认'
  )


  const productSale = [
    step1,
    step9,
    checkPN,

    search,
    clickDetail,
    getPNo,
    searchAgain,

    clickSJ,
    checkListDone,
    inputPisNo,
    clickConfirm,
    isSuc,
    new IfStep(() => true, '重复', step1)
  ]


  const login = new Step({
    name: {
      value: '花栏旗舰店',
      desc: '账号'
    },
    pwd: {
      value: 'ztqh2018',
      desc: '密码'
    },
  }, [
    {//输入账号
      selector: '#loginname',
      inFrame: '.login-frame',
      state: {
        name: {
          default: '金康019'
        }
      },
      type: ActionType.Input
    },
    {//输入密码
      selector: '#nloginpwd',
      inFrame: '.login-frame',
      state: {
        pwd: {
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
  const loginb = new Step({
    name: {
      value: '花栏旗舰店',
      desc: '账号'
    },
    pwd: {
      value: 'ztqh2018',
      desc: '密码'
    },
  }, [
    {//输入账号
      selector: '#loginname',
      inFrame: '.login-frame',
      state: {
        name: {
          default: '金康019'
        }
      },
      type: ActionType.Input
    },
    {//输入密码
      selector: '#nloginpwd',
      inFrame: '.login-frame',
      state: {
        pwd: {
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

  return [
    {
      title: 'CP端验收',
      key: 'GROUP-1',
      children: [
        // login,
        ...productCheck,
      ]
    },
    {
      title: 'CP端上架',
      key: 'GROUP-2',
      children: [
        // loginb,
        ...productSale,
      ]
    }
  ]
}

const actionData = [
  // cp端 验收上架
  {// 点击仓库图标
    selector: '.topbar__whse-info .topbar__whse-icon',
    type: 'click'
  },
  {// 进入仓库
    selector: '.el-dialog .el-dialog__body button:contains(进入仓库)',
    type: 'click'
  },

  // 跳转

  {// 入库管理
    selector: '.sidebar .el-submenu span:contains(入库管理)',
    type: 'click'
  },

  {// 采购入库
    selector: '.sidebar .el-submenu .el-menu-item span:contains(入库管理)',
    type: 'click'
  },
  // wait

  {// 点击验收 第一个
    selector: '#purchaseTable tbody tr .opera #receiveBtn:visible',
    type: 'click'
  },
  // wait
  {// 收入容器号
    selector: '#batchin_containerNo',
    state: {
      no: 'text'
    },
    type: 'input'
  },

  {// 失焦
    selector: '#batchin_containerNo',
    type: 'blur'
  },
  // wait
  {// 容器号重复
    selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
    type: 'click'
  },

  {// 全选
    selector: '#inboundPurchaseReceiveNewTable thead th:first-child input[type=checkbox]',
    type: 'click'
  },
  // wait

  {// 全选
    selector: '#containerFulfilNew',
    type: 'click'
  },
  // wait long

  {// 确认
    selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
    type: 'click'
  },

  // wait long
  // todo check

  {// 成功确认
    selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
    type: 'click'
  },


  {// 入库管理
    selector: '.sidebar .el-submenu span:contains(入库管理)',
    type: 'click'
  },

  {// 进入纸单上架
    selector: '.sidebar .el-submenu .el-menu-item span:contains(纸单上架)',
    type: 'click'
  },

  // 是否有储位号
  // 获取储位号 1-A01-01-100-1
  {// 选中上架5完成
    selector: '#queryPutaway',
    state: {
      no: {
        type: 'text',
        default: '5'
      }
    },
    type: 'input'
  },
  {// 点击查询
    selector: '#queryPutaway',
    type: 'click'
  },

  // wait long
  {// 点击查询明细
    selector: '#putawayTable tbody .opera #PutDetailBtn',
    type: 'click'
  },

  {
    selector: '.mask #putawayDetailTable tbody td:nth-child(9)',
    state: {
      putNo: {
        type: 'text',
        desc: '储位号'
      }
    },
    type: 'getText'
  },

  {// 关闭弹窗
    selector: '.mask .prompt-title .close-win',
    type: 'click'
  },

  {// 选中上架5完成
    selector: '#queryPutaway',
    state: {
      no: {
        type: 'text',
        default: '3'
      }
    },
    type: 'input'
  },
  {// 点击查询
    selector: '#queryPutaway',
    type: 'click'
  },

  // wait long
  {// 点击上架
    selector: '#putawayTable tbody .opera #PutBtn',
    type: 'click'
  },
  // wait long
  {// 点击上架
    selector: '.mask #copy_location',
    state: {
      putNo: 'text'
    },
    type: 'input'
  },
  {// 确认替换
    selector: '.mask #copyLocationBtn',
    type: 'click'
  },
  {// 确认上架
    selector: '.mask #savePutawayBtn',
    type: 'click'
  },
  // wait long
  // todo check
  {// 成功确认
    selector: '.mask:visible .prompt .prompt-buttons .btn-ok',
    type: 'click'
  },
]

export const stepsGroup = cpSteps()

// function createSteps() {
//   const step1 = new Step({
//     account: { value: 'fdsafda', desc: '账号' },
//     password: { value: '2342667', desc: '密码' }
//   }, [
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//   ], '步骤一, 等两秒');
//   const step2 = new Step({
//     no: { value: '', desc: '编号' }
//   }, [
//     Task.waitMoment(1000),
//   ], '步骤二, 等一秒');
//   const step3 = new IfStep(() => Promise.resolve(true), '步骤三 跳转到第5');
//   const step4 = new Step({}, [
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//   ], '步骤四, 等三秒');
//   const step5 = new Step({
//   }, [
//     Task.waitMoment(1000),
//   ], '步骤五, 等一秒');
//   const step6 = new Step({
//     shop: { value: '', desc: '店铺' }
//   }, [
//     Task.waitMoment(3000),
//   ], '步骤六, 等3秒');
//   const step7 = new Step({
//     no: { value: 5, desc: '编号' }
//   }, [
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//   ], '步骤七, 等五秒');
//   step3.setSteps(step5);
//   let i = 0;
//   const step8 = new IfStep(() => {
//     console.log('执行次数', ++i);
//     return i < 5;
//   }, '步骤八 重复四', step4);
// // const task = new Task();
// // task.push(step1, step2, step3, step4, step5, step6, step7, step8);
//   return [step1, step2, step3, step4, step5, step6, step7, step8]
// }
