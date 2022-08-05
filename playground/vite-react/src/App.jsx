import { Counter } from './Counter.jsx'

export function App() {
  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document.
    // TODO: does it make sense to be the latter?
    document.body.style.backgroundColor = 'yellow'
  }

  return (
    <>
      <h1>whyframe</h1>

      <iframe why="true" title="Hello">
        <p>Click to increment!</p>
        <Counter />
      </iframe>

      <iframe why="true" title="World" whyTemplate="basic">
        <p>Do not go over {max}</p>
        <Counter max={max} onMax={warn} />
      </iframe>
    </>
  )
}
