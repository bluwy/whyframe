import { getWhyframeSource } from '@whyframe/core/utils'
import { createSignal } from 'solid-js'

export function Story(props) {
  const [source, setSource] = createSignal('')

  return (
    <div>
      <p>This is a story of {props.title}:</p>

      <iframe
        ref={(el) => el && setSource(getWhyframeSource(el))}
        data-why
        title={props.title}
        src={props.src}
      >
        {props.children}
      </iframe>

      <details>
        <summary>source</summary>
        <pre>{source()}</pre>
      </details>
    </div>
  )
}
