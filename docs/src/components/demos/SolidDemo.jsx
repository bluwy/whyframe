/** @jsxImportSource solid-js */

import whyframe from '@/assets/logo.svg'
import solid from '@/assets/solid.svg'
import css from './Jsx.module.css'

export default function SolidDemo() {
  return (
    <iframe class={css.iframe} data-why title="Package demo">
      <p class={css.p}>
        <img src={whyframe} alt="whyframe" height="80" />
        <span class={css.span}>+</span>
        <img src={solid} alt="solid" height="58" />
      </p>
    </iframe>
  )
}
