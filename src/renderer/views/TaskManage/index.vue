<template>
  <div class="wrap">
    <a-steps :current="current">
      <a-step v-for="item in tabs" :key="item.title" :title="item.title"/>
    </a-steps>
    <div class="step-contents">
      <a-card v-if="current === 0" class="content-item" title="请选择任务">
        <a href="#" slot="extra">more</a>
        <TaskList @checkedSteps="checkedSteps"></TaskList>
      </a-card>
      <a-card v-if="current === 1" class="content-item" title="填写信息">
        <TaskForm :forms="forms"></TaskForm>
      </a-card>
      <a-card v-if="current === 2" class="content-item" title="完成">
        <TaskInfo :readonly="true"></TaskInfo>
      </a-card>
    </div>
    <div class="btns">
      <AButton v-if="current > 0" @click="back">上一步</AButton>
      <AButton type="primary" @click="next">确认</AButton>
    </div>
  </div>
</template>

<script>
  import {mapActions, mapGetters} from 'vuex'
  import {Task} from '../../../module/newTask'
  import TaskList from '@/components/TaskList'
  import TaskForm from '@/components/TaskForm'
  import TaskInfo from '@/components/TaskInfo'

  export default {
    name: "TaskManage",
    components: {
      TaskList,
      TaskForm,
      TaskInfo
    },
    data() {
      return {
        current: 0,
        tabs: [{
          title: 'First',
          content: 'First-content',
        }, {
          title: 'Second',
          content: 'Second-content',
        }, {
          title: 'Last',
          content: 'Last-content',
        }],
        steps: [],
        forms: [],
        task: null
      }
    },
    computed: {
      ...mapGetters({
        allSteps: 'Task/stepGroups'
      })
    },
    methods: {
      ...mapActions('Task', ['setCurTask']),
      next() {
        switch (this.current) {
          case 0:
            if (!this.steps.length) {
              this.$message.error('请选择任务！');
              return
            }
            this.createTask()
            break;
          case 2:
            this.$router.push('/running')
            break
        }
        this.current = this.current < this.tabs.length - 1 ? this.current + 1 : this.tabs.length - 1
      },
      back() {
        this.current = this.current > 0 ? this.current - 1 : 0
      },
      checkedSteps(val, steps) {
        this.steps = steps
      },
      createTask() {
        console.log('createTask!212')
        const task = new Task('默认', this.steps)
        this.task = task
        this.setCurTask(task)
        this.createForm(task)
      },
      createForm(task) {
        this.forms = Object.keys(task.state).map(key => {
          const data = task.state[key]
          return {key, ...data}
        })
      },
    }
  }
</script>

<style lang="less" scoped>
  .wrap {
    max-width: 1024px;
    margin: auto;
    padding-top: 40px;

    .step-contents {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      min-height: 600px;
      margin: 40px 0;

      .content-item {
        width: 100%;
      }
    }

    .btns {
      display: flex;
      justify-content: center;

      > *:not(:last-child) {
        margin-right: 20px;
      }
    }
  }
</style>