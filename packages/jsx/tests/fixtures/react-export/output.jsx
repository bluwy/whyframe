import { useState } from 'react'

export default function One() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-7514b412.jsx"} data-why></iframe>
    </div>
  )
}

export function Two() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-541fb21f.jsx"} data-why></iframe>
    </div>
  )
}

Two.reference = true

export const Three = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-7ad20626.jsx"} data-why></iframe>
    </div>
  )
}

export const Four = function () {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-120b9287.jsx"} data-why></iframe>
    </div>
  )
}
