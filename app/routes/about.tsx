import type {MetaDescriptor} from '@remix-run/react'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | About'}]
}

export default function About() {
  return <h1>About</h1>
}
