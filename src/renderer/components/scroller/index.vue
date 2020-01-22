<template>
  <div class="scroll-wrapper" :class="hideBar && 'hide-bar'" ref="scroller">
    <slot></slot>
  </div>
</template>

<script>
  import PerfectScrollbar from 'perfect-scrollbar';
  import 'perfect-scrollbar/css/perfect-scrollbar.css'
  const psEvents = ["ps-scroll-y", "ps-scroll-x", "ps-scroll-up", "ps-scroll-down", "ps-scroll-left",
    "ps-scroll-right", "ps-y-reach-start", "ps-y-reach-end", "ps-x-reach-start", "ps-x-reach-end"]

  export default {
    name: 'Scroller',
    props: {
      scrollToCoord: {
        type: Object,
        default () {
         return { x: 0, y: 0 }
        }
      },
      hideBar: {
        type: Boolean,
        default: false
      },
      showId: [String, HTMLElement],
      psOptions: Object
    },
    data () {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        interval: null,
        psInstance: null
      }
    },
    watch: {
      scrollToCoord: {
        deep: true,
        handler (val) {
          const {x = 0, y = 0} = val
          this.scrollTo(x, y)
        }
      },
      showId (val) {
        this.scrollShow(val)
      }
    },
    methods: {
      scrollTo (x, y, animate = true, duration = 500, split = 25) {
        if (!animate) {
          clearInterval(this.interval)
          this.$refs.scroller.scrollTo(x, y)
          return
        }
        const el = this.$refs.scroller
        const times = duration / split
        let i = 0, startX = el.scrollLeft, startY = el.scrollTop,
          xGap = (x - startX) / times,
          yGap = (y - startY) / times
        clearInterval(this.interval)
        this.interval = setInterval(() => {
          el.scrollTo(startX + i * xGap, startY + i * yGap)
          i++
          if (i > times) clearInterval(this.interval)
        }, split)
      },
      scrollBy (x, y, animate = true, duration = 500, split = 25) {
        if (!animate) {
          clearInterval(this.interval)
          this.$refs.scroller.scrollBy(x, y)
          return
        }
        const el = this.$refs.scroller
        const times = duration / split
        let i = 0,
          xGap = x / times,
          yGap = y / times
        clearInterval(this.interval)
        this.interval = setInterval(() => {
          el.scrollBy(i * xGap, i * yGap)
          i++
          if (i > times) clearInterval(this.interval)
        }, split)
      },
      scrollShow (idOrDom, animate = true, duration = 500, split = 25) {
        const dom = idOrDom instanceof HTMLElement ? idOrDom : document.getElementById(idOrDom)
        if (!dom) return
        const {left, top} = dom.getBoundingClientRect()
        let toX = this.$refs.scroller.scrollLeft, toY = this.$refs.scroller.scrollTop
        if (left !== this.left) toX += left - this.left
        if (top !== this.top) toY += top - this.top
        this.scrollTo(toX, toY, animate, duration, split)
      },
      psInit () {
        this.psInstance = new PerfectScrollbar(this.$refs.scroller, this.psOptions)
        const rect = this.$refs.scroller.getBoundingClientRect()
        this.left = rect.left
        this.top = rect.top
        this.width = rect.width
        this.height = rect.height
        this.initEvents()
      },
      initEvents () {
        psEvents.forEach(key => {
          this.$refs.scroller.addEventListener(key, (...args) => {
            this.$emit(key, ...args)
          })
        })
      }
    },
    mounted () {
      this.psInit()
    }
  }
</script>

<style scoped lang="less">
  .scroll-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .hide-bar/deep/ .ps__rail-x ,.hide-bar/deep/ .ps__rail-y{
      display: none;
    }
</style>
