import {redirect, type LoaderFunctionArgs} from '@remix-run/node'
import {Outlet} from '@remix-run/react'
import {getSession} from '~/utils/session.server'

export async function loader({request}: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('cookie'))
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
    const searchParams = new URLSearchParams([
      ['redirectTo', new URL(request.url).pathname],
    ])
    throw redirect(`/login?${searchParams}`)
  }
  return null
}

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-screen-sm">
      <Outlet />
    </div>
  )
}
