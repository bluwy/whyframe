import { useState } from 'react'
import style from './Popup.module.css'

/**
 * @param {{ content: string, children: any }} props
 */
export default function Popup({ content, children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        class={style.activator}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>

      {open && (
        <button class={style.background} onClick={() => setOpen(false)}>
          <p>{content}</p>
        </button>
      )}
    </>
  )
}
