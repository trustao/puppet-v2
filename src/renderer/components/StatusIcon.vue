<template>
  <a-icon :class="status === 'READY' && 'ic'" :type="icon.type" :style="{color: icon.color}" @click.stop="clickHandler"/>
</template>

<script>
  export default {
    name: "StatusIcon",
    props: ['status'],
    computed: {
      icon () {
        switch (this.status) {
          case "READY":
            return {
              type: 'play-circle',
              color: '#666'
            }
          case "RUNNING":
            return {
              type: 'loading',
              color: '#333'
            }
          case "SUCCESS":
            return {
              type: 'check-circle',
              color: '#52c41a'
            }
          case "ERROR":
            return {
              type: 'close-circle',
              color: '#c43937'
            }
        }
      }
    },
    methods: {
      clickHandler () {
        this.$emit('run')
      }
    }
  }
</script>

<style lang="less" scoped>
  .ic:hover {
    color: #407ce6!important;
  }
</style>