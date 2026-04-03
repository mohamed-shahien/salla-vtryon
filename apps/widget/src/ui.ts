export function renderWidgetPlaceholder(container: HTMLElement) {
  const mount = document.createElement('div')
  mount.dataset.vtryonWidget = 'phase-0'
  mount.className = 'vtryon-widget'
  mount.innerHTML = `
    <button class="vtryon-widget__button" type="button">
      Try-On Widget Placeholder
    </button>
  `

  container.appendChild(mount)
}
