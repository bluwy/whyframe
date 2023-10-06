/** @jsxImportSource react */

import whyframe from '@/assets/logo.svg'
import react from '@/assets/react.svg'
import css from '../Jsx.module.css'

export default function ReactDemo() {
  return (
    <iframe className={css.iframe} data-why title="Package demo">
      <p className={css.p}>
        <img src={whyframe.src} alt="whyframe" height="80" />
        <span className={css.span}>+</span>
        <img src={react.src} alt="react" height="70" />
      </p>
    </iframe>
  )
}
