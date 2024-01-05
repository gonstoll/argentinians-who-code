import {cssBundleHref} from '@remix-run/css-bundle'
import {json, type LoaderFunctionArgs} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styles from './globals.css'
import {ClientHintCheck, getHints} from './utils/client-hints'
import {getTheme} from './utils/theme.server'
import {useTheme} from './routes/action.set-theme'
import {useNonce} from './utils/nonce-provider'

export function links() {
  return [
    {rel: 'stylesheet', href: styles},
    ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
  ]
}

export async function loader({request}: LoaderFunctionArgs) {
  return json({
    requestInfo: {
      hints: getHints(request),
      userPrefs: {
        theme: getTheme(request),
      },
    },
  })
}

export default function App() {
  const theme = useTheme()
  const nonce = useNonce()

  return (
    <html lang="en" className={theme}>
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
      <body className="bg-background text-foreground">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
