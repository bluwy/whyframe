import solidLogo from './assets/solid.svg'
import whyframeLogo from './assets/whyframe.svg'
import Story from './components/Story'
import Popup from './components/Popup'
import style from './App.module.css'

export default function App() {
  return (
    <main>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img
            src="/vite.svg"
            class={`${style.logo} ${style.vite}`}
            alt="vite"
            height="80"
          />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img
            src={solidLogo}
            class={`${style.logo} ${style.solid}`}
            alt="solid"
            height="80"
          />
        </a>
        <a href="https://whyframe.dev" target="_blank">
          <img
            src={whyframeLogo}
            class={`${style.logo} ${style.whyframe}`}
            alt="whyframe"
            height="80"
          />
        </a>
      </div>

      <h1>Vite + Solid + Whyframe</h1>

      <p class={style.docs}>
        Check out the examples below to see component isolation in action!
        <br />
        You can view the source code at <code>src/App.jsx</code>.
        <br />
        Click on the logos above to learn more.
      </p>

      <div class={style.frames}>
        <iframe data-why title="Popup 1">
          <p>Simple usage example</p>
          <Popup content="Hello world">Open popup</Popup>
        </iframe>

        <iframe data-why title="Popup 2" src="/frames/special.html">
          <p>Custom HTML source</p>
          <Popup content="Hello world">Open popup</Popup>
        </iframe>

        <iframe
          data-why
          data-why-show-source
          title="Popup 3"
          src="/frames/special.html"
        >
          <p>Inspect this iframe to view the raw source</p>
          <Popup content="Hello world">Open popup</Popup>
        </iframe>

        <Story title="Popup 4">
          <p>This is a Story component</p>
          <Popup content="Hello world">Open popup</Popup>
        </Story>
      </div>
    </main>
  )
}
