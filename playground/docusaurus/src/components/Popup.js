import React, { useState } from 'react'
import style from './Popup.module.css'

/**
 * @param {{ content: string, children: any }} props
 */
export default function Popup({ content, children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className={style.activator}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>

      {open && (
        <button className={style.background} onClick={() => setOpen(false)}>
          <p>{content}</p>
        </button>
      )}
    </>
  )
}
