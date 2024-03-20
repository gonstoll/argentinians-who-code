import type {
  LinkDescriptor,
  LoaderFunctionArgs,
  MetaDescriptor,
} from '@remix-run/node'
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from '@remix-run/react'
import {Analytics} from '@vercel/analytics/react'
import {GeneralErrorBoundary} from './components/error-boundary'
import {buttonVariants} from './components/ui/button'
import styles from './globals.css?url'
import {cn} from './lib/utils'
import {ThemeSwitch, useTheme} from './routes/resources.set-theme'
import {ClientHintCheck, getHints} from './utils/client-hints'
import {getEnv} from './utils/env.server'
import {useNonce} from './utils/nonce-provider'
import {getTheme, type Theme} from './utils/theme.server'

export function links(): Array<LinkDescriptor> {
  return [
    {rel: 'stylesheet', href: styles},
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400..800&display=swap',
    },
  ]
}

export function meta(): Array<MetaDescriptor> {
  return [
    {title: 'Argentinians who code'},
    {name: 'description', content: 'Argentinians who code'},
  ]
}

export async function loader({request}: LoaderFunctionArgs) {
  return json({
    hints: getHints(request),
    theme: getTheme(request),
    ENV: getEnv(),
  })
}

function Document({
  theme = 'light',
  nonce,
  children,
}: {
  theme?: Theme
  nonce: string
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(theme, 'h-full')}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="color-scheme"
          content={theme === 'dark' ? 'dark light' : 'light dark'}
        />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-col bg-background font-mono text-foreground">
        <Analytics />
        <header className="mx-auto flex w-full max-w-screen-lg items-center justify-between p-4">
          <Link to="/">AWC</Link>
          <nav className="flex items-center">
            <ThemeSwitch />
            <Link to="/about" className={buttonVariants({variant: 'link'})}>
              About
            </Link>
            <Link to="/nominate" className={buttonVariants({variant: 'link'})}>
              Nominate
            </Link>
            <a
              href="https://www.buymeacoffee.com/argentinianswhocode"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({variant: 'link'})}
            >
              Donate
            </a>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  const theme = useTheme()
  const nonce = useNonce()

  return (
    <Document theme={theme} nonce={nonce}>
      <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col p-4">
        <Outlet />
      </main>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
        }}
      />
    </Document>
  )
}

export function ErrorBoundary() {
  const nonce = useNonce()

  return (
    <Document nonce={nonce}>
      <main className="flex flex-1 flex-col items-center justify-center">
        <GeneralErrorBoundary />
      </main>
    </Document>
  )
}
