import Head from 'next/head'
import { Counter } from '../components/Counter.jsx'
import { Story } from '../components/Story.jsx'

export default function Home() {
  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document
    console.log('warn!')
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>whyframe next</title>
      </Head>

      <div id="app">
        <h1>Next</h1>

        <iframe data-why title="Hello">
          <p>Click to increment!</p>
          <Counter />
        </iframe>

        <iframe data-why title="World" src="/frames/basic">
          <p>Do not go over {max}</p>
          <Counter max={max} onMax={warn} />
        </iframe>

        <Story title="Hello">
          <p>Click to increment!</p>
          <Counter />
        </Story>

        <Story title="World" src="/frames/basic">
          <p>Do not go over {max}</p>
          <Counter max={max} onMax={warn} />
        </Story>
      </div>
    </>
  )
}
