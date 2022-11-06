/** @type {import('../utils').isWhyframeWarning} */
export function isWhyframeWarning(warning) {
  return (
    !!warning.filename?.includes('__whyframe:') ||
    !!warning.filename?.includes('__whyframe-')
  )
}
