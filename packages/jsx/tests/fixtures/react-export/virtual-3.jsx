// whyframe:entry-541fb21f.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '###/input.jsx__whyframe-541fb21f.jsx'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
  return {
    destroy: () => ReactDOM.createRoot(el).unmount()
  }
}