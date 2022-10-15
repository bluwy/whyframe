// whyframe:entry-6ab56d5d.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '###/input.jsx__whyframe-6ab56d5d.jsx'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
  return {
    destroy: () => ReactDOM.createRoot(el).unmount()
  }
}