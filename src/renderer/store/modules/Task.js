import {stepsGroup} from '../../../meta'
import {Task} from '../../../module/newTask'

const state = {
  curTask: null,
  taskQueue: [],
  stepGroups: stepsGroup
}

const mutations = {
  SET_CUR_TASK (state, curTask) {
    console.log('setTask', curTask)
    state.curTask = curTask
  },
  SET_TASK_QUEUE (state, tasks) {
    state.taskQueue = tasks
  },
  NEXT_TASK (state) {
    state.curTask = state.taskQueue.shift()
  },
  UPDATE_TASK_STATE (state, {key, value}) {
    state.curTask.state[key].value = value
  }
}

const actions = {
  setTaskQueue ({ commit }, payload) {
    // do something async
    commit('SET_TASK_QUEUE', payload)
  },
  setCurTask ({ commit }, payload) {
    console.log('action: setTask', payload)
    commit('SET_CUR_TASK', payload)
  },
  updateTaskState ({ commit }, payload) {
    commit('UPDATE_TASK_STATE', payload)
  },
}

const getters = {
  curTask: state => state.curTask,
  taskQueue: state => state.taskQueue,
  stepGroups: state => state.stepGroups,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
