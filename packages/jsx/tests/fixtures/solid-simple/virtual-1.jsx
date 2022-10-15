// whyframe:entry-b4be347a.jsx
import { render } from 'solid-js/web'
import { WhyframeApp } from '###/input.jsx__whyframe-b4be347a.jsx'

export function createApp(el) {
  const destroy = render(() => <WhyframeApp />, el)
  return { destroy }
}