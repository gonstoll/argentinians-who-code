import type {MetaDescriptor} from '@remix-run/react'
import {Hero} from '~/components/hero'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | About'}]
}

export default function About() {
  return (
    <section>
      <Hero />
      <h1>About</h1>
    </section>
  )
}
