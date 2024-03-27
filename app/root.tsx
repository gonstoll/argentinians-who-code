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
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
  useLocation,
  useNavigation,
} from '@remix-run/react'
import {Analytics} from '@vercel/analytics/react'
import {CornerRightDown, CornerRightUp, Loader2, Menu, X} from 'lucide-react'
import * as React from 'react'
import {Toaster, toast} from 'sonner'
import {GeneralErrorBoundary} from './components/error-boundary'
import {Button, buttonVariants} from './components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
import styles from './globals.css?url'
import {cn} from './lib/utils'
import {ThemeSwitch, useTheme} from './routes/resources.set-theme'
import {ClientHintCheck, getHints} from './utils/client-hints'
import {getEnv} from './utils/env.server'
import {classNames} from './utils/misc'
import {useNonce} from './utils/nonce-provider'
import {commitSession, destroySession, getSession} from './utils/session.server'
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
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;800&display=swap',
    },
  ]
}

export function meta(): Array<MetaDescriptor> {
  return [
    {title: 'AWC | Argentinians who code'},
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
  const message = session.get('message')
  return json(
    {
      isAdmin: Boolean(userId),
      hints: getHints(request),
      theme: getTheme(request),
      ENV: getEnv(),
      message,
    },
    {headers: {'set-cookie': await commitSession(session)}},
  )
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
  isAdmin = false,
  theme = 'light',
}: {
  nonce: string
  children: React.ReactNode
  isAdmin?: boolean
  theme?: Theme
}) {
  return (
    <html lang="en" className={cn(theme, 'h-full')}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="color-scheme"
          content={theme === 'dark' ? 'dark light' : 'light dark'}
        />
        <meta
          name="theme-color"
          content={theme === 'dark' ? '#0c0a09' : '#ffffff'}
        />
        <Links />
      </head>
      <body className="flex h-full flex-col bg-background font-mono text-sm text-foreground">
        <Analytics />
        <Header isAdmin={isAdmin} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function Header({isAdmin = false}: {isAdmin: boolean}) {
  const navigation = useNavigation()
  const location = useLocation()
  const loggingOut =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'logout'

  return (
    <header className="mx-auto flex w-full max-w-screen-lg items-center justify-between gap-6 p-4">
      <Link to="/">AWC</Link>

      {/* Mobile nav */}
      <nav className="flex items-center sm:hidden">
        <ThemeSwitch />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="group">
              <Menu className="hidden h-5 w-5 group-data-[state='closed']:block" />
              <X className="hidden h-5 w-5 group-data-[state='open']:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                asChild
                className={classNames(
                  'block h-10 cursor-pointer px-4 py-2 text-sm text-primary underline-offset-4 hover:underline',
                  {underline: location.pathname === '/about'},
                )}
              >
                <NavLink to="/about">About</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className={classNames(
                  'block h-10 cursor-pointer px-4 py-2 text-sm text-primary underline-offset-4 hover:underline',
                  {underline: location.pathname === '/nominate'},
                )}
              >
                <NavLink to="/nominate">Nominate</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="block h-10 cursor-pointer px-4 py-2 text-sm text-primary underline-offset-4 hover:underline"
              >
                <a
                  href="https://www.buymeacoffee.com/argentinianswhocode"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={classNames(
                    'font-normal',
                    buttonVariants({variant: 'link'}),
                  )}
                >
                  Donate
                </a>
              </DropdownMenuItem>

              {isAdmin ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-bold">
                      Admin
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className={classNames(
                        'block h-10 cursor-pointer px-4 py-2 text-sm text-primary underline-offset-4 hover:underline',
                        {
                          underline:
                            location.pathname.includes('/admin/nominees'),
                        },
                      )}
                    >
                      <NavLink to="/admin/nominees">Nominees</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className={classNames(
                        'block h-10 cursor-pointer px-4 py-2 text-sm text-primary underline-offset-4 hover:underline',
                        {underline: location.pathname.includes('/admin/devs')},
                      )}
                    >
                      <NavLink to="/admin/devs">Devs</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Form method="POST" className="pl-2">
                        <Button type="submit" name="intent" value="logout">
                          {loggingOut ? (
                            <Loader2 className="mr-2 animate-spin" />
                          ) : null}
                          Logout
                        </Button>
                      </Form>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </nav>

      {/* Desktop nav */}
      <nav className="hidden items-center sm:flex">
        <ThemeSwitch />
        <NavLink
          to="/about"
          className={({isActive}) =>
            classNames(buttonVariants({variant: 'link'}), {underline: isActive})
          }
        >
          About
        </NavLink>
        <NavLink
          to="/nominate"
          className={({isActive}) =>
            classNames(buttonVariants({variant: 'link'}), {underline: isActive})
          }
        >
          Nominate
        </NavLink>
        <a
          href="https://www.buymeacoffee.com/argentinianswhocode"
          target="_blank"
          rel="noreferrer noopener"
          className={buttonVariants({variant: 'link'})}
        >
          Donate
        </a>
        {isAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="group gap-2">
                Admin
                <CornerRightDown className="hidden h-3 w-3 group-data-[state='closed']:block" />
                <CornerRightUp className="hidden h-3 w-3 group-data-[state='open']:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  asChild
                  className={classNames(
                    'block h-10 cursor-pointer px-4 py-2 text-sm font-medium text-primary underline-offset-4 hover:underline',
                    {underline: location.pathname.includes('/admin/nominees')},
                  )}
                >
                  <NavLink to="/admin/nominees">Nominees</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className={classNames(
                    'block h-10 cursor-pointer px-4 py-2 text-sm font-medium text-primary underline-offset-4 hover:underline',
                    {underline: location.pathname.includes('/admin/devs')},
                  )}
                >
                  <NavLink to="/admin/devs">Devs</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Form method="POST" className="pl-2">
                    <Button type="submit" name="intent" value="logout">
                      {loggingOut ? (
                        <Loader2 className="mr-2 animate-spin" />
                      ) : null}
                      Logout
                    </Button>
                  </Form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        ) : null}
      </nav>
    </header>
  )
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  const theme = useTheme()
  const nonce = useNonce()

  React.useEffect(() => {
    if (!data.message) return
    if (data.message.type === 'error') {
      toast.error(data.message.content)
    } else {
      toast.success(data.message.content)
    }
  }, [data.message])

  return (
    <Document theme={theme} nonce={nonce} isAdmin={data.isAdmin}>
      <main className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col px-4">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{closeButton: true}}
      />
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
