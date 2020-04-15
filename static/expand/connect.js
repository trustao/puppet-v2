window.nodeRequire = require

delete window.module
delete window.require
delete window.exports

const {ipcRenderer} = nodeRequire('electron')


ipcRenderer.on('msg', (ev, msg) => {
  showTip(msg)
})

ipcRenderer.on('ACTION', (ev, payload) => {
  showTip(payload.uuid)
  try {
    const state = invokeAction(payload)
    ipcRenderer.sendToHost('ACTION', {
      uuid: payload.uuid,
      status: 'SUCCESS',
      state
    })
  } catch (e) {
    console.error(e)
    ipcRenderer.sendToHost('action', {
      uuid: payload.uuid,
      status: 'FAIL'
    })
  }
})

function invokeAction(action) {
  console.log('[Puppet] try run:' , action)
  const $el = getEl(action.selector, action.inFrame)
  let state = ''
  switch (action.type) {
    case 'NAVIGATE':
      setTimeout(() => {
        location.href = action.state
      })
      break;
    case 'CLICK':
      $el[0].click()
      break;
    case 'INPUT':
      $el.val(action.state)
      break;
    case 'GET_TEXT':
      state = $el.text().trim()
      break;
    case 'GET_VALUE':
      state = $el.val().trim()
      break;
    case 'GET_ATTR':
      state = $el.attr(action.state).trim()
      break;
    case 'SELECT':
      console.log(action.state)
      const option = $el.find(`option:contains(${action.state})`)
      console.log('选择', option, $el)
      $el.val(option.length ? option.val() : action.state)
      $el[0].dispatchEvent(new Event('change'))
      break;
    case 'CHECK':
      const el = $el[0]
      let target = !(action.state === false)
      el.click()
      if (el.checked !== target) el.click()
      if (el.checked !== target) {
        el.checked = false
      }
      break;
    case 'EXIST':
      state = !!$el.length
      break;
    case 'HAS_ATTR':
      state = $el[0].hasAttribute(action.state)
      break;
    case 'DOWNLOAD':
      break;
    case 'BLUR':
      $el[0].dispatchEvent(new Event('blur'))
      break;
  }
  console.log('stateeeee', $el, state)
  return state
}

function getEl(selector, inFrame) {
  const $el = inFrame ? (
    $($(typeof inFrame === 'string' ? inFrame : 'iframe')[0].contentDocument).find(selector)
  ) : $(selector)
  console.log($el[0])
  return $el.length ? $el : null
}


function sendMessage () {
  ipcRenderer.sendToHost('hello host')
  ipcRenderer.send('user-events', 'click')
}

window.$sendMsg = sendMessage

const tips = []
function showTip (msg, time = 3000) {
  const tip = document.createElement('p')
  tip.setAttribute('style', `
    position: fixed;
    top: ${tips.length * 40 + 10}px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    line-height: 24px;
    padding: 5px;
    border-radius: 4px;
    z-index: 99999;
    box-shadow: 0 0 5px 0 rgba(0,0, 0, 0.4);
    color: #363636;
    transition: all .5s linear;
    opacity: .8;
  `)
  tip.innerText = msg
  document.body.appendChild(tip)
  tips.push(tip)
  setTimeout(() => {
    tip.style.opacity = 0
    setTimeout(() => {
      tip.remove()
      tips.splice(tips.indexOf(tip), 1)
      updateTip()
    }, 500)
  }, time)
}

function updateTip () {
  tips.forEach((tip, i) => {
    tip.style.top = `${i * 40 + 10}px`
  })
}

window.addEventListener('load', () => {
  const script = document.createElement('script')
  script.src = 'https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js'
  document.body.appendChild(script)
});

