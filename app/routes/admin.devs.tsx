import {
  json,
  redirect,
  type ActionFunctionArgs,
  type HeadersArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {
  Form,
  useLoaderData,
  useNavigation,
  type MetaDescriptor,
} from '@remix-run/react'
import {and, desc, eq, inArray, like} from 'drizzle-orm'
import {AlignLeft, ArrowUpRight, CalendarDays} from 'lucide-react'
import {cacheHeader} from 'pretty-cache-header'
import {AdminFilters} from '~/components/admin-filters'
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
import {db} from '~/db'
import {devs, type Expertise} from '~/db/schema'
import {classNames} from '~/utils/misc'
import {commitSession, destroySession, getSession} from '~/utils/session.server'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | Admin - Devs'}]
}

export function headers({loaderHeaders}: HeadersArgs) {
  return {'Cache-Control': loaderHeaders.get('Cache-Control')}
}

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query')
  const filters = url.searchParams.getAll('expertise') as Array<Expertise>
  const data = await db
    .select()
    .from(devs)
    .where(
      and(
        query ? like(devs.name, `%${query}%`) : undefined,
        filters.length ? inArray(devs.expertise, filters) : undefined,
      ),
    )
    .orderBy(desc(devs.createdAt))
    .all()
  const headers = {
    'Cache-Control': cacheHeader({
      public: true,
      maxAge: '10mins',
      sMaxage: '3days',
      staleWhileRevalidate: '1year',
      staleIfError: '1year',
    }),
  }
  return json({data}, {headers})
}

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  const formData = await request.formData()
  const intent = formData.get('intent')
  const devId = formData.get('devId')

  if (!devId || typeof devId !== 'string') {
    throw new Response('Nominee ID is required', {status: 400})
  }

  if (!userId) {
    // This should never happen because we redirect on the
    // _admin layout loader, but better safe than sorry
    return redirect('/', {
      headers: {'set-cookie': await destroySession(session)},
    })
  }

  const dev = await db
    .select({
      name: devs.name,
      from: devs.from,
      expertise: devs.expertise,
      link: devs.link,
      reason: devs.reason,
    })
    .from(devs)
    .where(eq(devs.id, Number(devId)))
    .get()

  if (!dev) throw new Response('Dev not found', {status: 404})

  switch (intent) {
    case 'delete': {
      await db.delete(devs).where(eq(devs.id, Number(devId)))
      session.flash('message', {
        type: 'success',
        content: 'Dev deleted successfully',
      })
      return json(null, {
        status: 204,
        headers: {'set-cookie': await commitSession(session)},
      })
    }

    case 'edit': {
      throw redirect(`/admin/devs/${devId}`)
    }

    default: {
      throw new Response('Invalid form intent', {status: 400})
    }
  }
}

export default function DevsPage() {
  const {data} = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const loading = navigation.state === 'loading'

  return (
    <div>
      <h1 className="mb-6 scroll-m-20 text-2xl font-extrabold lg:text-3xl">
        Devs
      </h1>
      <p className="mb-6 leading-7">
        This is a list of all the devs that have been approved. You can delete
        or edit any of them by clicking the corresponding button below each one.
      </p>

      <div className="mb-6">
        <AdminFilters type="devs" />
      </div>

      <div
        className={classNames('flex flex-col gap-6', {
          'pointer-events-none opacity-40': loading,
        })}
      >
        {data.map(d => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">{d.name}</CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{d.from}</p> -{' '}
                <Badge variant={d.expertise}>• {d.expertise}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2">
                  <CalendarDays className="w-5" />
                  <p className="flex-1">
                    {new Date(d.createdAt).toLocaleDateString('en-US', {
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
                    <a href={d.link} target="_blank" rel="noreferrer">
                      {d.link}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlignLeft className="w-5" />
                  <p className="flex-1">{d.reason}</p>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Form method="POST" className="flex gap-2">
                <input type="hidden" name="devId" value={d.id} />
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
                  Delete
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
          <p className="text-center">Invalid attempt, please try again later</p>
        ),
      }}
    />
  )
}
