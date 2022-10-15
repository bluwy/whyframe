import { useState } from 'react'

const One = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-2cee90df.jsx"} data-why></iframe>
    </div>
  )
}

const Two = function () {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-1bf60dd3.jsx"} data-why></iframe>
    </div>
  )
}

Two.reference = true

const count = 0
const Three = () => (
  <div>
    <iframe src={"/__whyframe.html"} data-why-id={"/@id/__whyframe:entry-86116035.jsx"} data-why></iframe>
  </div>
)

// TODO: support this
let Dynamic
if (true) {
  Dynamic = () => (
    <div>
      <iframe data-why>
        <span>{count}</span>
      </iframe>
    </div>
  )
}
