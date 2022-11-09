'use client'

import './page.css'
import { createApp } from 'whyframe:app'

export default function Page() {
  return (
    <>
      <div ref={(el) => createApp(el)}></div>
    </>
  )
}
