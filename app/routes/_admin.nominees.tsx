import {json, redirect, type ActionFunctionArgs} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import {asc, eq} from 'drizzle-orm'
import {AlignLeft, ArrowUpRight, CalendarDays} from 'lucide-react'
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
import {devs, nominees} from '~/db/schema'
import {destroySession, getSession} from '~/utils/session.server'

export async function loader() {
  const data = await db
    .select()
    .from(nominees)
    .orderBy(asc(nominees.createdAt))
    .all()
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

  switch (intent) {
    case 'approve': {
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
      await db.insert(devs).values(nominee)
      await db.delete(nominees).where(eq(nominees.id, Number(nomineeId)))
      return null
    }

    case 'reject': {
      // Reject nominee
      break
    }

    case 'edit': {
      // Edit nominee
      break
    }

    default: {
      throw new Response('Invalid form intent', {status: 400})
    }
  }
}

export default function Admin() {
  const {data} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="mb-6 scroll-m-20 text-2xl font-extrabold lg:text-4xl">
        Nominees
      </h1>
      <p className="mb-6 leading-7">
        This is a list of all the nominees that have been submitted to the site.
        You can approve, reject, or edit any of them by clicking the
        corresponding button below each nominee.
      </p>

      <div className="flex flex-col gap-6">
        {data.map(n => (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle>{n.name}</CardTitle>
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
                  value="reject"
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
