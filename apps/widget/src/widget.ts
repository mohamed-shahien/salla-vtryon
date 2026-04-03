import './styles.css'

import { getWidgetApiUrl } from './api.js'
import { renderWidgetPlaceholder } from './ui.js'

function initWidget() {
  if (typeof document === 'undefined') {
    return
  }

  const mountTarget = document.body
  if (!mountTarget) {
    return
  }

  renderWidgetPlaceholder(mountTarget)
  console.info('[widget] Phase 0 scaffold loaded', {
    health: getWidgetApiUrl('/health'),
  })
}

initWidget()
