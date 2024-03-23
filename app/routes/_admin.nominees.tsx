import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import {and, asc, eq, inArray, like} from 'drizzle-orm'
import {AlignLeft, ArrowUpRight, CalendarDays, Loader2} from 'lucide-react'
import * as React from 'react'
import {GeneralErrorBoundary} from '~/components/error-boundary'
import {Badge} from '~/components/ui/badge'
import {Button} from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {Input} from '~/components/ui/input'
import {Label} from '~/components/ui/label'
import {db} from '~/db'
import {devs, expertise, nominees, type Expertise} from '~/db/schema'
import {classNames} from '~/utils/misc'
import {destroySession, getSession} from '~/utils/session.server'

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query')
  const filters = url.searchParams.getAll('expertise') as Array<Expertise>
  const data = await db
    .select()
    .from(nominees)
    .where(
      and(
        query ? like(nominees.name, `%${query}%`) : undefined,
        filters.length ? inArray(nominees.expertise, filters) : undefined,
      ),
    )
    .orderBy(asc(nominees.createdAt))
    .all()

  console.log('logging data: ', data)
  return json({data})
}

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  const formData = await request.formData()
  const intent = formData.get('intent') // 'approve' | 'reject' | 'edit'
  const nomineeId = formData.get('nomineeId')

  if (!nomineeId) {
    throw new Response('Nominee ID is required', {status: 400})
  }

  if (!userId) {
    // This should never happen because we redirect on the
    // _admin layout loader, but better safe than sorry
    return redirect('/', {
      headers: {'set-cookie': await destroySession(session)},
    })
  }

  const nominee = await db
    .select({
      name: nominees.name,
      from: nominees.from,
      expertise: nominees.expertise,
      link: nominees.link,
      reason: nominees.reason,
    })
    .from(nominees)
    .where(eq(nominees.id, Number(nomineeId)))
    .get()

  if (!nominee) throw new Response('Nominee not found', {status: 404})

  switch (intent) {
    case 'approve': {
      await db.insert(devs).values(nominee)
      await db.delete(nominees).where(eq(nominees.id, Number(nomineeId)))
      return null
    }

    case 'delete': {
      await db.delete(nominees).where(eq(nominees.id, Number(nomineeId)))
      return null
    }

    case 'edit': {
      // Most likely redirect to a new page with the form pre-filled
      return null
    }

    default: {
      throw new Response('Invalid form intent', {status: 400})
    }
  }
}

export default function NomineesPage() {
  const {data} = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const loading = navigation.state === 'loading'
  const searching = loading && searchParams.has('query')

  function handleSearch(term: string) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setSearchParams(
        prev => {
          if (!term) {
            prev.delete('query')
            return prev
          }
          prev.set('query', term)
          return prev
        },
        {preventScrollReset: true},
      )
    }, 300)
  }

  function handleFilters(expertise: Expertise[number]) {
    setSearchParams(
      prev => {
        const expertiseParams = prev.getAll('expertise')
        if (expertiseParams.includes(expertise)) {
          prev.delete('expertise', expertise)
          return prev
        }
        prev.append('expertise', expertise)
        return prev
      },
      {preventScrollReset: true},
    )
  }

  return (
    <div>
      <h1 className="mb-6 scroll-m-20 text-2xl font-extrabold lg:text-3xl">
        Nominees
      </h1>
      <p className="mb-6 leading-7">
        This is a list of all the nominees that have been submitted to the site.
        You can approve, reject, or edit any of them by clicking the
        corresponding button below each nominee.
      </p>

      <div className="mb-6 flex flex-wrap-reverse items-start justify-between gap-4">
        <div className="relative min-w-60 flex-1">
          <Label htmlFor="search">Search nominees</Label>
          <div className="relative">
            <Input
              type="search"
              name="query"
              id="search"
              className="pr-8"
              defaultValue={searchParams.get('query') ?? ''}
              onChange={e => handleSearch(e.target.value)}
            />
            {searching ? (
              <div className="absolute right-2 top-1/2 -translate-y-2/4">
                <Loader2 className="animate-spin" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="inline-block md:float-right">
          <p className="mb-1 text-sm font-medium leading-none">
            Filter by expertise
          </p>
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border p-3 md:gap-2 md:p-4">
            {expertise.map(e => {
              const expertiseSearchParams = searchParams.getAll('expertise')
              const isActive =
                expertiseSearchParams.includes(e) ||
                !expertiseSearchParams.length

              return (
                <Badge
                  key={e}
                  variant={e}
                  className={classNames('cursor-pointer', {
                    'opacity-40': !isActive,
                  })}
                  onClick={() => handleFilters(e)}
                >
                  • {e.toLowerCase()}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>

      <div
        className={classNames('flex flex-col gap-6', {
          'pointer-events-none opacity-40': loading,
        })}
      >
        {data.map(n => (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">{n.name}</CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{n.from}</p> -{' '}
                <Badge variant={n.expertise}>• {n.expertise}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2">
                  <CalendarDays className="w-5" />
                  <p className="flex-1">
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="w-5" />
                  <div className="flex-1">
                    <a href={n.link} target="_blank" rel="noreferrer">
                      {n.link}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlignLeft className="w-5" />
                  <p className="flex-1">{n.reason}</p>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Form method="POST" className="flex gap-2">
                <input type="hidden" name="nomineeId" value={n.id} />
                <Button
                  type="submit"
                  name="intent"
                  value="approve"
                  variant="default"
                >
                  Approve
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="edit"
                  variant="secondary"
                >
                  Edit
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="delete"
                  variant="destructive"
                >
                  Reject
                </Button>
              </Form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        400: () => (
          <p className="text-muted-foreground">
            Invalid attempt, please try again later
          </p>
        ),
      }}
    />
  )
}
