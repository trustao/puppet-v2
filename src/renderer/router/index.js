import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'taskManage',
      component: require('@/views/TaskManage').default
    },
    {
      path: '/running',
      name: 'running',
      component: require('@/views/Running/index.vue').default
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: require('@/views/Welcome').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
