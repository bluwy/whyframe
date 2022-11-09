'use client'

import { createApp } from 'whyframe:app'

export default function Page() {
  return (
    <>
      <div ref={(el) => createApp(el)}></div>
    </>
  )
}
