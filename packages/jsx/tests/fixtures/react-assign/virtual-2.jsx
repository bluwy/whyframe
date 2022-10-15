// ###/input.jsx__whyframe-1bf60dd3.jsx
import { useState } from 'react'

const One = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <iframe data-why>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>-</button>
        <span>{count}</span>
      </iframe>
    </div>
  )
}


const Two = function(){}
export function WhyframeApp() {
  const [count, setCount] = useState(0)
  return (
    <>
      
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>-</button>
        <span>{count}</span>
      
    </>
  )
}


Two.reference = true

const count = 0
const Three = () => (
  <div>
    <iframe data-why>
      <span>{count}</span>
    </iframe>
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
