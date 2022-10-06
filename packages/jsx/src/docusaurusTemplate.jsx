import { createApp } from 'whyframe:app'
import React from 'react'

export default function DefaultFrame() {
  return <div ref={(el) => createApp(el)}></div>
}
