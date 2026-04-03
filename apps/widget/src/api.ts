const DEFAULT_API_URL = 'http://localhost:3001'

export function getWidgetApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${DEFAULT_API_URL}${normalizedPath}`
}
