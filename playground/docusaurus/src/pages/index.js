import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import { Counter } from '../components/Counter.js'
import { Story } from '../components/Story.js'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()

  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document
    console.log('warn!')
  }

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <div id="app">
          <h1>Docusaurus</h1>

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
      </main>
    </Layout>
  )
}
