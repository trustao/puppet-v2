<template>
    <div class="wrap">
        <div class="inner">
            <img src="~@/assets/puppet.png" alt="">
            <div class="bg"></div>
        </div>
        <h1>Welcome to Puppet</h1>
    </div>
</template>

<script>
  export default {
    name: "index",
    mounted() {

    }
  }
</script>

<style lang="less" scoped>
    .wrap {
        background: transparent;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        h1 {
            font-size: 50px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #f39000;
            text-shadow: 2px 2px 4px #cecece;
            animation: hide .5s .5s forwards;
        }
        .inner {
            filter: blur(5px);
            animation: clear .5s .5s forwards;
        }
        img {
            z-index: 9;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: hide .5s 2s forwards;
        }
        .bg {
            width: 600px;
            height: 400px;
            background: radial-gradient(ellipse, #fff 0%, #fff 30%, #98cce6 60%, transparent 65%, transparent);
            animation: bg 1.5s .5s forwards;
        }
    }
    @keyframes clear {
        0% {
            filter: blur(5px);
        }
        100% {
            filter: blur(0);
        }
    }
    @keyframes hide {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    @keyframes bg {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(10);
        }
    }
</style>