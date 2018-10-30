const debug = require('debug')('web-monetization-scripts:donate')

window.WebMonetizationScripts = window.WebMonetizationScripts || {}
window.WebMonetizationScripts.paymentPointerToUrl = function (paymentPointer) {
  if (!paymentPointer.startsWith('$')) {
    return paymentPointer
  }

  const parsed = new URL('https://' + paymentPointer.substring(1))
  return parsed.origin + (parsed.pathname || '/.well-known/pay')
}
window.WebMonetizationScripts.css = `
  #wm-coil-advert-widget {
    position: fixed;
    z-index: 10000;
  }

  #wm-widget {
    pointer-events: auto;
    line-height: normal;
    vertical-align: middle;
    display: inline-block;
    position: relative;
    bottom: 0;
    left: 0;
    cursor: pointer;

  }
  #wm-widget-text {
    vertical-align: middle;
    line-height: normal;
    margin-left: 4px;
    padding-top: 7px;
    padding-bottom: 5px;
    padding-left: 14px;
    padding-right: 14px;
    box-sizing: border-box;
    height: 32px;
    border-radius: 16px;
    background-color: #2D333A;
    color: #fff;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.2s;
    font-family: Roboto, sans-serif;
  }

  #wm-link, #wm-link:hover, #wm-link:active {
    color: white;
  }
`

window.WebMonetizationScripts.logoSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#2D333A"/><path d="M22.1746 20.4186C22.706 20.4186 23.3992 20.6844 23.8845 21.814C23.9538 21.969 24 22.1462 24 22.3012C24 24.1617 19.5866 25.845 17.0218 25.9779C16.837 25.9779 16.629 26 16.4442 26C12.6316 26 9.09628 24.0509 7.27086 20.9059C6.41592 19.4219 6 17.7829 6 16.1218C6 14.1949 6.57766 12.268 7.70988 10.6069C8.58793 9.27796 10.2978 7.52824 13.3017 6.57586C14.0642 6.33223 15.4044 6 16.9294 6C18.4082 6 20.0488 6.31008 21.4814 7.35105C23.4917 8.7907 23.9076 10.3632 23.9076 11.3821C23.9076 11.825 23.8383 12.1573 23.7689 12.3566C23.3068 13.9734 21.7587 15.2137 19.9564 15.4574C19.5404 15.5017 19.1938 15.546 18.8703 15.546C17.2298 15.546 16.6752 14.8815 16.6752 14.1285C16.6752 13.1096 17.6688 11.9136 18.3851 11.9136C18.4775 11.9136 18.57 11.9358 18.6393 11.9801C18.8241 12.0908 19.0552 12.1351 19.2632 12.1351C19.3325 12.1351 19.3787 12.1351 19.448 12.113C20.0257 12.0465 20.3261 11.67 20.3261 11.2049C20.3261 10.3411 19.2632 9.16722 16.9525 9.16722C16.2131 9.16722 15.3582 9.27796 14.3877 9.56589C12.3543 10.1639 11.2221 11.5592 10.6444 12.423C9.8819 13.5305 9.51219 14.8151 9.51219 16.0775C9.51219 17.1628 9.78947 18.2481 10.344 19.2226C11.5456 21.2824 13.9024 22.567 16.4442 22.567C16.5828 22.567 16.6983 22.567 16.837 22.567C20.1412 22.3898 20.9037 20.7951 21.6431 20.4851C21.7587 20.4629 21.9666 20.4186 22.1746 20.4186Z" fill="white"/></svg>`

window.WebMonetizationScripts.createAdvertWidget = function () {
  let widgetAdded = false

  const container = document.createElement('div')

  container.id = 'wm-coil-advert-widget'

  const style = document.createElement('style')

  if (style.styleSheet) {
    style.styleSheet.cssText = window.WebMonetizationScripts.css
  } else {
    style.appendChild(document.createTextNode(window.WebMonetizationScripts.css))
  }

  document.getElementsByTagName('head')[0].appendChild(style)

  const widget = document.createElement('svg')
  widget.id = 'wm-widget'
  widget.innerHTML = window.WebMonetizationScripts.logoSvg
  const advertText = document.createElement('span')
  advertText.id= 'wm-widget-text'
  advertText.innerHTML = `Support this site with <a id='wm-link' href='https://www.coil.com' target='_blank'>Coil</a>`
  let bottom = -40
  let diff = 10
  container.appendChild(widget)
  container.appendChild(advertText)

  container.style.bottom = String(bottom) + 'px'

  if (!widgetAdded) {
    widgetAdded = true
    document.body.appendChild(container)
  }

  widget.onclick = () => {
    advertText.style.opacity = advertText.style.opacity === '0' ? '1' : '0'
  }

  advertText.onclick = ev => {
    if (ev.target.id === 'wm-link') {
      advertText.style.opacity = advertText.style.opacity === '0' ? '1' : '0'
    }
  }
  function animate () {
    diff = Math.max(diff - 1, 1)
    bottom += diff
    container.style.bottom = String(bottom) + 'px'
    if (bottom < 13) {
      requestAnimationFrame(animate)
    } else {
      advertText.style.opacity = '1'
    }
  }

  animate()
}

