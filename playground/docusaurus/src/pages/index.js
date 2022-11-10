import React from 'react'
import Layout from '@theme/Layout'
import Story from '../components/Story'
import Popup from '../components/Popup'
import style from './index.module.css'

export default function Home() {
  return (
    <Layout title="Docusaurus + Whyframe">
      <main id="app">
        <div>
          <a href="https://docusaurus.io" target="_blank">
            <img
              src="/img/logo.svg"
              className={`${style.logo} ${style.docusaurus}`}
              alt="docusaurus"
              height="80"
            />
          </a>
          <a href="https://whyframe.dev" target="_blank">
            <img
              src="/img/whyframe.svg"
              className={`${style.logo} ${style.whyframe}`}
              alt="whyframe"
              height="80"
            />
          </a>
        </div>

        <h1>Docusaurus + Whyframe</h1>

        <p className={style.docs}>
          Check out the examples below to see component isolation in action!
          <br />
          You can view the source code at <code>src/pages/index.jsx</code>.
          <br />
          Click on the logos above to learn more.
        </p>

        <div className={style.frames}>
          <iframe data-why title="Popup 1">
            <p>Simple usage example</p>
            <Popup content="Hello world">Open popup</Popup>
          </iframe>

          <iframe data-why title="Popup 2" src="/frames/special/index.html">
            <p>Custom HTML source</p>
            <Popup content="Hello world">Open popup</Popup>
          </iframe>

          <iframe
            data-why
            data-why-show-source
            title="Popup 3"
            src="/frames/special/index.html"
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
    </Layout>
  )
}
