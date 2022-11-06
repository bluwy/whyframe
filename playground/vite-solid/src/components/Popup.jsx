import { createSignal, Show } from 'solid-js'
import style from './Popup.module.css'

/**
 * @param {{ content: string, children: any }} props
 */
export default function Popup(props) {
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <button
        class={style.activator}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        {props.children}
      </button>

      <Show when={open()}>
        <button class={style.background} onClick={() => setOpen(false)}>
          <p>{props.content}</p>
        </button>
      </Show>
    </>
  )
}
