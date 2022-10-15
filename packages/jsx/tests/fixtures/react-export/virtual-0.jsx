// ###/input.jsx__whyframe-6ab56d5d.jsx
import { useState } from 'react'


function One(){}
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


export function Two() {
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

Two.reference = true
