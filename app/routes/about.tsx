import type {MetaDescriptor} from '@remix-run/react'
import {Hero} from '~/components/hero'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | About'}]
}

// Key word for forking: ENCOURAGE
// Possible titles:
// What is it about?
// How can I nominate someone?
// How can I remove my name?
// How did we come up with this idea?
// Who's behind this?
// Any other questions or suggestions?

export default function About() {
  return (
    <section>
      <Hero subtitle="is a place to showcase talented Argentinian developers that are spread around the world." />
      <div className="grid text-sm md:grid-cols-2 [&_p]:leading-relaxed">
        <div className="space-y-3">
          <h2>What is it about?</h2>
          <p>
            We want to give fellow Argentinian developers doing fantastic work a
            place to showcase their work and to inspire others to follow their
            path. We believe that by sharing their stories and their profiles,
            we can help others to see that they can do it too.
          </p>
        </div>
      </div>
    </section>
  )
}
