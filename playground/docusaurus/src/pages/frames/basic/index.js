import React from 'react'
import { createApp } from 'whyframe:app'

export default function BasicFrame() {
  return (
    <>
      Test
      <div ref={(el) => createApp(el)}></div>
    </>
  )
}
