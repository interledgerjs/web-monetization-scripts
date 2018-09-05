window.WebMonetizationScripts = window.WebMonetizationScripts || {}
window.WebMonetizationScripts.paymentPointerToUrl = function (paymentPointer) {
  if (!paymentPointer.startsWith('$')) {
    return paymentPointer
  }

  const parsed = new URL('https://' + paymentPointer.substring(1))
  return parsed.origin + (parsed.pathname || '/.well-known/pay')
}

// window.WebMonetizationScripts.donate
// Simple SPSP-based donation script that passively monetizes a webpage.
//
//   - paymentPointer: String. SPSP identifier that receives money, e.g.
//   $example.com/alice
// 
//   - noRetry: Boolean. Whether or not to retry infinitely.
//
window.WebMonetizationScripts.donate = async function ({ paymentPointer, noRetry }) {
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

  function initConnection () {
    // Don't do anything if the page is hidden because web monetization won't
    // work. just wait.
    if (document.hidden) {
      await new Promise(resolve => {
        function onVisible () {
          if (!document.hidden) {
            resolve()
            document.removeEventListener('visibilityChange', onVisible)
          }
        }

        document.addEventListener('visibilityChange', onVisible, false)
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
    ret.connection = await window.WebMonetization.monetize({
      destinationAccount: spspJsonResponse.destination_account,
      sharedSecret: spspJsonResponse.shared_secret
    })

    // Create a conceptual 'stream' of money on our Interledger connection and
    // begin sending at the maximum throughput we're allowed
    ret.stream = ret.connection.createStream()
    ret.stream.setSendMax('9999999999999')

    // Emit events when money is sent so that the page can trigger logic or UI
    // changes elsewhere in the page.
    function onOutgoingMoney (amount) {
      ret.dispatchEvent(new CustomEvent('money', amount))
    }

    ret.stream.addEventListener(onOutgoingMoney)

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
          connection.close()
        }
      }

      function cleanUp () {
        connection.removeEventListener('close', onClose)
        stream.removeEventListener('outgoing_money', onOutgoingMoney)
        document.removeEventListener('visibilityChange', onHide)
      }

      connection.addEventListener('close', onClose)
      document.addEventListener('visibilityChange', onHide, false)
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

  // Return the connection details (stream, connection, money events) so that
  // the page can that information elsewhere
  tryConnection()
  return ret
}
