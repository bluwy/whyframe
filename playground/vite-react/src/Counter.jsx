import { useState } from 'react'

export function Counter({ max = 10, onMax }) {
  const [count, setCount] = useState(0)

  const increment = () => {
    if (max !== 0 && count >= max) {
      onMax?.()
      document.body.style.backgroundColor = 'pink'
      alert('too many clicks')
      return
    }
    setCount(count + 1)
  }

  return <button onClick={increment}>count is {count}</button>
}
