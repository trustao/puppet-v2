<template>
  <div class="form-wrap">
    <template  v-for="(item, index) in forms">
      <div class="form-item" :key="index" v-if="item.type !== 'hidden'">
        <div class="label">
          <span>{{item.desc}}</span>
        </div>
        <div class="input-content">
          <FileDrop v-if="item.type === 'fileInput'" v-model="item.value" @change="fileChange($event, item.key)"></FileDrop>
          <a-input v-else v-model="item.value" @change="formChange(item.key, item.value)"/>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import FileDrop from './FileDrop'
  import {mapActions} from 'vuex'
  export default {
    name: "TaskForm",
    components: {FileDrop},
    props: ['forms'],
    methods: {
      ...mapActions('Task', ['updateTaskState']),
      formChange (key, value) {
        console.log('formChange', key, value)
        this.updateTaskState({key, value})
      },
      fileChange (file, key) {
        console.log('fileChange', key, file)
        this.updateTaskState({key, value: file})
      }
    },
    mounted() {
      console.log(this.forms)
    }
  }
</script>

<style lang="less" scoped>
  .form-wrap {
    .form-item {
      display: flex;
      align-items: center;
      margin: 15px;
      .label {
        width: 150px;
        text-align: right;
        margin: 0 20px;
        padding-right: 20px;
      }
      .input-content {
        width: 400px;
      }
    }
  }
</style>