(function (w) {
  class SliderScan {
    constructor(ctx) {
      if (!ctx) ctx = document.createElement('canvas').getContext('2d')
      this.ctx = ctx
    }

    getSlideLength(url) {
      const ctx = this.ctx
      return new Promise(resolve => {
        const img = new Image()
        img.src = url
        img.onload = function () {
          ctx.drawImage(img, 0, 0, 360, 140)
          const imageData = ctx.getImageData(0, 0, 360, 140)
          resolve(transform(imageData))
        }
      })

    }
  }

  w.SliderScan  = SliderScan
  function transform(imageData) {
    const pixelData = imageData.data;
    let sum = 0
    for (var i = 0; i < imageData.width * imageData.height; i++) {
      var r = pixelData[i * 4],
        g = pixelData[i * 4 + 1],
        b = pixelData[i * 4 + 2];
      var grey = (r + g + b) / 3;
      pixelData[i * 4] = grey;
      pixelData[i * 4 + 1] = grey;
      pixelData[i * 4 + 2] = grey;
      sum += grey
    }

    const avg = sum / (imageData.width * imageData.height)

    for (var i = 0; i < imageData.width * imageData.height; i++) {
      var grey = pixelData[i * 4 + 0]
      grey = grey > avg * .8 ? 255 : grey
      pixelData[i * 4 + 0] = grey;
      pixelData[i * 4 + 1] = grey;
      pixelData[i * 4 + 2] = grey;
    }

    return calcLine(imageData)
  }

  function calcLine(imageData) {
    const pixelData = imageData.data
    const resL = [], resR = [], res = [], rowRes = []
    for (var i = 0; i < imageData.width; i++) {
      if (i < 10) continue
      let max = 0, l = 1
      let matchLeft = [], prev = null, matchRight = []
      for (let j = 10; j < imageData.height - 10; j++) {
        const idx = j * imageData.width + i
        const grey = pixelData[idx * 4];
        const prevGrey = pixelData[(idx - 1) * 4];
        const dt = grey - prevGrey
        if (dt < -35) {// 两列色差
          if (!prev) {
            prev = {v: dt, y: j}
            matchLeft.push(prev)
          } else {
            if (inRange(dt, prev.v)) {
              prev = {v: dt, y: j}
              matchLeft.push(prev)
              l++
            } else {
              max = Math.max(max, l)
              l = 1
              prev = null
            }
          }
        } else if (dt > 28) {// 两列色差
          if (!prev) {
            prev = {v: dt, y: j}
            matchRight.push(prev)
            l++
          } else {
            if (inRange(dt, prev.v)) {
              prev = {v: dt, y: j}
              matchRight.push(prev)
            } else {
              max = Math.max(max, l)
              l = 1
              prev = null
            }
          }
        } else {
          max = Math.max(max, l)
          l = 1
          prev = null
        }
      }
      if (matchLeft.length > 10 && matchLeft.length < 35 && max < 15) {
        resL.push(i)
      }
      if (matchRight.length > 10 && matchRight.length < 45 && max < 15) {
        resR.push(i)
      }
    }
    resR.forEach(i => {
      resL.forEach(j => {
        if (inRange(j, i, 38, 42)) {
          res.push(j)
        }
      })
    })

    const resObj = {}

    res.forEach(i => {
      resObj[i] = 1
      const rowMatch = []
      for (let j = 10; j < imageData.height - 10; j++) {
        if (checkRow(i, j, imageData)) {
          rowMatch.push(j)
          resObj[i] += 1
        }
      }
      rowMatch.sort((a, b) => {
        if (inRange(a - b, 40, 5)) {
          resObj[i] += 100
          rowRes.push({x: i, y: Math.min(a, b)})
        }
        return 1
      })
    })
    return res.sort((a, b) => resObj[b] - resObj[a])
  }


  function checkRow(x, y, imageData) {
    let matchB = [], matchT = [], prev = null, max = 0, l = 1
    for (let i = 0; i < 50; i++) {
      const grey = imageData.data[(y * imageData.width + i + x) * 4]
      const topGrey = imageData.data[((y - 1) * imageData.width + i + x) * 4]
      const dt = grey - topGrey
      if (dt < -30) {
        if (!prev) {
          prev = {v: dt, x: i + x}
          matchB.push(prev)
        } else {
          if (inRange(prev.v, dt)) {
            l++
            prev = {v: dt, x: i + x}
            matchB.push(prev)
          } else {
            max = Math.max(max, l)
            prev = null
            l = 1
          }
        }
      } else if (dt > 20) {
        if (!prev) {
          prev = {v: dt, x: i + x}
          matchT.push(prev)
        } else {
          if (inRange(prev.v, dt)) {
            l++
            prev = {v: dt, x: i + x}
            matchT.push(prev)
          } else {
            max = Math.max(max, l)
            prev = null
            l = 1
          }
        }
      } else {
        max = Math.max(max, l)
        prev = null
        l = 1
      }
    }
    if ((matchB.length > 8 || matchT.length > 8) && max > 6) {
      return true
    } else {
      return false
    }
  }

  function inRange(value, source, range = 20, rangeB) {
    const dt = source - value
    if (rangeB) {
      return dt >= range && dt <= rangeB
    }
    return Math.abs(dt) < range
  }
})(window);

((w) => {
  const s = new SliderScan()
  w.mockSlide = async function () {
    const btn = getEl('.JDJRV-slide-btn', '.login-frame')[0]
    const bImg = getEl('.JDJRV-bigimg', '.login-frame')[0]
    const img = bImg.querySelector('img')
    const res = await s.getSlideLength(img.src)
    if (!res ||　!res[0]) {
      throw new Error('解析失败')
    }
    const rect = btn.getBoundingClientRect()
    const startX = rect.left + (Math.random() * rect.width | 0)
    const startY = rect.top + (Math.random() * rect.height | 0)
    const targetX = res[0] * (bImg.offsetWidth / 360) + startX
    await move(btn, startX, startY, targetX)
  }

  async function move(btn, startX, startY, targetX) {
    btn.dispatchEvent(createEvent('mousedown', startX, startY))
    let curX = startX
    let i = 0
    console.log(targetX)
    let count = 0
    while (true) {
      let t = 8
      count++
      curX += Math.random() * 5 | 0
      if (Math.random() > .88) t += Math.random() * 10 | 0
      await moveTo(btn, curX, startY, t)
      if (curX > targetX + 2) break
    }

    console.log(count)
    btn.dispatchEvent(createEvent('mouseup', targetX, startY))
  }

  function moveTo(btn, x, y, t = 5) {
    return new Promise(resolve => {
      setTimeout(() => {
        btn.dispatchEvent(createEvent('mousemove', x, y))
        resolve()
      }, t)
    })
  }

  function createEvent (eventName, x, y) {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(eventName, true, false, null, 0, x, y, x, y, false, false, false, false, 0, null);
    return evt;
  }
})(window);