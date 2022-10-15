import { useState } from 'react'

export default function One() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-6ab56d5d.jsx"} data-why></iframe>
    </div>
  )
}

export function Two() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-8a4ade41.jsx"} data-why></iframe>
    </div>
  )
}

Two.reference = true
