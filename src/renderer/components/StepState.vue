<template>
  <div>
    <span>{{state.desc}}</span>
    <a-input v-if="isEdit" v-model="tempVal" size="small" style="width: 200px" @keyup.enter="ok">
      <a-icon slot="addonAfter" type="check" @click="ok" size="small"/>
    </a-input>
    <template v-else>
      <span>{{state.value}}</span>
      <a-button type="link" icon="edit" size="small" @click="isEdit = true" />
    </template>
  </div>
</template>

<script>
  export default {
    name: "StepState",
    props: ['state', 'status'],
    data () {
      return {
        isEdit: false,
        tempVal: ''
      }
    },
    methods: {
      ok () {
        this.isEdit = false
        this.$emit('valueChange', this.tempVal)
      }
    }
  }
</script>

<style scoped>

</style>