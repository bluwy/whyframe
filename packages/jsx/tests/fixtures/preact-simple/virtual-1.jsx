// whyframe:entry-b4be347a.jsx
import { render } from 'preact'
import { WhyframeApp } from '###/input.jsx__whyframe-b4be347a.jsx'

export function createApp(el) {
  render(<WhyframeApp />, el)
  return {
    destroy: () => render(null, el)
  }
}