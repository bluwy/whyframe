/** @jsxImportSource preact */

import whyframe from '@/assets/logo.svg'
import preact from '@/assets/preact.svg'
import css from '../Jsx.module.css'

export default function PreactDemo() {
  return (
    <iframe class={css.iframe} data-why title="Package demo">
      <p class={css.p}>
        <img src={whyframe.src} alt="whyframe" height="80" />
        <span class={css.span}>+</span>
        <img src={preact.src} alt="preact" height="70" />
      </p>
    </iframe>
  )
}
