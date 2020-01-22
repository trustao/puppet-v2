// import {IfStep, Step} from "./Step";
// import {Task} from "./newTask";
//
//
// const step1 = new Step(
//   {
//     no: {value: 5, desc: '编号'}
//     },
//   [
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//   ],
//     '步骤一, 等两秒'
//   )
//
// const step2 = new Step(
//   {
//     no: {value: 5, desc: '编号'}
//   },
//   [
//     Task.waitMoment(1000),
//   ],
//   '步骤二, 等一秒'
// )
// const step3 = new IfStep(() => Promise.resolve(true) ,'步骤三 跳转到第5')
//
// const step4 = new Step(
//   {},
//   [
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//   ],
//   '步骤四, 等三秒'
// )
//
// const step5 = new Step(
//   {
//     no: {value: 5, desc: '编号'}
//   },
//   [
//     Task.waitMoment(1000),
//   ],
//   '步骤五, 等一秒'
// )
//
// const step6 = new Step(
//   {
//     no: {value: 5, desc: '编号'}
//   },
//   [
//     Task.waitMoment(1000),
//     () => new Promise(resolve => {
//       console.log('暂停')
//       task.pause()
//       setTimeout(() => {
//         task.continue()
//       }, 4000)
//       resolve()
//     })
//   ],
//   '步骤六, 等一秒, 然后暂停'
// )
//
// const step7 = new Step(
//   {
//     no: {value: 5, desc: '编号'}
//   },
//   [
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//     Task.waitMoment(1000),
//   ],
//   '步骤七, 等五秒'
// )
//
// step3.setSteps(step5)
//
// let i = 0
// const step8 = new IfStep(() => {
//   console.log('执行次数', ++i)
//   return i < 5
// } ,'步骤八 重复七', step7)
//
// const task = new Task()
//
// task.push(step1, step2, step3, step4, step5, step6, step7, step8)
//
// export default task
