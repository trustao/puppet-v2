window.addEventListener('load', () => {
  setTimeout(() => {
    if (location.hostname === 'ups.jclps.com' && location.pathname === '/login') {
      const doc = document.querySelector('.login-frame').contentWindow.document
      doc.querySelector('#loginname').value = '金康019'//'9红红火火'
      doc.querySelector('#nloginpwd').value = 'jinkang019'
      doc.querySelector('#paipaiLoginSubmit').click()
      setTimeout(() => {
        const url = doc.querySelector('#JDJRV-wrap-paipaiLoginSubmit img').src
        new SliderScan().getSlideLength(url).then(res =>　{
          console.log(res)
        })
      }, 2000)

    }
  }, 1000)
})