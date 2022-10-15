import { useState } from 'react'

export default function One() {
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
