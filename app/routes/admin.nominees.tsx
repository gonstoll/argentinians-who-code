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
import {and, asc, eq, inArray, like} from 'drizzle-orm'
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
import {devs, nominees, type Expertise} from '~/db/schema'
import {classNames} from '~/utils/misc'
import {destroySession, getSession} from '~/utils/session.server'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | Admin - Nominees'}]
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
    .from(nominees)
    .where(
      and(
        query ? like(nominees.name, `%${query}%`) : undefined,
        filters.length ? inArray(nominees.expertise, filters) : undefined,
      ),
    )
    .orderBy(asc(nominees.createdAt))
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
  const intent = formData.get('intent') // 'approve' | 'reject' | 'edit'
  const nomineeId = formData.get('nomineeId')

  if (!nomineeId || typeof nomineeId !== 'string') {
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
      throw redirect(`/admin/nominees/${nomineeId}`)
    }

    default: {
      throw new Response('Invalid form intent', {status: 400})
    }
  }
}

export default function NomineesPage() {
  const {data} = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const loading = navigation.state === 'loading'

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

      <div className="mb-6">
        <AdminFilters type="nominees" />
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
