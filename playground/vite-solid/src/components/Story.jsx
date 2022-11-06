import { createSignal, onMount, Show } from 'solid-js'
import { getWhyframeSource } from '@whyframe/core/utils'
import style from './Story.module.css'

/**
 * @param {{ title: string, src?: string, children: any }} props
 */
export default function Story(props) {
  const [source, setSource] = createSignal('')
  const [showCode, setShowCode] = createSignal(false)

  let iframe
  onMount(() => {
    setSource(getWhyframeSource(iframe))
  })

  return (
    <div class={`story ${style.story}`}>
      <div class={style.bar}>
        <h2 class={style.h2}>{props.title}</h2>
        <button
          class={style.button}
          aria-pressed={showCode()}
          onClick={() => setShowCode((v) => !v)}
        >
          Show code
        </button>
      </div>

      <div class={style.frame}>
        <iframe
          data-why
          ref={iframe}
          class={style.iframe}
          title={props.title}
          src={props?.src ?? '/frames/special.html'}
        >
          {props.children}
        </iframe>
        <Show when={showCode()}>
          <div class={style.code}>
            <pre>{source()}</pre>
          </div>
        </Show>
      </div>
    </div>
  )
}
