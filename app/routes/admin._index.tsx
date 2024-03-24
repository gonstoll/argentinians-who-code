import {Link} from '@remix-run/react'
import {buttonVariants} from '~/components/ui/button'

export default function AdminIndex() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Welcome to the admin panel</h1>
      <p className="text-base">Select a page to manage:</p>
      <div className="flex gap-4">
        <Link
          to="/admin/nominees"
          className={buttonVariants({variant: 'default'})}
        >
          Nominees
        </Link>
        <Link to="/admin/devs" className={buttonVariants({variant: 'default'})}>
          Devs
        </Link>
      </div>
    </div>
  )
}
