import { Counter } from './Counter.jsx'
import { Story } from './Story.jsx'

export function App() {
  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document
    console.log('warn!')
  }

  return (
    <>
      <h1>Solid</h1>

      <iframe data-why title="Hello">
        <p>Click to increment!</p>
        <Counter />
      </iframe>

      <iframe data-why title="World" src="/frames/basic/index.html">
        <p>Do not go over {max}</p>
        <Counter max={max} onMax={warn} />
      </iframe>

      <Story title="Hello">
        <p>Click to increment!</p>
        <Counter />
      </Story>

      <Story title="World" src="/frames/basic/index.html">
        <p>Do not go over {max}</p>
        <Counter max={max} onMax={warn} />
      </Story>
    </>
  )
}
