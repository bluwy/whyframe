import Image from 'next/image'
import nextLogo from '../../assets/next.svg'
import whyframeLogo from '../../assets/whyframe.svg'
import Story from '../../components/Story'
import Popup from '../../components/Popup'
import style from './page.module.css'

export default function App() {
  return (
    <main>
      <div className={style.logos}>
        <a href="https://nextjs.org" target="_blank">
          <Image
            src={nextLogo}
            className={`${style.logo} ${style.next}`}
            alt="react"
            height="40"
          />
        </a>
        <a href="https://whyframe.dev" target="_blank">
          <Image
            src={whyframeLogo}
            className={`${style.logo} ${style.whyframe}`}
            alt="whyframe"
            height="80"
          />
        </a>
      </div>

      <h1>Next + Whyframe</h1>

      <p className={style.docs}>
        Check out the examples below to see component isolation in action!
        <br />
        You can view the source code at <code>app/(app)/page.jsx</code>.
        <br />
        Click on the logos above to learn more.
      </p>

      <div className={style.frames}>
        <iframe data-why title="Popup 1">
          <p>Simple usage example</p>
          <Popup content="Hello world">Open popup</Popup>
        </iframe>

        <iframe data-why title="Popup 2" src="/frames/special">
          <p>Custom HTML source</p>
          <Popup content="Hello world">Open popup</Popup>
        </iframe>

        <iframe
          data-why
          data-why-show-source
          title="Popup 3"
          src="/frames/special"
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
