<template>
  <a-upload-dragger name="file" :multiple="true" :fileList="value" :beforeUpload="beforeUpload" @change="fileChange">
    <p class="ant-upload-drag-icon">
      <a-icon type="inbox" />
    </p>
    <p class="ant-upload-text">点击选择或者拖拽SKU表格到此处</p>
  </a-upload-dragger>
</template>

<script>

  export default {
    name: "FileDrop",
    props: ['value'],
    data ()　{
      return {
        fileList: []
      }
    },
    methods: {
      beforeUpload (file, fileList) {
        this.$emit('change', fileList)
        console.log(fileList)
        return false
      },
      fileChange (info) {
      }
    }
  }
</script>

<style scoped>

</style>