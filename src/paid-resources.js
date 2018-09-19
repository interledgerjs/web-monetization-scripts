require('./donate')

window.WebMonetizationScripts = window.WebMonetizationScripts || {}
window.WebMonetizationScripts.base64url = function (arr) {
  const charMap = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '-', '_' ]
  let str = ''
  const bits = []
  for (let i = 0; i < Math.ceil((arr.length * 8) / 6); ++i) {
    if (((i + 1) * 6) > bits.length) {
      let byteVal = arr[Math.floor(((i + 1) * 6) / 8)] || 0
      let nextBits = []
      for (let j = 0; j < 8; ++j) {
        nextBits.push(byteVal & 1)
        byteVal >>= 1
      }
      nextBits.reverse()
      bits.push(...nextBits)
    }
    const base64urlKey = (
      (bits[i * 6 + 0] << 5) +
      (bits[i * 6 + 1] << 4) +
      (bits[i * 6 + 2] << 3) +
      (bits[i * 6 + 3] << 2) +
      (bits[i * 6 + 4] << 1) +
      (bits[i * 6 + 5] << 0))
    str += charMap[base64urlKey]
  }
  return str
}

window.WebMonetizationScripts.initPaidResources = async function initPaidResources ({
  paymentPointer,
  noRetry,
  noWidget
}) {
  const paidResourceUserBuffer = new Uint8Array(16)
  window.crypto.getRandomValues(paidResourceUserBuffer)
  const paidResourceUser = window.WebMonetizationScripts
    .base64url(paidResourceUserBuffer)

  const spspReceiverUrl = new URL(window.WebMonetizationScripts
    .paymentPointerToUrl(paymentPointer))
  spspReceiverUrl.searchParams
    .set('webMonetizationPaidResourceUser', paidResourceUser)
  const spspReceiver = spspReceiverUrl.href

  const donation = await window.WebMonetizationScripts.donate({
    paymentPointer: spspReceiver,
    noRetry,
    noWidget
  })

  function paidResources (url) {
    const paidUrl = new URL(url)
    paidUrl.searchParams
      .set('webMonetizationPaidResourceUser', paidResourceUser)
    return paidUrl.href
  }

  return {
    donation,
    paidResources
  }
}
