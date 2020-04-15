<template>
  <a-collapse defaultActiveKey="1" :bordered="false">
    <template v-for="item in steps" >
      <a-collapse-panel :key="item.key" v-if="hasState(item.state)">
        <template slot="header">
          {{item.title}}
          <StatusIcon v-if="!readonly" :status="item.status" @run="runStep(item)"/>
        </template>
        <StepState v-for="(val, key) in item.state"
                   :state="val" :status="item.status"
                   @valueChange="stateChange(val, $event)"
                   :key="key"></StepState>
      </a-collapse-panel>
      <p class="step-item" v-else>
        <a-icon class="front-icon" type="minus" />
        <span>
          {{item.title}}
        </span>
        <StatusIcon v-if="!readonly" :status="item.status"  @run="runStep(item)"/>
      </p>
    </template>
  </a-collapse>
</template>

<script>
  import StatusIcon from './StatusIcon'
  import StepState from './StepState'
  import {mapGetters} from 'vuex'
  import {Task} from '../../module/newTask'
  export default {
    name: "TaskInfo",
    props: ['readonly'],
    components: {
      StatusIcon,
      StepState
    },
    computed: {
      ...mapGetters({
        curTask: 'Task/curTask'
      }),
      steps () {
        return this.curTask ? this.curTask.taskSteps : []
      }
    },
    methods: {
      hasState (state) {
        return !!state && !!Object.keys(state).length
      },
      stateChange (state, val) {
        state.value = val
      },
      runStep (step) {
        console.log('run')
        step.run()
      }
    },
    mounted() {
      console.log('~~~~~~~~~~~~~~~~~~', this.curTask)
    }
  }
</script>

<style lang="less" scoped>
  .step-item {
    position: relative;
    padding: 12px 0 12px 15px;
    color: rgba(0, 0, 0, 0.85);
    line-height: 22px;
    margin: 0;
    border-bottom: 1px solid #d9d9d9;
    .front-icon {
      font-size: 12px;
      margin-right: 10px;
    }
  }
</style>