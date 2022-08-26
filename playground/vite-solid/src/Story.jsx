import { getWhyframeSource } from '@whyframe/core/utils'
import { createEffect, createSignal } from 'solid-js'

export function Story({ title, src, children }) {
  /** @type {HTMLIFrameElement} */
  const [iframe, setIframe] = createSignal(null)
  const [source, setSource] = createSignal('')

  createEffect(() => {
    setSource(iframe() ? getWhyframeSource(iframe()) : '')
  }, [iframe])

  return (
    <div>
      <p>This is a story of {title}:</p>

      <iframe ref={(el) => setIframe(el)} data-why title={title} src={src}>
        {children}
      </iframe>

      <details>
        <summary>source</summary>
        <pre>{source()}</pre>
      </details>
    </div>
  )
}
