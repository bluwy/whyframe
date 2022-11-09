'use client'

import { useEffect, useRef, useState } from 'react'
import { getWhyframeSource } from '@whyframe/core/utils'
import style from './Story.module.css'

/**
 * @param {{ title: string, src?: string, children: any }} props
 */
export default function Story(props) {
  const [source, setSource] = useState('')
  const [showCode, setShowCode] = useState(false)

  const iframe = useRef(null)
  useEffect(() => {
    setSource(getWhyframeSource(iframe.current))
  }, [])

  return (
    <div className={`story ${style.story}`}>
      <div className={style.bar}>
        <h2 className={style.h2}>{props.title}</h2>
        <button
          className={style.button}
          aria-pressed={showCode}
          onClick={() => setShowCode((v) => !v)}
        >
          Show code
        </button>
      </div>

      <div className={style.frame}>
        <iframe
          data-why
          ref={iframe}
          className={style.iframe}
          title={props.title}
          src={props?.src ?? '/frames/special'}
        >
          {props.children}
        </iframe>
        {showCode && (
          <div className={style.code}>
            <pre>{source}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
