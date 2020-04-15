<template>
  <div class="wrap">
    <div class="webview">
      <!--            <webview src="https://jwms.jclps.com" style="min-width: 1024px;height: 100vh"></webview>-->
      <webview
        ref="webview" :preload="preload"
        nodeintegration nodeIntegrationInSubFrames
        disablewebsecurity
        src="https://jwms.jclps.com" style="min-width: 1024px;height: 100vh"></webview>
      <!--        src="http://localhost:9900" style="min-width: 1024px;height: 100vh"></webview>-->
    </div>
    <div class="controller">
      <div class="controller-head">
        <a-button icon="left" @click="$router.push('/taskManage')">返回</a-button>
        <a-button @click="run" type="primary" :loading="curTask.status === 'RUNNING'">Run</a-button>
        <a-button @click="stop">Stop</a-button>
<!--        <a-button @click="sendAction">Test</a-button>-->
        <a-button @click="openDevTools">开发者工具</a-button>
      </div>
      <a-card class="task-card" title="任务">
        <div style="height: 100%">
          <Scroller>
            <TaskInfo></TaskInfo>
          </Scroller>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
  import TaskInfo from '@/components/TaskInfo'
  import Scroller from '@/components/Scroller'
  import {renderRegister} from "../../../module/Junctor/Render";
  import {mapGetters} from 'vuex'

  export default {
    name: 'Running',
    components: {TaskInfo, Scroller},
    data() {
      return {
        preload: 'file://' + __static + '/expand/connect.js'
      }
    },
    computed: {
      ...mapGetters({
        curTask: 'Task/curTask'
      }),
    },
    methods: {

      sendAction() {
        const wc = this.$refs.webview.getWebContents()
        try {
          wc.debugger.attach("1.1");
          wc.debugger.sendCommand("DOM.getDocument", {pierce: true, depth: 100}, function (err, res) {
            console.log('doc', res)
            let i = 0
            const loop = (node) => {
              console.log(i++)
              if (node.nodeName === 'HEAD' || !node.children) return
              if (node.nodeName === "IFRAME") {
                console.log(node)
                return node.contentDocument.nodeId
              } else {
                for (let i = 0; i < node.children.length; i++) {
                  const argument = node.children[i];
                  const res = loop(argument)
                  if (res) {
                    return res
                  }
                }
              }
            }
            const iframeRootId = loop(res.root)
            // wc.debugger.sendCommand("DOM.querySelector", {
            //   nodeId: iframeRootId,
            //   selector: "#file"  // CSS selector of input[type=file] element
            // }, function (err, res) {
            //   console.log('file', res)
            //   wc.debugger.sendCommand("DOM.setAttributeValue", {
            //     nodeId: res.nodeId,
            //     name: 'style', value: 'outline: 10px solid'
            //     // selector: "iframe"  // CSS selector of input[type=file] element
            //   }, function (err, res) {
            //     console.log(err, res)
            //   });
            //   // wc.debugger.sendCommand("DOM.setFileInputFiles", {
            //   //   nodeId: res.nodeId,
            //   //   files: [msg.path]  // Actual list of paths
            //   // }, function (err, res) {
            //   //   wc.debugger.detach();
            //   // });
            // });
          })
        } catch (err) {
          console.error("Debugger attach failed : ", err);
        };
      },
      openDevTools () {
        this.$refs.webview.openDevTools()
      },
      run () {
        this.curTask.run()
      },
      stop () {
        this.curTask.stop()
      }
    },
    mounted() {
      const {webview} = this.$refs
      renderRegister(webview)
      // webview.addEventListener('dom-ready', () => {
      //   // webview.openDevTools()//webview加载完成，可以处理一些事件了
      //   // const data = readFile(__static + '/expand/jquery.min.js')
      //   // webview.executeJavaScript(data)
      //   // const j = readFile('expand/actions.js')
      //   // webview.executeJavaScript(j)
      //   webview.send('msg', 'Puppet Loaded') //向webview嵌套的页面响应事件
      // })
      //
      // webview.addEventListener('crashed', err => {
      //   console.log(err)
      // })
    }
  }
</script>

<style lang="less" scoped>
  .wrap {
    display: flex;
    width: 100vw;
    height: 100vh;

    .webview {
      flex: 1;
    }

    .controller {
      display: flex;
      flex-direction: column;
      width: 300px;
      background-color: #f8f9fa;
      .controller-head {
        display: flex;
        justify-content: space-between;
        flex-shrink: 0;
        padding: 15px;
        border-bottom: 1px solid #d9d9d9;
        margin-bottom: 20px;
      }
      .task-card {
        display: flex;
        flex-direction: column;
        flex: 1;
        /deep/ .ant-card-head {
          flex-shrink: 0;
        }
        /deep/ .ant-card-body {
          flex: 1;
          overflow: hidden;
        }
      }
    }
  }
</style>
