import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import {asc} from 'drizzle-orm'
import {AlignLeft, ArrowUpRight, CalendarDays} from 'lucide-react'
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
import {nominees} from '~/db/schema'
import {destroySession, getSession} from '~/utils/session.server'

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  if (!userId) return redirect('/login')
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

  if (!userId) {
    // This should never happen because we redirect on the loader,
    // but better safe than sorry
    return redirect('/', {
      headers: {'set-cookie': await destroySession(session)},
    })
  }

  switch (intent) {
    case 'approve': {
      // Approve nominee
      break
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
      throw new Response('Invalid intent', {status: 400})
    }
  }
}

export default function Admin() {
  const {data} = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto flex max-w-screen-sm flex-col gap-6">
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
                value="reject"
                variant="destructive"
              >
                Reject
              </Button>
              <Button
                type="submit"
                name="intent"
                value="edit"
                variant="secondary"
              >
                Edit
              </Button>
            </Form>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
