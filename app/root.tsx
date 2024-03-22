import type {
  ActionFunctionArgs,
  LinkDescriptor,
  LoaderFunctionArgs,
  MetaDescriptor,
} from '@remix-run/node'
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import {Analytics} from '@vercel/analytics/react'
import {Loader2} from 'lucide-react'
import {GeneralErrorBoundary} from './components/error-boundary'
import {Button, buttonVariants} from './components/ui/button'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from './components/ui/menubar'
import styles from './globals.css?url'
import {cn} from './lib/utils'
import {ThemeSwitch, useTheme} from './routes/resources.set-theme'
import {ClientHintCheck, getHints} from './utils/client-hints'
import {getEnv} from './utils/env.server'
import {useNonce} from './utils/nonce-provider'
import {destroySession, getSession} from './utils/session.server'
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
    {
      name: 'description',
      content:
        'Argentinians who code is a place to showcase the work of Argentinian developers and engineers. We are a community of people who are passionate about technology, here to celebrate the work of our peers and to help them get the recognition they deserve.',
    },
    {
      name: 'keywords',
      content:
        'argentina, developers, engineers, technology, community, engineer',
    },
  ]
}

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  return json({
    isAdmin: Boolean(userId),
    hints: getHints(request),
    theme: getTheme(request),
    ENV: getEnv(),
  })
}

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  const formData = await request.formData()
  const intent = formData.get('intent')

  switch (intent) {
    case 'logout': {
      if (!userId) return redirect('/login') // This should never happen but better safe than sorry
      return redirect('/', {
        headers: {'set-cookie': await destroySession(session)},
      })
    }

    default: {
      throw new Response('Unknown intent', {status: 400})
    }
  }
}

function Document({
  nonce,
  children,
  theme = 'light',
}: {
  nonce: string
  children: React.ReactNode
  theme?: Theme
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
        <Header />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function Header() {
  const {isAdmin} = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const loggingOut =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'logout'

  return (
    <header className="mx-auto flex w-full max-w-screen-lg items-center justify-between gap-6 p-4">
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
        {isAdmin ? (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className={buttonVariants({variant: 'link'})}>
                Admin
              </MenubarTrigger>
              <MenubarContent align="end">
                <MenubarItem>
                  <Link to="/nominees" className="flex-1">
                    Nominees
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link to="/devs">Devs</Link>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                  <Form method="POST">
                    <Button type="submit" name="intent" value="logout">
                      {loggingOut ? (
                        <Loader2 className="mr-2 animate-spin" />
                      ) : null}
                      Logout
                    </Button>
                  </Form>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        ) : null}
      </nav>
    </header>
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