window.WebMonetizationScripts.createDonateWidget = function (donation) {
  const container = document.createElement('div')
  container.id = 'web-monetization-widget'

  const style = document.createElement('style')

  if (style.styleSheet) {
    style.styleSheet.cssText = window.WebMonetizationScripts.css
  } else {
    style.appendChild(document.createTextNode(window.WebMonetizationScripts.css))
  }

  document.getElementsByTagName('head')[0].appendChild(style)

  const widget = document.createElement('svg')
  widget.id = 'wm-widget'
  widget.innerHTML = window.WebMonetizationScripts.logoSvg

  const counter = document.createElement('div')
  const currencyCode = document.createElement('span')
  const currencyAmount = document.createElement('span')

  counter.id = 'wm-widget-text'
  // Expand this list for commonly used currencies.  If a currency isn't
  // present here it will use the 3-letter code instead.
  const currencySymbols = {
    'USD': '$',
    'GBP': '&pound;',
    'JPY': '&yen;',
    'EUR': '&euro;'
  }

  container.appendChild(widget)
  counter.appendChild(currencyCode)
  counter.appendChild(currencyAmount)
  container.appendChild(counter) 
  currencyCode.innerText = ''
  currencyAmount.innerText = ''

  let diff = 10
  let bottom = -40
  container.style.bottom = String(bottom) + 'px'


  container.onselectstart = ev => ev.preventDefault()
  widget.onclick = ev => {
    ev.preventDefault()
    counter.style.opacity = counter.style.opacity === '0' ? '1' : '0'
    counter.style.pointerEvents = counter.style.opacity === '1' ? 'auto' : 'none'
  }

  counter.onclick = ev => {
    if (counter.style.opacity === '1') {
      ev.preventDefault()
      counter.style.opacity = '0'
      counter.style.pointerEvents = 'none'
    }
  }

  let widgetAdded = false
  let animating = false
  let display = 0
  let sum = 0
  let currency = 'XRP'
  let scale = 6
  let displayScale = 6

  donation.addEventListener('money', ev => {
    sum += Number(ev.detail.amount)

    if (!animating) {
      animating = true

      function animateAmount () {
        display += Math.ceil((sum - display) / 20)
        currencyAmount.innerText = (Math.min(display, sum) / Math.pow(10, scale))
          .toFixed(displayScale)

        if (display >= sum) {
          animating = false
          return
        }
        requestAnimationFrame(animateAmount)
      }

      animateAmount()
    }

    // If the window is loaded and money has been sent we'll display the widget
    if (!widgetAdded && [
      'loaded',
      'interactive',
      'complete'
    ].includes(document.readyState)) {
      // set currency details now that an Interledger connection exists
      currency = donation.connection.sourceAssetCode || 'XRP'
      scale = donation.connection.sourceAssetScale || 9
      displayScale = scale

      // special case for displaying XRP in drops (uXRP) instead of drips (nXRP)
      if (currency === 'XRP' && scale === 9) {
        displayScale = 6
      }

      currencyAmount.innerText = (0).toFixed(displayScale)
      if (currencySymbols[currency]) {
        currencyCode.innerHTML = currencySymbols[currency]
      } else {
        const bold = document.createElement('strong')
        bold.innerText = currency + ' '
        currencyCode.appendChild(bold)
      }

      widgetAdded = true
      document.body.appendChild(container)

      function animate () {
        diff = Math.max(diff - 1, 1)
        bottom += diff
        container.style.bottom = String(bottom) + 'px'
        if (bottom < 13) {
          requestAnimationFrame(animate)
        } else {
          counter.style.opacity = '1'
          counter.style.pointerEvents = 'auto'
        }
      }

      animate()
    }
  })
}

