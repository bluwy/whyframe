import { createSignal } from 'solid-js'
import { counter } from './Counter.module.css'

export function Counter(props) {
  const [count, setCount] = createSignal(0)

  const increment = () => {
    const newCount = count() + 1
    if (newCount > (props.max ?? Infinity)) {
      props.onMax?.()
      document.body.style.backgroundColor = 'pink'
      alert('🚨 YOU HAVE BEEN WARNED 🚨')
      return
    }
    setCount(newCount)
  }

  return (
    <button class={counter} onClick={increment}>
      Count is {count()}
    </button>
  )
}
