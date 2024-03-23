import {useNavigation, useSearchParams} from '@remix-run/react'
import {Loader2} from 'lucide-react'
import * as React from 'react'
import {ExpertiseFilters} from './expertise-filters'
import {Input} from './ui/input'
import {Label} from './ui/label'

export function AdminFilters({type}: {type: 'nominees' | 'devs'}) {
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

  return (
    <div className="flex flex-wrap-reverse items-start justify-between gap-4">
      <div className="relative min-w-60 flex-1">
        <Label htmlFor="search">
          Search {type === 'nominees' ? 'nominees' : 'devs'}
        </Label>
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

      <div>
        <p className="mb-1 text-sm font-medium leading-none">
          Filter by expertise
        </p>
        <ExpertiseFilters />
      </div>
    </div>
  )
}
