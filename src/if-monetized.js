const parent = document.currentScript.parentElement

function showOrHideParent () {
  if (document.monetization && document.monetization.state === 'started') {
    parent.style.visibility = 'visible'
    parent.style.display = 'unset'
  } else {
    parent.style.visibility = 'hidden'
    parent.style.display = 'none'
  }
}

showOrHideParent()
if (document.monetization) {
  document.monetization.addEventListener('monetizationstart', function () {
    showOrHideParent()
  })
}
