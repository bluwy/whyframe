// whyframe:entry-b4be347a.jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { WhyframeApp } from '###/input.jsx__whyframe-b4be347a.jsx'

export function createApp(el) {
  ReactDOM.render(<WhyframeApp />, el)
  return {
    destroy: () => ReactDOM.unmountComponentAtNode(el)
  }
}