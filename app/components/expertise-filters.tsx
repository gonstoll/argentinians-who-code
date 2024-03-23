import {useSearchParams} from '@remix-run/react'
import {expertise, type Expertise} from '~/db/schema'
import {classNames} from '~/utils/misc'
import {Badge} from './ui/badge'

export function ExpertiseFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

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
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-border p-3 md:gap-2 md:p-4">
      {expertise.map(e => {
        const expertiseSearchParams = searchParams.getAll('expertise')
        const isActive =
          expertiseSearchParams.includes(e) || !expertiseSearchParams.length

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
  )
}
