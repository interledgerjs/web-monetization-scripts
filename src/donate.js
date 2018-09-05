window.WebMonetizationScripts = window.WebMonetizationScripts || {}
window.WebMonetizationScripts.paymentPointerToUrl = function (paymentPointer) {
  if (!paymentPointer.startsWith('$')) {
    return paymentPointer
  }

  const parsed = new URL('https://' + paymentPointer.substring(1))
  return parsed.origin + (parsed.pathname || '/.well-known/pay')
}

window.WebMonetizationScripts.createDonateWidget = function (donation) {
  const widget = document.createElement('div')
  const iconEl = document.createElement('img')
  const sumEl = document.createElement('span')

  const activeIconSrc = '/res/active.gif' // TODO
  const inactiveIconSrc = '/res/inactive.png' // TODO

  widget.style.position = 'fixed'
  widget.style.bottom = '35px'
  widget.style.left = '-27px'
  widget.style.right = '30px'
  widget.style.width = '150px'
  widget.style.height = '38px'
  widget.style.overflow = 'hidden'
  widget.style.color = '#fff'
  widget.style.backgroundColor = 'rgba(22,31,38,0.6)'
  widget.style.zIndex = 10000
  widget.style.borderRadius = '5px'
  widget.style.padding = '1px 10px 1px 30px'
  widget.style.boxShadow = '0px 0px 42px -11px rgba(0,0,0,1)'
  widget.style.fontFamily = 'Arial, sans-serif'
  widget.style.fontSize = '15px'
  widget.style.lineHeight = '28px'
  iconEl.style.padding = 'none'
  iconEl.style.margin = 'none'
  iconEl.style.display = 'block'
  iconEl.style.float = 'left'
  iconEl.style.marginLeft = '2px'
  iconEl.style.marginRight = '1px'
  iconEl.style.height = '32px'
  iconEl.style.width = '32px'
  iconEl.style.paddingTop = '3px'
  sumEl.style.float = 'right'
  sumEl.style.height = '100%'
  sumEl.style.overflow = 'hidden'
  sumEl.style.display = 'block'
  sumEl.style.textAlign = 'right'
  sumEl.style.paddingTop = '6px'

  iconEl.src = inactiveIconSrc
  sumEl.innerText = String(sum) + ' nXRP'
  widget.appendChild(iconEl)
  widget.appendChild(sumEl)

  let sum = 0
  let widgetAdded = false
  let active = false
  donation.addEventListener('money', ev => {
    // TODO: use ILDCP to display currency
    sum += Number(ev.detail.amount)
    sumEl.innerText = String(sum) + ' nXRP'

    if (!active) {
      active = true
      iconEl.src = activeIconSrc
    }

    // If the window is loaded and money has been sent we'll display the widget
    if (!widgetAdded && [
      'loaded',
      'interactive',
      'complete'
    ].includes(document.readyState)) {
      widgetAdded = true
      document.body.appendChild(widget)
    }
  })

  donation.addEventListener('close', () => {
    if (active) {
      active = false
      iconEl.src = inactiveIconSrc
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
window.WebMonetizationScripts.donate = async function ({
  paymentPointer,
  noRetry,
  noWidget
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

  async function initConnection () {
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
    const connection = ret.connection = await window.WebMonetization.monetize({
      destinationAccount: spspJsonResponse.destination_account,
      sharedSecret: spspJsonResponse.shared_secret
    })

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

      function cleanUp () {
        connection.removeEventListener('close', onClose)
        stream.removeEventListener('outgoing_money', onOutgoingMoney)
        document.removeEventListener('visibilitychange', onHide)
        ret.dispatchEvent(new CustomEvent('close'))
      }

      connection.addEventListener('close', onClose)
      document.addEventListener('visibilitychange', onHide, false)
    })
  }

  // Retry loop to make sure that the page continues to send money
  async function tryConnection () {
    try {
      await initConnection()
    } catch (e) {
      console.error('web monetization error.' +
        'error=' + e +
        (noRetry ? '' : '. re-establishing after 1000ms.'))
      if (!noRetry) {
        await new Promise(res => setTimeout(res, 1000))
        return tryConnection()
      }
    }
  }

  // Create a widget to show donation unless the user disabled it
  if (!noWidget) {
    window.WebMonetizationScripts.createDonateWidget(ret)
  }

  // Return the connection details (stream, connection, money events) so that
  // the page can that information elsewhere
  tryConnection()
  return ret
}
