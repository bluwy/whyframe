import { getWhyframeSource } from '@whyframe/core/utils'
import { useEffect, useRef, useState } from 'preact/hooks'

export function Story({ title, src, children }) {
  const iframe = useRef(null)
  const [source, setSource] = useState('')

  useEffect(() => {
    setSource(iframe.current ? getWhyframeSource(iframe.current) : '')
  }, [iframe])

  return (
    <div>
      <p>This is a story of {title}:</p>

      <iframe ref={iframe} data-why title={title} src={src}>
        {children}
      </iframe>

      <details>
        <summary>source</summary>
        <pre>{source}</pre>
      </details>
    </div>
  )
}
