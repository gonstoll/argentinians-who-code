import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {Form, useNavigation} from '@remix-run/react'
import {Loader2} from 'lucide-react'
import {Button} from '~/components/ui/button'
import {destroySession, getSession} from '~/utils/session.server'

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  if (!userId) {
    return redirect('/')
  }
  return json({})
}

export async function action({request}: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'logout') {
    return redirect('/', {
      headers: {'set-cookie': await destroySession(session)},
    })
  }

  return null
}

export default function Admin() {
  const navigation = useNavigation()
  const loggingOut =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'logout'

  return (
    <div className="mx-auto w-full max-w-screen-sm">
      <Form method="POST">
        <Button type="submit" name="intent" value="logout">
          {loggingOut ? <Loader2 className="mr-2 animate-spin" /> : null}
          Logout
        </Button>
      </Form>
      <h1>Admin</h1>
    </div>
  )
}
