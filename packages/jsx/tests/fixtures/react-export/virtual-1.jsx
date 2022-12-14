// whyframe:entry-7514b412.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '###/input.jsx__whyframe-7514b412.jsx'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
  return {
    destroy: () => ReactDOM.createRoot(el).unmount()
  }
}