<template>
  <a-tree
    checkable defaultExpandAll
    v-model="checkedKeys"
    :treeData="steps"
  />
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: "TaskList",
    data() {
      return {
        checkedKeys: []
      }
    },
    watch: {
      checkedKeys (val) {
        this.$emit('checkedSteps', val, val.map(key => this.stepMap[key]).filter(i => !!i))
      }
    },
    computed: {
      ...mapGetters({
        curTask: 'Task/curTask',
        steps: 'Task/stepGroups'
      }),
      stepMap () {
        const res = {}
        const loop = (arr) => {
          arr.forEach(i => {
            if (i.children && i.children.length) {
              loop(i.children)
            }
            if (!/^GROUP/.test(i.key)) {
              res[i.key] = i
            }
          })
        }
        loop(this.steps)
        return res
      }
    },
    created() {
      console.log(this.steps)
      this.checkedKeys = this.steps ? this.steps[0].children.map(i => i.key) : []
    }
  }
</script>

<style scoped>

</style>