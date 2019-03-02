const parent = document.currentScript.parentElement

function showOrHideParent () {
  if (document.monetization && document.monetization.state === 'started') {
    parent.style.visibility = 'visible'
  } else {
    parent.style.visibility = 'hidden'
  }
}

showOrHideParent()
if (document.monetization) {
  document.monetization.addEventListener('monetizationstart', function () {
    showOrHideParent()
  })
}
