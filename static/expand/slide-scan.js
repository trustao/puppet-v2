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
})(window)