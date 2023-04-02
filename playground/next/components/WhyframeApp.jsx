'use client'

import { createApp } from 'whyframe:app'

export default function WhyframeApp() {
  return (
    <>
      <div ref={(el) => el && createApp(el)}></div>
    </>
  )
}
