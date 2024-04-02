import {Link, type MetaDescriptor} from '@remix-run/react'
import {Hero} from '~/components/hero'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | About'}]
}

const content = [
  {
    title: 'What is it about?',
    content: (
      <p>
        We want to give fellow Argentinian developers doing fantastic work a
        place to showcase their work and to inspire others to follow their path.
        We believe that by sharing their profiles, we can help others to see
        that they can do it too.
      </p>
    ),
  },
  {
    title: 'How did we come up with this idea?',
    content: (
      <>
        <p>
          We had a lot of inspiration from other websites doing something
          similar, such as{' '}
          <a
            href="https://argentinianswho.design"
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            argentinianswho.design
          </a>
          , which is a forked project from{' '}
          <a
            href="https://brazilianswho.design"
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            brazilianswho.design
          </a>
          . We thought the developer community deserved a similar space to
          showcase their work.
        </p>
        <p>
          This project is{' '}
          <a
            href="https://github.com/gonstoll/argentinians-who-code"
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            open source
          </a>
          . We not only support, but also encourage other people to fork it and
          create similar places for their own communities.
        </p>
      </>
    ),
  },
  {
    title: 'How can I nominate someone?',
    content: (
      <p>
        You can nominate someone by filling out the form on the{' '}
        <Link to="/nominate" className="underline underline-offset-4">
          nominate
        </Link>{' '}
        page.
      </p>
    ),
  },
  {
    title: 'How can I remove my name?',
    content: (
      <p>
        If you have been nominated and would like to remove your name from the
        website, please contact us at{' '}
        <a
          href="mailto:hola@argentinianswhodesign.dev?subject=Remove%20my%20profile"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          hola@argentinianswhodesign.dev
        </a>{' '}
        and we will remove your profile.
      </p>
    ),
  },
  {
    title: "Who's behind this?",
    content: (
      <p>
        Argentinians Who Code (AWC) was created and brought to you by{' '}
        <a
          href="https://gonzalostoll.com"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Gonzalo Stoll
        </a>
        , software engineer, and{' '}
        <a
          href="https://anitalaudado.com"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Ana Laudado
        </a>
        , product designer. If you want to support us or you think what we are
        doing is cool, feel free to{' '}
        <a
          href="https://www.buymeacoffee.com/argentinianswhocode"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer noopener"
        >
          send us a coffee
        </a>
        !
      </p>
    ),
  },
  {
    title: 'Any other questions or suggestions?',
    content: (
      <p>
        We welcome critisism, questions and suggestions with open arms! Feel
        absolutely free to shoot us an email at{' '}
        <a
          href="mailto:hola@argentinianswhocode.dev"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          hola@argentinianswhocode.dev
        </a>
        . We read every email and will get back to you as soon as possible.
      </p>
    ),
  },
]

export default function About() {
  return (
    <section>
      <Hero subtitle="is a place to showcase talented Argentinian developers that are spread around the world." />
      {/* <div className="grid gap-x-6 gap-y-16 text-sm md:grid-cols-2 [&_p]:leading-relaxed"> */}
      <div className="break-inside-avoid gap-x-6 text-sm md:columns-2 [&_p]:leading-relaxed">
        {content.map((c, i) => (
          <div key={i} className="mb-16 break-inside-avoid space-y-3 last:mb-0">
            <h2>{c.title}</h2>
            <div className="space-y-1.5">{c.content}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
