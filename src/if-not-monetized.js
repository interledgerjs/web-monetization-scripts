const parent = document.currentScript.parentElement

function showOrHideParent (timedOut) {
  if (document.monetization && (document.monetization.state === 'started' || !timedOut)) {
    parent.style.visibility = 'hidden'
  } else {
    parent.style.visibility = 'visible'
  }
}

showOrHideParent()
if (document.monetization) {
  document.monetization.addEventListener('monetizationstart', function () {
    showOrHideParent()
  })

  // show if it's been pending too long
  if (document.monetization && document.monetization.state === 'pending') {
    setTimeout(function () {
      showOrHideParent(true)
    }, 3000)
  }
}
