const wmStyle = document.getElementById('wm-stylesheet') || document.createElement('style')
document.head.appendChild(wmStyle)

function clearStyleRules () {
  const rulesLength = wmStyle.sheet.rules.length
  for (let i = 0; i < rulesLength; ++i) {
    wmStyle.sheet.deleteRule(0)
  }
}

function applyStyleRules (timedOut) {
  clearStyleRules()

  if (document.monetization && document.monetization.state === 'started') {
    wmStyle.sheet.addRule('.wm-if-not-monetized', 'display: none;', 0)
    wmStyle.sheet.addRule('.wm-if-monetized', 'display: unset;', 0)
  } else if (document.monetization && !timedOut) {
    wmStyle.sheet.addRule('.wm-if-not-monetized', 'display: none;', 0)
    wmStyle.sheet.addRule('.wm-if-monetized', 'display: none;', 0)
  } else {
    wmStyle.sheet.addRule('.wm-if-not-monetized', 'display: unset;', 0)
    wmStyle.sheet.addRule('.wm-if-monetized', 'display: none;', 0)
  }
}

applyStyleRules()
if (document.monetization) {
  document.monetization.addEventListener('monetizationstart', function () {
    applyStyleRules()
  })

  if (document.monetization && document.monetization.state === 'pending') {
    setTimeout(function () {
      applyStyleRules(true)
    }, 3000)
  }
}
