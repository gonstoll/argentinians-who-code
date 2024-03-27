import {redirect, type LoaderFunctionArgs} from '@remix-run/node'
import {Outlet} from '@remix-run/react'
import {commitSession, getSession} from '~/utils/session.server'

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([
      ['redirectTo', new URL(request.url).pathname],
    ])
    session.flash('message', {
      type: 'error',
      content: 'You must be logged in to access the admin area.',
    })
    throw redirect(`/login?${searchParams}`, {
      headers: {'set-cookie': await commitSession(session)},
    })
  }
  return null
}

export default function AdminLayout() {
  return (
    <div className="mx-auto w-full max-w-screen-md">
      <Outlet />
    </div>
  )
}
