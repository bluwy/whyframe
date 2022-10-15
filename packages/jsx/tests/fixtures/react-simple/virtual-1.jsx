// whyframe:entry-b4be347a.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '###/input.jsx__whyframe-b4be347a.jsx'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
  return {
    destroy: () => ReactDOM.createRoot(el).unmount()
  }
}