// window.WebMonetizationScripts.donate
//
// Simple SPSP-based donation script that passively monetizes a webpage.
//
//   - paymentPointer: String. SPSP identifier that receives money, e.g.
//   $example.com/alice
// 
//   - noRetry: Boolean. Whether or not to retry infinitely.
//
//   - noWidget: Boolean. Whether or not to show coil widget in bottom-left of
//   page.
//
window.WebMonetizationScripts.donate = function ({
  paymentPointer,
  noRetry,
  noWidget,
  addCoilAdvert
}) {
  function wmError (msg) {
    throw new Error(msg + ' make sure you include the polyfill from https://polyfill.webmonetization.org/polyfill.js and include it before this script.')
  }

  // Ensure that the web monetization polyfill is included
  if (!window.WebMonetization) {
    wmError('window.WebMonetization is not defined.')
  }

  // Ensure that the correct version of the web monetization polyfill has been
  // included.
  if (!window.WebMonetization.monetize) {
    wmError('window.WebMonetization.monetize is not defined.')
  }

  // Create an event target that emits events on money
  // TODO: cross-platform way to do this
  const ret = new EventTarget()

  async function initConnection (loadedSPSP) {
    // Don't do anything if the page is hidden because web monetization won't
    // work. just wait.

    if (document.hidden) {
      await new Promise(resolve => {
        function onVisible () {
          if (!document.hidden) {
            resolve()
            document.removeEventListener('visibilitychange', onVisible)
          }
        }

        document.addEventListener('visibilitychange', onVisible, false)
      })
    }

    // Make sure user hasn't closed before doing slow operation
    if (ret._userclose) {
      return
    }

    // Convert SPSP payment pointer (e.g. $example.com) to URL (e.g.
    // https://example.com/.well-known/pay)
    const spspReceiver = window.WebMonetizationScripts
      .paymentPointerToUrl(paymentPointer)

    // Actual SPSP query that retrieves details of how to stream payment over
    // Interledger
    const spspQuery = await fetch(spspReceiver, {
      headers: {
        'Accept': 'application/spsp4+json'
      }
    })

    if (!spspQuery.ok) {
      throw new Error('failed to fetch spsp receiver.' +
        ' receiver=' + spspReceiver)
    }

    // Create the actual connection over Interledger.
    const spspJsonResponse = await spspQuery.json()

    // Make sure user hasn't closed before doing slow operation
    if (ret._userclose) {
      return
    }

    const connection = ret.connection = await window.WebMonetization.monetize({
      destinationAccount: spspJsonResponse.destination_account,
      sharedSecret: spspJsonResponse.shared_secret
    })

    // Trigger loaded SPSP callback to indicate that the connection details
    // are actually valid.
    loadedSPSP()

    // Create a conceptual 'stream' of money on our Interledger connection and
    // begin sending at the maximum throughput we're allowed
    const stream = ret.stream = connection.createStream()
    stream.setSendMax('9999999999999')

    // Emit events when money is sent so that the page can trigger logic or UI
    // changes elsewhere in the page.
    function onOutgoingMoney (ev) {
      ret.dispatchEvent(new CustomEvent('money', {
        detail: {
          amount: ev.amount
        }
      }))
    }

    stream.addEventListener('outgoing_money', onOutgoingMoney)

    // Wait while the stream sends and exit (thus triggering a retry) should
    // the connection close.
    return new Promise((resolve, reject) => {
      function onClose () {
        reject(new Error('web monetization connection closed.'))
        cleanUp()
      }

      // Web monetization doesn't work when the page is hidden, so we'll close
      // the connection and then wait for it to come back.
      function onHide () {
        if (document.hidden) {
          reject(new Error('page has been hidden.'))
          cleanUp()
        }
      }

      function onUserClose () {
        reject(new Error('web monetization closed by user'))
        stream.close()
        connection.close()
        cleanUp()
      }

      function cleanUp () {
        connection.removeEventListener('close', onClose)
        stream.removeEventListener('outgoing_money', onOutgoingMoney)
        document.removeEventListener('visibilitychange', onHide)
        ret.removeEventListener('userclose', onUserClose)
        ret.dispatchEvent(new CustomEvent('close'))
      }

      ret.addEventListener('userclose', onUserClose)
      connection.addEventListener('close', onClose)
      document.addEventListener('visibilitychange', onHide, false)
    })
  }

  // Allow user to close connection and stop retrying manually
  ret._open = false
  ret._userclose = false
  ret.close = function () {
    ret._userclose = true
    ret.dispatchEvent(new CustomEvent('userclose'))

    // Remove web monetization widget if it was created
    const widget = document.getElementById('web-monetization-widget')
    if (widget) {
      widget.remove()
    }
  }

  // Retry loop to make sure that the page continues to send money
  async function tryConnection (loadedSPSP) {
    try {
      await initConnection(loadedSPSP)
    } catch (e) {
      // Don't retry if the user just hasn't registered a handler
      if (e.name === 'NoHandlerRegisteredError') {
        debug('no web monetization handler registered.')
        // window show advertising widget

        if (addCoilAdvert) {
          window.WebMonetizationScripts.createAdvertWidget()
        }
        return
      }

      debug('web monetization error.' +
        'error=' + e +
        (noRetry ? '' : '. re-establishing after 1000ms.'))
      if (!noRetry && !ret._userclose) {
        await new Promise(res => setTimeout(res, 1000))
        return tryConnection(loadedSPSP)
      }
    }
  }

  // Create a widget to show donation unless the user disabled it
  if (!noWidget) {
    window.WebMonetizationScripts.createDonateWidget(ret)
  }

  // Return the connection details (stream, connection, money events) so that
  // the page can that information elsewhere
  tryConnection(() => {
    if (!ret._open) {
      ret._open = true
      ret.dispatchEvent(new CustomEvent('open'))
    }
  })

  return ret
}
