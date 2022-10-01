import { getWhyframeSource } from '@whyframe/core/utils'
import { useState } from 'preact/hooks'

export function Story({ title, src, children }) {
  const [source, setSource] = useState('')

  return (
    <div>
      <p>This is a story of {title}:</p>

      <iframe
        ref={(el) => el && setSource(getWhyframeSource(el))}
        data-why
        title={title}
        src={src}
      >
        {children}
      </iframe>

      <details>
        <summary>source</summary>
        <pre>{source}</pre>
      </details>
    </div>
  )
}
